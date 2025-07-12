from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from pymongo import MongoClient
import bcrypt
from dotenv import load_dotenv
import os
import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime, timedelta

load_dotenv()
app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.mediconnect
users_collection = db.users
appointments_collection = db.appointment
doctor_profiles_collection = db.doctor_profiles
patient_profiles_collection = db.patient_profiles

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

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        return jsonify({"message": "Invalid Credentials"}), 401
    
    token = jwt.encode({
        "email": email,
        "role": user.get("role"),
        "exp": datetime.utcnow() + timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "token": token,
        "role": user.get("role"),
        "name": f"{user.get('firstName', '')} {user.get('lastName', '')}".strip(),
        "email": user.get("email") 
    })



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
    dtstamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
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

An invitation has been attached to add this to your calendar.

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

    date = data.get('date')       
    time = data.get('time')       
    doctor_id = data.get('doctorId')
    doctor_name = data.get('doctorName')

    if not all([date, time, doctor_name]):
        return jsonify({"error": "Missing required fields"}), 400

    # Extract from DB
    name = f"{current_user.get('firstName', '')} {current_user.get('lastName', '')}".strip()
    email = current_user.get('email')

    try:
        send_email_with_ics(name, email, doctor_name, date, time)
        appointment_doc = {
            "patientName": name,
            "patientEmail": email,
            "doctorId": doctor_id,
            "doctorName": doctor_name,
            "date": date,
            "time": time,
            "bookedAt": datetime.utcnow()
        }
        appointments_collection.insert_one(appointment_doc)
        return jsonify({"message": "Appointment booked and email sent"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to send email"}), 500

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
        "createdAt": datetime.utcnow()
    }
    
    doctor_profiles_collection.insert_one(profile)
    return jsonify({"message": "Doctor profile created successfully"}), 201

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
        "updatedAt": datetime.utcnow()
    }
    
    doctor_profiles_collection.update_one(
        {"userId": str(current_user["_id"])},
        {"$set": updated_profile}
    )
    return jsonify({"message": "Doctor profile updated successfully"}), 200

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
        "createdAt": datetime.utcnow()
    }
    
    patient_profiles_collection.insert_one(profile)
    return jsonify({"message": "Patient profile created successfully"}), 201

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
        "updatedAt": datetime.utcnow()
    }
    
    patient_profiles_collection.update_one(
        {"userId": str(current_user["_id"])},
        {"$set": updated_profile}
    )
    return jsonify({"message": "Patient profile updated successfully"}), 200

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

if __name__ == "__main__":
    app.run(debug=True)