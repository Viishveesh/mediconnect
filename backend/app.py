from flask import Flask, request, jsonify, send_from_directory
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

load_dotenv()
app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

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
users_collection = db.users
appointments_collection = db.appointment
messages_collection = db.messages
conversations_collection = db.conversations
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
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
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
            "bookedAt": datetime.now(timezone.utc)
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
        "profilePhoto": data.get("profilePhoto"),
        "createdAt": datetime.now(timezone.utc)
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
            "profilePhoto": f"http://localhost:5000/api/files/{doc['profilePhoto']}" if doc.get("profilePhoto") else None,
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

if __name__ == "__main__":
    app.run(debug=True)