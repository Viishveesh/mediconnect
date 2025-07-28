from flask import Flask, request, jsonify, session, send_from_directory, Blueprint
from flask_cors import CORS
import jwt
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
from dotenv import load_dotenv
import os
import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime, timedelta, timezone
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
import io
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Mail, Message
from routes.db import doctor_profiles_collection, doctor_availability_collection
from routes.doctor_schedule_settings import schedule_settings
from routes.doctor_schedule import doctor_schedule
from routes.google_calendar import google_calendar
from routes.doctor_public_route import doctor_routes
from routes.notifications import notifications, schedule_appointment_reminders
import traceback

load_dotenv()
app = Flask(__name__)
CORS(app)

secret_key = os.getenv('SECRET_KEY')
app.config['SECRET_KEY'] = secret_key
app.secret_key = secret_key

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"])

# Add this to Flask app config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('SENDER_EMAIL')
app.config['MAIL_PASSWORD'] = os.getenv('SENDER_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('SENDER_EMAIL')

mail = Mail(app)
app.mail = mail

# Allowed image extensions only
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def compress_image(image_file, max_size_mb=2, quality=85, max_dimension=1920):
    """
    Compress image file to reduce size while maintaining reasonable quality

    Args:
        image_file: File object from request.files
        max_size_mb: Maximum file size in MB (default: 2MB)
        quality: JPEG quality (1-95, default: 85)
        max_dimension: Maximum width or height (default: 1920px)

    Returns:
        Compressed image as BytesIO object, file extension
    """
    try:
        # Open the image
        image = Image.open(image_file)

        # Convert RGBA to RGB if necessary (for JPEG compatibility)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create a white background
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')

        # Resize if image is too large
        if max(image.size) > max_dimension:
            # Calculate new size maintaining aspect ratio
            ratio = max_dimension / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)

        # Try different compression levels to achieve target size
        for q in [quality, 75, 60, 45, 30]:
            output = io.BytesIO()

            # Always save as JPEG for better compression
            image.save(output, format='JPEG', quality=q, optimize=True)
            output.seek(0)

            # Check if size is acceptable
            size_mb = len(output.getvalue()) / (1024 * 1024)

            if size_mb <= max_size_mb:
                output.seek(0)
                return output, 'jpg'

            output.close()

        # If still too large, resize further
        if max(image.size) > 1280:
            ratio = 1280 / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)

            output = io.BytesIO()
            image.save(output, format='JPEG', quality=60, optimize=True)
            output.seek(0)
            return output, 'jpg'

        # Last resort - very aggressive compression
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=30, optimize=True)
        output.seek(0)
        return output, 'jpg'

    except Exception as e:
        print(f"Error compressing image: {e}")
        # Return original file if compression fails
        image_file.seek(0)
        original_extension = image_file.filename.rsplit('.', 1)[1].lower()
        return image_file, original_extension

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.mediconnect
app.db = db
users_collection = db.users
appointments_collection = db.appointment
messages_collection = db.messages
conversations_collection = db.conversations
doctor_profiles_collection = db.doctor_profiles
patient_profiles_collection = db.patient_profiles
video_sessions_collection = db.video_sessions
doctor_availability_collection = db.doctor_availability
medical_history_collection = db.medical_history
prescriptions_collection = db.prescriptions
visit_notes_collection = db.visit_notes

# Register custom blueprints
app.register_blueprint(doctor_schedule)
app.register_blueprint(google_calendar)
app.register_blueprint(schedule_settings)
app.register_blueprint(doctor_routes)
app.register_blueprint(notifications)


# Signup route
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")

    if users_collection.find_one({
        "email": email
    }):
        return jsonify({
            "message": "User already exists!"
        }), 400

    hashed_password = bcrypt.hashpw(data.get("password").encode('utf-8'), bcrypt.gensalt())
    user = {
        "firstName": data.get("firstName"),
        "lastName": data.get("lastName"),
        "email": email,
        "password": hashed_password,
        "role": data.get("role")
    }

    users_collection.insert_one(user)
    return jsonify({
        "message": "Signup successful!"
    }), 201

# Login route
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        return jsonify({"message": "Invalid Credentials"}), 401

    # Include role and doctorId in the token
    token = jwt.encode({
        "email": email,
        "role": user.get("role"),
        "doctorId": str(user["_id"]),
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "token": token,
        "role": user.get("role"),
        "doctorId": str(user["_id"]),
        "name": f"{user.get('firstName', '')} {user.get('lastName', '')}".strip(),
        "email": user.get("email")
    })

@app.route("/api/request-reset", methods=["POST"])
def request_password_reset():
    data = request.json
    email = data.get("email")

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "No account with that email."}), 404

    token = serializer.dumps(email, salt="password-reset-salt")
    reset_link = f"http://localhost:3000/reset-password?token={token}"

    try:
        msg = Message("Password Reset Request", recipients=[email])
        msg.body = f"Hi {user.get('firstName', '')},\n\nTo reset your password, click the following link:\n\n{reset_link}\n\nIf you did not request this, please ignore this email.\n\nThanks!"
        mail.send(msg)
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify({"message": "Failed to send reset email."}), 500

    return jsonify({"message": "Password reset link sent to your email."})

@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    token = data.get("token")
    new_password = data.get("newPassword")

    print(token)
    print(new_password)

    try:
        email = serializer.loads(token, salt="password-reset-salt", max_age=3600)
    except Exception as e:
        return jsonify({"message": "Invalid or expired token."}), 400

    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

    result = users_collection.update_one(
        {"email": email},
        {"$set": {"password": hashed_password}}
    )

    if result.modified_count == 1:
        return jsonify({"message": "Password updated successfully."})
    else:
        return jsonify({"message": "Something went wrong."}), 500

def send_email_with_ics(name, recipient_email, doctor_name, date_str, time_str):
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.mime.base import MIMEBase
    from email import encoders
    from datetime import datetime, timedelta
    import os

    # Load sender credentials from .env
    sender_email = os.environ.get('SENDER_EMAIL')
    sender_password = os.environ.get('SENDER_PASSWORD')

    if not sender_email or not sender_password:
        raise Exception("Missing sender email credentials in environment variables")

    # Convert date and time strings to datetime objects
    start_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    end_dt = start_dt + timedelta(minutes=30)

    # iCalendar date formatting (UTC)
    dtstamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    dtstart = start_dt.strftime("%Y%m%dT%H%M%S")
    dtend = end_dt.strftime("%Y%m%dT%H%M%S")

    # .ics content
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MediConnect//EN
BEGIN:VEVENT
UID:{doctor_name}-{start_dt.timestamp()}@mediconnect
DTSTAMP:{dtstamp}
DTSTART:{dtstart}
DTEND:{dtend}
SUMMARY:Appointment with {doctor_name}
DESCRIPTION:Your appointment with {doctor_name}.
LOCATION:Online / Clinic
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
"""

    # Create email
    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = recipient_email
    message['Subject'] = 'Appointment Confirmation – MediConnect'

    body = f"""Hi {name},

