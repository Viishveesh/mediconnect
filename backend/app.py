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
messages_collection = db.messages
conversations_collection = db.conversations

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
            
            result.append({
                "id": str(msg.get('_id')),
                "sender_email": msg.get('sender_email'),
                "sender_name": sender_name,
                "sender_role": msg.get('sender_role'),
                "message": msg.get('message'),
                "timestamp": msg.get('timestamp'),
                "read": msg.get('read', False)
            })
        
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
        message_text = data.get('message', '').strip()
        
        if not message_text:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        conversation = conversations_collection.find_one({"_id": ObjectId(conversation_id)})
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404
        
        user_email = current_user.get('email')
        user_role = current_user.get('role')
        
        if user_email not in [conversation.get('doctor_email'), conversation.get('patient_email')]:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Create message
        message_doc = {
            "conversation_id": ObjectId(conversation_id),
            "sender_email": user_email,
            "sender_role": user_role,
            "message": message_text,
            "timestamp": datetime.utcnow(),
            "read": False
        }
        
        messages_collection.insert_one(message_doc)
        
        # Update conversation
        other_role = 'patient' if user_role == 'doctor' else 'doctor'
        conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$set": {
                    "last_message": message_text,
                    "last_message_time": datetime.utcnow()
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
        "created_at": datetime.utcnow(),
        "last_message": "",
        "last_message_time": datetime.utcnow(),
        "unread_count_doctor": 0,
        "unread_count_patient": 0
    }
    
    result = conversations_collection.insert_one(conversation_doc)
    
    return jsonify({
        "conversation_id": str(result.inserted_id),
        "message": "Conversation created successfully"
    }), 201

if __name__ == "__main__":
    app.run(debug=True)