Your appointment with {doctor_name} is confirmed.

📅 Date: {date_str}  
⏰ Time: {time_str}  
📍 Location: Mediconnect Website

An invitation has been attached to add this to your calendar. Stay Relaxed! We will be sending the reminder before 1 hour of the appointment.

Thank you,  
MediConnect Team
"""
    message.attach(MIMEText(body, 'plain'))

    # Attach ICS file
    ics_part = MIMEBase('text', 'calendar', method="REQUEST", name="appointment.ics")
    ics_part.set_payload(ics_content)
    encoders.encode_base64(ics_part)
    ics_part.add_header('Content-Disposition', 'attachment; filename="appointment.ics"')
    message.attach(ics_part)

    # Send the email
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)
        server.quit()
    except Exception as e:
        raise Exception(f"Failed to send email: {e}")


from functools import wraps

#Verifying the token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 403
        try:
            token = token.split(" ")[1]  # Bearer <token>
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({"email": data['email']})
            if not current_user:
                return jsonify({'message': 'User not found'}), 404
        except Exception as e:
            print(e)
            return jsonify({'message': 'Token is invalid'}), 403
        return f(current_user, *args, **kwargs)
    return decorated


@app.route('/api/book', methods=['POST'])
@token_required
def book_appointment(current_user):
    data = request.get_json()

    date = data.get('date')  # Format: 'YYYY-MM-DD'
    time = data.get('time')  # Format: 'HH:MM'
    doctor_id = data.get('doctorId')
    doctor_name = data.get('doctorName')

    if not all([date, time, doctor_id, doctor_name]):
        return jsonify({"error": "Missing required fields"}), 400

    # Patient info from token
    name = f"{current_user.get('firstName', '')} {current_user.get('lastName', '')}".strip()
    email = current_user.get('email')

    # ❗ Check if the slot is already booked
    existing = appointments_collection.find_one({
        "doctorId": doctor_id,
        "date": date,
        "time": time
    })

    if existing:
        return jsonify({"error": "This appointment slot is already booked."}), 409

    try:
        # Send confirmation email
        send_email_with_ics(name, email, doctor_name, date, time)

        # Insert new appointment
        appointment_doc = {
            "patientName": name,
            "patientEmail": email,
            "doctorId": doctor_id,
            "doctorName": doctor_name,
            "date": date,
            "time": time,
            "bookedAt": datetime.now(timezone.utc)
        }
        result = appointments_collection.insert_one(appointment_doc)

        # Send confirmation email with ICS
        send_email_with_ics(name, email, doctor_name, date, time)

        # Schedule reminders
        schedule_appointment_reminders(
            str(result.inserted_id),
            email,
            doctor_name,
            name,
            date,
            time
        )
        return jsonify({"message": "Appointment booked, confirmation sent, and reminders scheduled"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to book appointment or send email"}), 500

@app.route("/api/appointments/<doctor_id>/<date>", methods=["GET"])
def get_booked_slots(doctor_id, date):
    booked = appointments_collection.find({
        "doctorId": doctor_id,
        "date": date
    })

    times = [slot["time"] for slot in booked]
    return jsonify({"bookedSlots": times})

@app.route("/api/doctor/profile", methods=["POST"])
@token_required
def create_doctor_profile(current_user):
    if current_user.get("role") != "doctor":
        return jsonify({"message": "Access denied. Only doctors can create doctor profiles."}), 403

    data = request.json

    existing_profile = doctor_profiles_collection.find_one({"userId": str(current_user["_id"])})
    if existing_profile:
        return jsonify({"message": "Doctor profile already exists"}), 400

    profile = {
        "userId": str(current_user["_id"]),
        "email": current_user.get("email"),
        "firstName": current_user.get("firstName"),
        "lastName": current_user.get("lastName"),
        "clinicName": data.get("clinicName"),
        "specialization": data.get("specialization"),
        "experience": data.get("experience"),
        "qualification": data.get("qualification"),
        "medicalLicense": data.get("medicalLicense"),
        "consultationFee": data.get("consultationFee"),
        "contactNumber": data.get("contactNumber"),
        "address": data.get("address"),
        "profilePhoto": data.get("profilePhoto"),
        "createdAt": datetime.now(timezone.utc)
    }

    doctor_profiles_collection.insert_one(profile)
    return jsonify({"message": "Doctor profile created successfully"}), 201


# Route to get patient basic info by email
@app.route("/api/doctor/<doctor_id>/patient/<string:patient_email>", methods=["GET"])
@token_required
def get_patient_by_email(current_user, doctor_id, patient_email):
    """Get patient profile by email"""
    try:
        print(current_user)
        if current_user.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403

        if str(current_user['_id']) != doctor_id:
            return jsonify({'error': 'Unauthorized doctor ID'}), 403

        patient_profile = users_collection.find_one({"email": patient_email})
        print(patient_email)
        if not patient_profile:
            return jsonify({'error': 'Patient not found'}), 404

        return jsonify({
            'name': f"{patient_profile.get('firstName', '')} {patient_profile.get('lastName', '')}".strip(),
            'email': patient_profile.get('email'),
            'phone': patient_profile.get('contactNumber', ''),
            'dateOfBirth': patient_profile.get('dateOfBirth', ''),
            'gender': patient_profile.get('gender', ''),
            'bloodType': patient_profile.get('bloodGroup', '') or patient_profile.get('customBloodGroup', '')
        }), 200

    except Exception as e:
        print(f"Error fetching patient by email: {e}")
        return jsonify({'error': 'Failed to fetch patient data'}), 500

# Route to get patient medical history
@app.route("/api/patient/<string:patient_email>/medical-history", methods=["GET"])
@token_required
def get_medical_history(current_user, patient_email):
    """Get medical history for a patient by email"""
    try:
        print(current_user)
        if current_user.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403

        history = list(medical_history_collection.find({"patientEmail": patient_email}))
        for item in history:
            item['_id'] = str(item['_id'])
        return jsonify(history), 200

    except Exception as e:
        print(f"Error fetching medical history: {e}")
        return jsonify({'error': 'Failed to fetch medical history'}), 500

# Route to get patient prescriptions
@app.route("/api/patient/<string:patient_email>/prescriptions", methods=["GET", "POST"])
@token_required
def handle_prescriptions(current_user, patient_email):
    """Get or create prescriptions for a patient by email"""
    try:
        print(current_user)
        if current_user.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403

        # Validate patientEmail
        if not patient_email or patient_email.lower() == 'undefined':
            return jsonify({'error': 'Invalid or missing patient email'}), 400

        # Verify patient exists
        patient = users_collection.find_one({"email": patient_email})
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404

        if request.method == "GET":
            prescriptions = list(prescriptions_collection.find({"patientEmail": patient_email}))
            for item in prescriptions:
                item['_id'] = str(item['_id'])
            return jsonify(prescriptions), 200

        elif request.method == "POST":
            data = request.get_json()
            prescription_doc = {
                "patientEmail": patient_email,
                "doctorId": data.get('doctorId'),
                "medication": data.get('medication'),
                "dosage": data.get('dosage'),
                "frequency": data.get('frequency'),
                "duration": data.get('duration'),
                "instructions": data.get('instructions', ''),
                "refills": data.get('refills', 0),
                "prescribedDate": data.get('prescribedDate', datetime.now(timezone.utc).isoformat()),
                "createdAt": datetime.now(timezone.utc)
            }
            result = prescriptions_collection.insert_one(prescription_doc)
            return jsonify({
                "message": "Prescription added successfully",
                "prescriptionId": str(result.inserted_id)
            }), 201

    except Exception as e:
        print(f"Error handling prescriptions: {e}")
        return jsonify({'error': 'Failed to handle prescriptions'}), 500

# Route to get or create visit notes
@app.route("/api/patient/<string:patient_email>/visit-notes", methods=["GET", "POST"])
@token_required
def handle_visit_notes(current_user, patient_email):
    """Get or create visit notes for a patient by email"""
    try:
        print(current_user)
        if current_user.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403

        if request.method == "GET":
            notes = list(visit_notes_collection.find({"patientEmail": patient_email}))
            for item in notes:
                item['_id'] = str(item['_id'])
            return jsonify(notes), 200

        elif request.method == "POST":
            data = request.get_json()
            note_doc = {
                "patientEmail": patient_email,
                "doctorId": data.get('doctorId'),
                "visitType": data.get('visitType'),
                "chiefComplaint": data.get('chiefComplaint'),
                "diagnosis": data.get('diagnosis'),
                "treatment": data.get('treatment', ''),
                "followUp": data.get('followUp', ''),
                "notes": data.get('notes', ''),
                "visitDate": data.get('visitDate', datetime.now(timezone.utc).isoformat()),
                "createdAt": datetime.now(timezone.utc)
            }
            result = visit_notes_collection.insert_one(note_doc)
            return jsonify({
                "message": "Visit note added successfully",
                "noteId": str(result.inserted_id)
            }), 201

    except Exception as e:
        print(f"Error handling visit notes: {e}")
        return jsonify({'error': 'Failed to handle visit notes'}), 500


@app.route("/api/doctor/profile", methods=["PUT"])
@token_required
def update_doctor_profile(current_user):
    if current_user.get("role") != "doctor":
        return jsonify({"message": "Access denied. Only doctors can update doctor profiles."}), 403

    data = request.json

    existing_profile = doctor_profiles_collection.find_one({"userId": str(current_user["_id"])})
    if not existing_profile:
        return jsonify({"message": "Doctor profile not found"}), 404

    updated_profile = {
        "clinicName": data.get("clinicName"),
        "specialization": data.get("specialization"),
        "experience": data.get("experience"),
        "qualification": data.get("qualification"),
        "medicalLicense": data.get("medicalLicense"),
        "consultationFee": data.get("consultationFee"),
        "contactNumber": data.get("contactNumber"),
        "address": data.get("address"),
        "updatedAt": datetime.now(timezone.utc)
    }

    if data.get("profilePhoto"):
        updated_profile["profilePhoto"] = data.get("profilePhoto")

    doctor_profiles_collection.update_one(
        {"userId": str(current_user["_id"])},
        {"$set": updated_profile}
    )
    return jsonify({"message": "Doctor profile updated successfully"}), 200

@app.route("/api/doctor/profile", methods=["GET"])
@token_required
def get_doctor_profile(current_user):
    if current_user.get("role") != "doctor":
        return jsonify({"message": "Access denied"}), 403

    profile = doctor_profiles_collection.find_one({"userId": str(current_user["_id"])})
    if not profile:
        return jsonify({"message": "Profile not found"}), 404

    profile["_id"] = str(profile["_id"])
    return jsonify(profile)

@app.route("/api/patient/profile", methods=["POST"])
@token_required
def create_patient_profile(current_user):
    if current_user.get("role") != "patient":
        return jsonify({"message": "Access denied. Only patients can create patient profiles."}), 403

    data = request.json

    existing_profile = patient_profiles_collection.find_one({"userId": str(current_user["_id"])})
    if existing_profile:
        return jsonify({"message": "Patient profile already exists"}), 400

    profile = {
        "userId": str(current_user["_id"]),
        "email": current_user.get("email"),
        "firstName": current_user.get("firstName"),
        "lastName": current_user.get("lastName"),
        "dateOfBirth": data.get("dateOfBirth"),
        "gender": data.get("gender"),
        "contactNumber": data.get("contactNumber"),
        "address": data.get("address"),
        "emergencyContact": data.get("emergencyContact"),
        "bloodGroup": data.get("bloodGroup"),
        "customBloodGroup": data.get("customBloodGroup"),
        "allergies": data.get("allergies"),
        "medicalHistory": data.get("medicalHistory"),
        "profilePhoto": data.get("profilePhoto"),
        "createdAt": datetime.now(timezone.utc)
    }

    try:
        result = patient_profiles_collection.insert_one(profile)
        return jsonify({"message": "Patient profile created successfully"}), 201
    except Exception as e:
        return jsonify({"message": f"Error creating profile: {str(e)}"}), 500

@app.route("/api/patient/profile", methods=["PUT"])
@token_required
def update_patient_profile(current_user):
    if current_user.get("role") != "patient":
        return jsonify({"message": "Access denied. Only patients can update patient profiles."}), 403

    data = request.json

    existing_profile = patient_profiles_collection.find_one({"userId": str(current_user["_id"])})
    if not existing_profile:
        return jsonify({"message": "Patient profile not found"}), 404

    updated_profile = {
        "dateOfBirth": data.get("dateOfBirth"),
        "gender": data.get("gender"),
        "contactNumber": data.get("contactNumber"),
        "address": data.get("address"),
        "emergencyContact": data.get("emergencyContact"),
        "bloodGroup": data.get("bloodGroup"),
        "customBloodGroup": data.get("customBloodGroup"),
        "allergies": data.get("allergies"),
        "medicalHistory": data.get("medicalHistory"),
        "updatedAt": datetime.now(timezone.utc)
    }

    if data.get("profilePhoto"):
        updated_profile["profilePhoto"] = data.get("profilePhoto")

    patient_profiles_collection.update_one(
        {"userId": str(current_user["_id"])},
        {"$set": updated_profile}
    )
    return jsonify({"message": "Patient profile updated successfully"}), 200

@app.route("/api/patient/profile", methods=["GET"])
@token_required
def get_patient_profile(current_user):
    if current_user.get("role") != "patient":
        return jsonify({"message": "Access denied"}), 403

    profile = patient_profiles_collection.find_one({"userId": str(current_user["_id"])})
    if not profile:
        return jsonify({"message": "Profile not found"}), 404

    profile["_id"] = str(profile["_id"])
    return jsonify(profile)

@app.route("/api/doctors", methods=["GET"])
@token_required
def get_doctors(current_user):
    # Allow only patients to access this endpoint (optional)
    if current_user.get("role") != "patient":
        return jsonify({"message": "Access denied"}), 403

    doctors_cursor = doctor_profiles_collection.find(
        {},
        {
            "_id": 1,
            "firstName": 1,
            "lastName": 1,
            "specialization": 1,
            "experience": 1,
            "profilePhoto": 1,
            "email": 1,
            "qualification": 1
        }
    )

    doctors = []
    for doc in doctors_cursor:
        doctors.append({
            "id": str(doc["_id"]),
            "name": f"{doc.get('firstName', '')} {doc.get('lastName', '')}".strip(),
            "specialization": doc.get("specialization", ""),
            "experience": doc.get("experience", ""),
            "profilePhoto": f"https://mediconnect-backend-xe6f.onrender.com/api/files/{doc['profilePhoto']}" if doc.get("profilePhoto") else None,
            "email": doc.get("email",""),
            "qualification": doc.get("qualification","")
        })
    return jsonify(doctors)

@app.route('/api/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    user_email = current_user.get('email')
    user_role = current_user.get('role')

    conversations = conversations_collection.find({
        "$or": [
            {"doctor_email": user_email},
            {"patient_email": user_email}
        ]
    }).sort("last_message_time", -1)

    result = []
    for conv in conversations:
        other_user_email = conv.get('patient_email') if user_role == 'doctor' else conv.get('doctor_email')
        other_user = users_collection.find_one({"email": other_user_email})

        if other_user:
            full_name = f"{other_user.get('firstName', '')} {other_user.get('lastName', '')}".strip()
            result.append({
                "id": str(conv.get('_id')),
                "conversation_id": str(conv.get('_id')),
                "other_user_name": full_name,
                "other_user_email": other_user_email,
                "other_user_role": other_user.get('role'),
                "last_message": conv.get('last_message', ''),
                "last_message_time": conv.get('last_message_time'),
                "last_message_sender_email": conv.get('last_message_sender_email', ''),
                "unread_count": conv.get(f'unread_count_{user_role}', 0)
            })

    return jsonify({"conversations": result})

@app.route('/api/conversations/<conversation_id>/messages', methods=['GET'])
@token_required
def get_messages(current_user, conversation_id):
    from bson import ObjectId

    try:
        conversation = conversations_collection.find_one({"_id": ObjectId(conversation_id)})
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404

        user_email = current_user.get('email')
        if user_email not in [conversation.get('doctor_email'), conversation.get('patient_email')]:
            return jsonify({"error": "Unauthorized"}), 403

        messages = messages_collection.find({
            "conversation_id": ObjectId(conversation_id)
        }).sort("timestamp", 1)

        result = []
        for msg in messages:
            sender = users_collection.find_one({"email": msg.get('sender_email')})
            sender_name = f"{sender.get('firstName', '')} {sender.get('lastName', '')}".strip() if sender else "Unknown"

            # Return message text only (no encryption)
            message_data = msg.get('message', '')

            message_item = {
                "id": str(msg.get('_id')),
                "sender_email": msg.get('sender_email'),
                "sender_name": sender_name,
                "sender_role": msg.get('sender_role'),
                "message": message_data,
                "timestamp": msg.get('timestamp'),
                "read": msg.get('read', False),
                "message_type": msg.get('message_type', 'text')
            }

            # Add image attachment info if present
            if msg.get('image_attachment'):
                message_item["image_attachment"] = msg.get('image_attachment')

            result.append(message_item)

        # Mark messages as read for current user
        user_role = current_user.get('role')
        conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {f"unread_count_{user_role}": 0}}
        )

        return jsonify({"messages": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/conversations/<conversation_id>/send', methods=['POST'])
@token_required
def send_message(current_user, conversation_id):
    from bson import ObjectId

    try:
        data = request.get_json()
        message_text = data.get('message', '')
        file_attachment = data.get('file_attachment')

        # Must have either message text or image attachment
        if not message_text and not file_attachment:
            return jsonify({"error": "Message cannot be empty"}), 400

        conversation = conversations_collection.find_one({"_id": ObjectId(conversation_id)})
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404

        user_email = current_user.get('email')
        user_role = current_user.get('role')

        if user_email not in [conversation.get('doctor_email'), conversation.get('patient_email')]:
            return jsonify({"error": "Unauthorized"}), 403

        # Create message with text and/or file attachment
        message_doc = {
            "conversation_id": ObjectId(conversation_id),
            "sender_email": user_email,
            "sender_role": user_role,
            "message": message_text,
            "timestamp": datetime.now(timezone.utc),
            "read": False,
            "message_type": "image" if file_attachment else "text"
        }

        # Add image attachment info if present
        if file_attachment:
            message_doc["image_attachment"] = {
                "file_id": file_attachment.get('file_id'),
                "original_name": file_attachment.get('original_name'),
                "file_size": file_attachment.get('file_size'),
                "file_type": file_attachment.get('file_type')
            }

        messages_collection.insert_one(message_doc)

        # Update conversation with last message
        other_role = 'patient' if user_role == 'doctor' else 'doctor'
        last_message = message_text if message_text else f"🖼️ {file_attachment.get('original_name', 'Image')}"

        conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$set": {
                    "last_message": last_message,
                    "last_message_time": datetime.now(timezone.utc),
                    "last_message_sender_email": user_email
                },
                "$inc": {f"unread_count_{other_role}": 1}
            }
        )

        return jsonify({"message": "Message sent successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/conversations/start', methods=['POST'])
@token_required
def start_conversation(current_user):
    data = request.get_json()
    other_user_email = data.get('other_user_email')

    if not other_user_email:
        return jsonify({"error": "Other user email is required"}), 400

    other_user = users_collection.find_one({"email": other_user_email})
    if not other_user:
        return jsonify({"error": "User not found"}), 404

    user_email = current_user.get('email')
    user_role = current_user.get('role')
    other_role = other_user.get('role')

    # Ensure it's a doctor-patient conversation
    if {user_role, other_role} != {'doctor', 'patient'}:
        return jsonify({"error": "Conversations only allowed between doctors and patients"}), 400

    # Check if conversation already exists
    existing_conv = conversations_collection.find_one({
        "$or": [
            {"doctor_email": user_email, "patient_email": other_user_email},
            {"doctor_email": other_user_email, "patient_email": user_email}
        ]
    })

    if existing_conv:
        return jsonify({
            "conversation_id": str(existing_conv.get('_id')),
            "message": "Conversation already exists"
        })

    # Create new conversation
    doctor_email = user_email if user_role == 'doctor' else other_user_email
    patient_email = other_user_email if user_role == 'doctor' else user_email

    conversation_doc = {
        "doctor_email": doctor_email,
        "patient_email": patient_email,
        "created_at": datetime.now(timezone.utc),
        "last_message": "",
        "last_message_time": datetime.now(timezone.utc),
        "unread_count_doctor": 0,
        "unread_count_patient": 0
    }

    result = conversations_collection.insert_one(conversation_doc)

    return jsonify({
        "conversation_id": str(result.inserted_id),
        "message": "Conversation created successfully"
    }), 201

@app.route('/api/conversations/<conversation_id>/key-exchange/initiate', methods=['POST'])
@token_required
def initiate_key_exchange(current_user, conversation_id):
    """Initiate Diffie-Hellman key exchange for a conversation"""
    try:
        data = request.get_json()
        public_key = data.get('public_key')

        if not public_key:
            return jsonify({"error": "Public key is required"}), 400

        # Verify conversation exists and user is part of it
        try:
            conversation_obj_id = ObjectId(conversation_id)
        except:
            return jsonify({"error": "Invalid conversation ID"}), 400

        conversation = conversations_collection.find_one({"_id": conversation_obj_id})
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404

        user_email = current_user.get('email')
        if user_email not in [conversation.get('doctor_email'), conversation.get('patient_email')]:
            return jsonify({"error": "Access denied"}), 403

        # Store the public key for this user in the conversation
        update_data = {
            f"dh_public_key_{user_email.replace('.', '_').replace('@', '_at_')}": public_key,
            f"dh_key_updated_{user_email.replace('.', '_').replace('@', '_at_')}": datetime.now(timezone.utc)
        }

        conversations_collection.update_one(
            {"_id": conversation_obj_id},
            {"$set": update_data}
        )

        return jsonify({
            "message": "Key exchange initiated successfully",
            "conversation_id": conversation_id
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to initiate key exchange"}), 500

@app.route('/api/conversations/<conversation_id>/key-exchange/complete', methods=['POST'])
@token_required
def complete_key_exchange(current_user, conversation_id):
    """Complete Diffie-Hellman key exchange by providing public key and getting other party's key"""
    try:
        data = request.get_json()
        public_key = data.get('public_key')

        if not public_key:
            return jsonify({"error": "Public key is required"}), 400

        # Verify conversation exists and user is part of it
        try:
            conversation_obj_id = ObjectId(conversation_id)
        except:
            return jsonify({"error": "Invalid conversation ID"}), 400

        conversation = conversations_collection.find_one({"_id": conversation_obj_id})
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404

        user_email = current_user.get('email')
        if user_email not in [conversation.get('doctor_email'), conversation.get('patient_email')]:
            return jsonify({"error": "Access denied"}), 403

        # Determine other user's email
        other_email = conversation.get('doctor_email') if user_email == conversation.get('patient_email') else conversation.get('patient_email')

        # Store this user's public key
        user_key_field = f"dh_public_key_{user_email.replace('.', '_').replace('@', '_at_')}"
        other_key_field = f"dh_public_key_{other_email.replace('.', '_').replace('@', '_at_')}"

        update_data = {
            user_key_field: public_key,
            f"dh_key_updated_{user_email.replace('.', '_').replace('@', '_at_')}": datetime.now(timezone.utc)
        }

        conversations_collection.update_one(
            {"_id": conversation_obj_id},
            {"$set": update_data}
        )

        # Fetch updated conversation to get other party's public key
        updated_conversation = conversations_collection.find_one({"_id": conversation_obj_id})
        other_public_key = updated_conversation.get(other_key_field)

        response_data = {
            "message": "Key exchange completed successfully",
            "conversation_id": conversation_id,
            "other_public_key": other_public_key
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"error": "Failed to complete key exchange"}), 500


@app.route('/api/upload', methods=['POST'])
@token_required
def upload_image(current_user):
    """Upload image for messaging"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No image selected"}), 400

        if file and allowed_file(file.filename):
            # Get original file info
            original_filename = secure_filename(file.filename)
            file_content = file.read()
            original_size = len(file_content)
            file.seek(0)  # Reset file pointer

            # Compress the image
            print(f"Compressing image: {original_filename}, original size: {original_size / 1024 / 1024:.2f} MB")
            compressed_file, compressed_extension = compress_image(file)

            # Generate unique filename with compressed extension
            unique_filename = f"{uuid.uuid4().hex}_{original_filename.rsplit('.', 1)[0]}.{compressed_extension}"

            # Ensure upload directory exists
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

            # Save compressed file
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

            if hasattr(compressed_file, 'read'):
                # It's a BytesIO object from compression
                with open(filepath, 'wb') as f:
                    f.write(compressed_file.read())
                compressed_file.close()
            else:
                # It's the original file (compression failed)
                compressed_file.save(filepath)

            # Get compressed file info
            compressed_size = os.path.getsize(filepath)
            compression_ratio = (1 - compressed_size / original_size) * 100 if original_size > 0 else 0

            print(f"Compression complete: {compressed_size / 1024 / 1024:.2f} MB, saved {compression_ratio:.1f}%")

            return jsonify({
                "message": "Image uploaded and compressed successfully",
                "file_id": unique_filename,
                "original_name": original_filename,
                "file_size": compressed_size,
                "file_type": compressed_extension,
                "compression_stats": {
                    "original_size": original_size,
                    "compressed_size": compressed_size,
                    "compression_ratio": f"{compression_ratio:.1f}%"
                }
            }), 201
        else:
            return jsonify({"error": "Only image files (PNG, JPG, JPEG, GIF) are allowed"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/files/<filename>')
def serve_image(filename):
    """Serve uploaded images"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({"error": "File not found"}), 404


# Video Session Management Routes
@app.route('/api/video/session/create', methods=['POST'])
@token_required
def create_video_session(current_user):
    """Create a new video session for an appointment"""
    try:
        data = request.get_json()
        appointment_id = data.get('appointment_id')

        if not appointment_id:
            return jsonify({"error": "Appointment ID is required"}), 400

        # Verify the appointment exists and user has access
        appointment = appointments_collection.find_one({"_id": ObjectId(appointment_id)})
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        user_email = current_user.get('email')
        user_role = current_user.get('role')

        # Check if user has access to this appointment
        has_access = False
        if user_role == 'doctor' and appointment.get('doctorName') in [f"Dr. {current_user.get('firstName')} {current_user.get('lastName')}", f"{current_user.get('firstName')} {current_user.get('lastName')}"]:
            has_access = True
        elif user_role == 'patient' and appointment.get('patientEmail') == user_email:
            has_access = True

        if not has_access:
            return jsonify({"error": "Access denied to this appointment"}), 403

        # Check if session already exists for this appointment
        existing_session = video_sessions_collection.find_one({"appointment_id": appointment_id})
        if existing_session and existing_session.get('status') == 'active':
            return jsonify({
                "session_id": str(existing_session['_id']),
                "room_id": existing_session['room_id'],
                "status": existing_session['status'],
                "created_at": existing_session['created_at']
            }), 200

        # Create new video session
        room_id = f"room_{uuid.uuid4().hex[:12]}"
        session_doc = {
            "appointment_id": appointment_id,
            "room_id": room_id,
            "doctor_email": appointment.get('doctorName', '').lower().replace(' ', '.') + '@mediconnect.com',  # Placeholder
            "patient_email": appointment.get('patientEmail'),
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "created_by": user_email,
            "participants": [],
            "session_data": {
                "appointment_date": appointment.get('date'),
                "appointment_time": appointment.get('time'),
                "doctor_name": appointment.get('doctorName'),
                "patient_name": appointment.get('patientName')
            }
        }

        result = video_sessions_collection.insert_one(session_doc)

        return jsonify({
            "session_id": str(result.inserted_id),
            "room_id": room_id,
            "status": "active",
            "message": "Video session created successfully"
        }), 201

    except Exception as e:
        print(f"Error creating video session: {e}")
        return jsonify({"error": "Failed to create video session"}), 500

@app.route('/api/video/session/<session_id>/join', methods=['POST'])
@token_required
def join_video_session(current_user, session_id):
    """Join an existing video session"""
    try:
        session = video_sessions_collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Video session not found"}), 404

        user_email = current_user.get('email')
        user_role = current_user.get('role')

        # Verify user has access to this session
        if user_role == 'patient' and session.get('patient_email') != user_email:
            return jsonify({"error": "Access denied"}), 403
        elif user_role == 'doctor' and session.get('doctor_email') != user_email:
            # For demo purposes, allow any doctor to join
            pass

        if session.get('status') != 'active':
            return jsonify({"error": "Session is not active"}), 400

        # Add participant to session
        participant = {
            "email": user_email,
            "role": user_role,
            "name": f"{current_user.get('firstName')} {current_user.get('lastName')}",
            "joined_at": datetime.now(timezone.utc)
        }

        # Update participants list
        video_sessions_collection.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$addToSet": {"participants": participant},
                "$set": {"last_activity": datetime.now(timezone.utc)}
            }
        )

        return jsonify({
            "room_id": session['room_id'],
            "session_data": session['session_data'],
            "message": "Successfully joined video session"
        }), 200

    except Exception as e:
        print(f"Error joining video session: {e}")
        return jsonify({"error": "Failed to join video session"}), 500

@app.route('/api/video/session/<session_id>/end', methods=['POST'])
@token_required
def end_video_session(current_user, session_id):
    """End a video session"""
    try:
        session = video_sessions_collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Video session not found"}), 404

        user_email = current_user.get('email')
        user_role = current_user.get('role')

        # Only doctor or session creator can end the session
        if user_role != 'doctor' and session.get('created_by') != user_email:
            return jsonify({"error": "Only doctors can end the session"}), 403

        # Update session status
        video_sessions_collection.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {
                    "status": "ended",
                    "ended_at": datetime.now(timezone.utc),
                    "ended_by": user_email
                }
            }
        )

        return jsonify({"message": "Video session ended successfully"}), 200

    except Exception as e:
        print(f"Error ending video session: {e}")
        return jsonify({"error": "Failed to end video session"}), 500

@app.route('/api/video/session/<session_id>/status', methods=['GET'])
@token_required
def get_session_status(current_user, session_id):
    """Get current status of a video session"""
    try:
        session = video_sessions_collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Video session not found"}), 404

        user_email = current_user.get('email')

        # Check access
        if (session.get('patient_email') != user_email and
                session.get('doctor_email') != user_email and
                session.get('created_by') != user_email):
            return jsonify({"error": "Access denied"}), 403

        return jsonify({
            "status": session.get('status'),
            "room_id": session.get('room_id'),
            "participants": session.get('participants', []),
            "session_data": session.get('session_data', {}),
            "created_at": session.get('created_at'),
            "last_activity": session.get('last_activity')
        }), 200

    except Exception as e:
        print(f"Error getting session status: {e}")
        return jsonify({"error": "Failed to get session status"}), 500

@app.route('/api/appointments/<appointment_id>/video-session', methods=['GET'])
@token_required
def get_appointment_video_session(current_user, appointment_id):
    """Get video session for a specific appointment"""
    try:
        # Verify appointment access
        appointment = appointments_collection.find_one({"_id": ObjectId(appointment_id)})
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        user_email = current_user.get('email')
        user_role = current_user.get('role')

        # Check access
        has_access = False
        if user_role == 'patient' and appointment.get('patientEmail') == user_email:
            has_access = True
        elif user_role == 'doctor':
            # For demo purposes, allow any doctor
            has_access = True

        if not has_access:
            return jsonify({"error": "Access denied"}), 403

        # Find active session for this appointment
        session = video_sessions_collection.find_one({
            "appointment_id": appointment_id,
            "status": "active"
        })

        if session:
            return jsonify({
                "exists": True,
                "session_id": str(session['_id']),
                "room_id": session['room_id'],
                "status": session['status'],
                "participants": session.get('participants', [])
            }), 200
        else:
            return jsonify({"exists": False}), 200

    except Exception as e:
        print(f"Error getting appointment video session: {e}")
        return jsonify({"error": "Failed to get video session"}), 500

@app.route('/api/appointments', methods=['GET'])
@token_required
def get_appointments(current_user):
    try:
        user_email = current_user['email']
        user_role = current_user.get('role')

        if user_role == 'patient':
            appointments = list(appointments_collection.find({"patientEmail": user_email}))
        elif user_role == 'doctor':
            doctor_name = f"Dr. {current_user.get('firstName', '')} {current_user.get('lastName', '')}".strip()
            appointments = list(appointments_collection.find({"doctorName": doctor_name}))
        else:
            return jsonify({"error": "Invalid user role"}), 400

        for appt in appointments:
            appt['_id'] = str(appt['_id'])
            appointment_datetime = datetime.strptime(f"{appt['date']} {appt['time']}", "%Y-%m-%d %H:%M")
            current_datetime = datetime.now()
            appt['status'] = 'upcoming' if appointment_datetime > current_datetime else 'completed'

            doctor_id = appt.get('doctorId')

            if doctor_id:
                try:
                    doctor_obj_id = ObjectId(doctor_id)
                    doctor_profile = doctor_profiles_collection.find_one({"_id": doctor_obj_id})

                    if doctor_profile and 'profilePhoto' in doctor_profile:
                        appt['avatar'] = doctor_profile['profilePhoto']
                    else:
                        appt['avatar'] = None
                except Exception as e:
                    print(f"DEBUG: Error in doctorId lookup: {e}")
                    appt['avatar'] = None
            else:
                appt['avatar'] = None


            if user_role == 'doctor':
                appt['specialization'] = current_user.get('specialization', 'Not specified')

        return jsonify({"appointments": appointments}), 200

    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return jsonify({"error": "Failed to fetch appointments"}), 500




# doctor appointments endpoint
@app.route('/api/doctor/<doctor_id>/appointments/today', methods=['GET'])
@token_required
def get_doctor_today_appointments(current_user, doctor_id):
    """Get today's and upcoming appointments for a doctor"""
    try:
        if current_user.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403

        # Get today's date
        today = datetime.now().date()
        today_str = today.strftime('%Y-%m-%d')

        # Get doctor profile to find the correct doctor name
        doctor_profile = doctor_profiles_collection.find_one({"userId": doctor_id})
        if not doctor_profile:
            doctor_profile = doctor_profiles_collection.find_one({"_id": ObjectId(doctor_id)})

        # Try multiple ways to match appointments
        doctor_name_variations = []
        if doctor_profile:
            first_name = doctor_profile.get('firstName', '')
            last_name = doctor_profile.get('lastName', '')
            doctor_name_variations.extend([
                f"Dr. {first_name} {last_name}".strip(),
                f"{first_name} {last_name}".strip(),
                f"Dr {first_name} {last_name}".strip(),
                f"Dr.{first_name} {last_name}".strip()
            ])

        # Also try with current user info
        user_first = current_user.get('firstName', '')
        user_last = current_user.get('lastName', '')
        if user_first or user_last:
            doctor_name_variations.extend([
                f"Dr. {user_first} {user_last}".strip(),
                f"{user_first} {user_last}".strip(),
                f"Dr {user_first} {user_last}".strip()
            ])

        print(f"Searching for appointments with doctor variations: {doctor_name_variations}")
        print(f"Doctor ID: {doctor_id}")

        # Query appointments for today using multiple criteria
        today_query = {
            '$and': [
                {'date': today_str},
                {
                    '$or': [
                        {'doctorId': doctor_id},
                        {'doctorId': str(doctor_id)},
                        {'doctorName': {'$in': doctor_name_variations}}
                    ]
                }
            ]
        }

        today_appointments = list(appointments_collection.find(today_query).sort('time', 1))

        # Query upcoming appointments (next 7 days)
        upcoming_query = {
            '$and': [
                {'date': {'$gt': today_str}},
                {
                    '$or': [
                        {'doctorId': doctor_id},
                        {'doctorId': str(doctor_id)},
                        {'doctorName': {'$in': doctor_name_variations}}
                    ]
                }
            ]
        }

        upcoming_appointments = list(appointments_collection.find(upcoming_query).sort([('date', 1), ('time', 1)]).limit(10))

        # Convert ObjectIds to strings
        for apt in today_appointments + upcoming_appointments:
            apt['_id'] = str(apt['_id'])

        print(f"Found {len(today_appointments)} today appointments and {len(upcoming_appointments)} upcoming appointments")

        return jsonify({
            'today': today_appointments,
            'upcoming': upcoming_appointments,
            'debug': {
                'doctor_id': doctor_id,
                'doctor_names_searched': doctor_name_variations,
                'today_date': today_str
            }
        }), 200

    except Exception as e:
        print(f"Error fetching doctor appointments: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch appointments'}), 500

# 2. Doctor patients endpoint
@app.route('/api/doctor/<doctor_id>/patients', methods=['GET'])
@token_required
def get_doctor_patients(current_user, doctor_id):
    """Get all patients for a doctor"""
    try:
        if current_user.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403

        # Get doctor profile to find the correct doctor name
        doctor_profile = doctor_profiles_collection.find_one({"userId": doctor_id})
        if not doctor_profile:
            doctor_profile = doctor_profiles_collection.find_one({"_id": ObjectId(doctor_id)})

        # Build doctor name variations
        doctor_name_variations = []
        if doctor_profile:
            first_name = doctor_profile.get('firstName', '')
            last_name = doctor_profile.get('lastName', '')
            doctor_name_variations.extend([
                f"Dr. {first_name} {last_name}".strip(),
                f"{first_name} {last_name}".strip(),
                f"Dr {first_name} {last_name}".strip(),
                f"Dr.{first_name} {last_name}".strip()
            ])

        # Also try with current user info
        user_first = current_user.get('firstName', '')
        user_last = current_user.get('lastName', '')
        if user_first or user_last:
            doctor_name_variations.extend([
                f"Dr. {user_first} {user_last}".strip(),
                f"{user_first} {user_last}".strip(),
                f"Dr {user_first} {user_last}".strip()
            ])

        # Get unique patient emails from appointments using aggregation
        pipeline = [
            {
                '$match': {
                    '$or': [
                        {'doctorId': doctor_id},
                        {'doctorId': str(doctor_id)},
                        {'doctorName': {'$in': doctor_name_variations}}
                    ]
                }
            },
            {
                '$group': {
                    '_id': '$patientEmail',
                    'patientName': {'$first': '$patientName'},
                    'lastVisit': {'$max': '$date'},
                    'totalVisits': {'$sum': 1}
                }
            },
            {'$sort': {'lastVisit': -1}}
        ]

        patients_data = list(appointments_collection.aggregate(pipeline))

        # Format response and get additional patient info
        patients = []
        for patient in patients_data:
            # Try to get patient profile for additional info
            patient_profile = patient_profiles_collection.find_one({
                'email': patient['_id']
            })

            # Calculate age if birth date is available
            age = None
            if patient_profile and patient_profile.get('dateOfBirth'):
                try:
                    birth_date = datetime.strptime(patient_profile['dateOfBirth'], '%Y-%m-%d').date()
                    today = datetime.now().date()
                    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                except:
                    age = None

            patients.append({
                'email': patient['_id'],
                'name': patient['patientName'],
                'lastVisit': patient['lastVisit'],
                'totalVisits': patient['totalVisits'],
                'phone': patient_profile.get('contactNumber') if patient_profile else None,
                'age': age,
                'bloodGroup': patient_profile.get('bloodGroup') if patient_profile else None
            })

        print(f"Found {len(patients)} patients for doctor {doctor_id}")
        return jsonify(patients), 200

    except Exception as e:
        print(f"Error fetching doctor patients: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch patients'}), 500


# Enhanced doctor search endpoint
@app.route('/api/doctors/search', methods=['GET'])
@token_required
def search_doctors(current_user):
    """Search doctors with filters"""
    try:
        specialty = request.args.get('specialty')
        location = request.args.get('location')
        availability_date = request.args.get('date')

        # Build query
        query = {}
        if specialty and specialty.lower() != 'all':
            query['specialization'] = {'$regex': specialty, '$options': 'i'}

        # Find doctors matching criteria
        doctors_cursor = doctor_profiles_collection.find(query)
        doctors = []

        for doc in doctors_cursor:
            # Check availability if date specified
            available = True
            if availability_date:
                availability_count = doctor_availability_collection.count_documents({
                    'doctorId': ObjectId(doc['userId']),
                    'startTime': {
                        '$gte': datetime.fromisoformat(availability_date),
                        '$lt': datetime.fromisoformat(availability_date) + timedelta(days=1)
                    }
                })
                available = availability_count > 0

            if available:
                doctors.append({
                    '_id': str(doc['_id']),
                    'userId': doc['userId'],
                    'name': f"{doc.get('firstName', '')} {doc.get('lastName', '')}".strip(),
                    'email': doc.get('email', ''),
                    'specialization': doc.get('specialization', ''),
                    'experience': doc.get('experience', ''),
                    'qualification': doc.get('qualification', ''),
                    'profilePhoto': f"https://mediconnect-backend-xe6f.onrender.com/uploads/{doc['profilePhoto']}" if doc.get('profilePhoto') else '',
                    'consultationFee': doc.get('consultationFee', ''),
                    'rating': doc.get('rating', 0)
                })

        return jsonify(doctors), 200

    except Exception as e:
        print(f"Error searching doctors: {e}")
        return jsonify({'error': 'Failed to search doctors'}), 500

# Patient appointments endpoint
@app.route('/api/patient/appointments', methods=['GET'])
@token_required
def get_patient_appointments(current_user):
    """Get all appointments for current patient"""
    try:
        if current_user.get('role') != 'patient':
            return jsonify({'error': 'Access denied'}), 403

        patient_email = current_user.get('email')

        # Get all appointments for this patient
        appointments = list(appointments_collection.find({
            'patientEmail': patient_email
        }).sort([('date', -1), ('time', -1)]))

        # Convert ObjectIds to strings and add additional info
        for apt in appointments:
            apt['_id'] = str(apt['_id'])

            # Try to get doctor info
            doctor_profile = doctor_profiles_collection.find_one({
                'userId': apt.get('doctorId')
            })
            if doctor_profile:
                apt['doctorSpecialty'] = doctor_profile.get('specialization', '')
                apt['doctorPhoto'] = doctor_profile.get('profilePhoto', '')

        return jsonify({'appointments': appointments}), 200

    except Exception as e:
        print(f"Error fetching patient appointments: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500

# Single doctor details endpoint
@app.route('/api/doctors/<doctor_id>/details', methods=['GET'])
@token_required
def get_doctor_details(current_user, doctor_id):
    """Get detailed information about a specific doctor"""
    try:
        # Find doctor by profile ID or user ID
        doctor = doctor_profiles_collection.find_one({
            '$or': [
                {'_id': ObjectId(doctor_id)},
                {'userId': doctor_id}
            ]
        })

        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404

        # Get additional stats
        total_appointments = appointments_collection.count_documents({
            'doctorId': doctor['userId']
        })

        # Calculate average rating (placeholder - implement rating system)
        avg_rating = 4.5  # Placeholder

        doctor_details = {
            '_id': str(doctor['_id']),
            'userId': doctor['userId'],
            'name': f"{doctor.get('firstName', '')} {doctor.get('lastName', '')}".strip(),
            'email': doctor.get('email', ''),
            'specialization': doctor.get('specialization', ''),
            'experience': doctor.get('experience', ''),
            'qualification': doctor.get('qualification', ''),
            'medicalLicense': doctor.get('medicalLicense', ''),
            'profilePhoto': doctor.get('profilePhoto', ''),
            'clinicName': doctor.get('clinicName', ''),
            'consultationFee': doctor.get('consultationFee', ''),
            'contactNumber': doctor.get('contactNumber', ''),
            'address': doctor.get('address', ''),
            'totalAppointments': total_appointments,
            'rating': avg_rating,
            'bio': f"Experienced {doctor.get('specialization', 'medical')} professional with {doctor.get('experience', '')} years of practice."
        }

        return jsonify(doctor_details), 200

    except Exception as e:
        print(f"Error fetching doctor details: {e}")
        return jsonify({'error': 'Failed to fetch doctor details'}), 500

# Dashboard stats endpoints
@app.route('/api/doctor/dashboard/stats', methods=['GET'])
@token_required
def get_doctor_dashboard_stats(current_user):
    """Get dashboard statistics for doctor"""
    try:
        if current_user.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403

        doctor_id = current_user.get('doctorId') or str(current_user['_id'])

        # Get doctor profile
        doctor_profile = doctor_profiles_collection.find_one({"userId": doctor_id})
        if not doctor_profile:
            doctor_profile = doctor_profiles_collection.find_one({"_id": ObjectId(doctor_id)})

        # Build doctor name variations
        doctor_name_variations = []
        if doctor_profile:
            first_name = doctor_profile.get('firstName', '')
            last_name = doctor_profile.get('lastName', '')
            doctor_name_variations.extend([
                f"Dr. {first_name} {last_name}".strip(),
                f"{first_name} {last_name}".strip(),
                f"Dr {first_name} {last_name}".strip()
            ])

        # Calculate various stats
        today = datetime.now().date().strftime('%Y-%m-%d')
        this_month = datetime.now().replace(day=1).strftime('%Y-%m-%d')

        # Build query for appointments
        appointment_query = {
            '$or': [
                {'doctorId': doctor_id},
                {'doctorId': str(doctor_id)},
                {'doctorName': {'$in': doctor_name_variations}}
            ]
        }

        stats = {
            'todayAppointments': appointments_collection.count_documents({
                **appointment_query,
                'date': today
            }),
            'totalPatients': len(appointments_collection.distinct('patientEmail', appointment_query)),
            'thisMonthAppointments': appointments_collection.count_documents({
                **appointment_query,
                'date': {'$gte': this_month}
            }),
            'totalAppointments': appointments_collection.count_documents(appointment_query),
            'unreadMessages': 0,  # Implement based on messaging system
            'avgRating': doctor_profile.get('rating', 4.5) if doctor_profile else 4.5
        }

        return jsonify(stats), 200

    except Exception as e:
        print(f"Error fetching doctor stats: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch stats'}), 500

# Error handling wrapper
def handle_api_error(func):
    """Decorator for consistent error handling"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(f"API Error in {func.__name__}: {traceback.format_exc()}")
            return jsonify({'error': 'Internal server error'}), 500
    return wrapper

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')