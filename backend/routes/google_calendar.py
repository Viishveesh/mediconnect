import datetime
from flask import Blueprint, jsonify, redirect, request, current_app
from google_auth_oauthlib.flow import Flow
from dotenv import load_dotenv
import os
from bson import ObjectId
import jwt
from dateutil.parser import isoparse


load_dotenv()

google_calendar = Blueprint("google_calendar", __name__)
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

CLIENT_SECRETS_FILE = os.getenv("GOOGLE_CLIENT_SECRET_FILE")
SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
REDIRECT_URI = "http://localhost:5000/google/callback"  # update if deployed


# Login
@google_calendar.route("/google/login")
def google_login():
    token = request.args.get("token")  # JWT passed from frontend

    if not token:
        return jsonify({"error": "Missing JWT token"}), 400

    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )

    # Use JWT token directly in OAuth `state` param
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=token  # pass the JWT as state
    )

    return redirect(authorization_url)


# Callback
@google_calendar.route("/google/callback")
def google_callback():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
        state=request.args.get("state")  # pull JWT from URL param
    )
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    token_data = credentials_to_dict(credentials)

    try:
        jwt_token = request.args.get("state")
        decoded = jwt.decode(jwt_token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        doctor_id = decoded.get("doctorId")

        print("Google Callback doctorId from JWT:", doctor_id)

        # Save token in MongoDB
        db = current_app.db
        db.users.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": {"googleToken": token_data}}
        )

        return redirect(f"http://localhost:3000/doctor/schedule/{doctor_id}")
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Sync Busy
@google_calendar.route("/google/sync-busy", methods=["GET"])
def sync_google_busy():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Authorization header missing"}), 401

    jwt_token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(jwt_token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        doctor_id = decoded.get("doctorId")
        print("Syncing busy slots for doctorId:", doctor_id)


        db = current_app.db
        user = db.users.find_one({"_id": ObjectId(doctor_id)})

        if not user or "googleToken" not in user:
            return jsonify({"error": "No Google Calendar token found."}), 403

        creds = dict_to_credentials(user["googleToken"])
        service = build('calendar', 'v3', credentials=creds)

        now = datetime.utcnow().isoformat() + 'Z'
        events_result = service.events().list(
            calendarId='primary',
            timeMin=now,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])

        busy_slots = []
        for event in events:
            start = event['start'].get('dateTime') or event['start'].get('date')  # for all-day events
            end = event['end'].get('dateTime') or event['end'].get('date')

            if not start or not end:
                continue

            busy_slot = {
                "doctorId": doctor_id,
                "startTime": isoparse(start),
                "endTime": isoparse(end),
                "reason": event.get("summary", "Google Calendar Event"),
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }

            # Avoid duplicates (optional enhancement)
            if not db.doctor_busy_time.find_one({
                "doctorId": doctor_id,
                "startTime": busy_slot["startTime"],
                "endTime": busy_slot["endTime"]
            }):
                busy_slots.append(busy_slot)

        if busy_slots:
            db.doctor_busy_time.insert_many(busy_slots)

        return jsonify({"message": f"{len(busy_slots)} busy slots synced."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def credentials_to_dict(creds):
    return {
        'token': creds.token,
        'refresh_token': creds.refresh_token,
        'token_uri': creds.token_uri,
        'client_id': creds.client_id,
        'client_secret': creds.client_secret,
        'scopes': creds.scopes
    }

def dict_to_credentials(data):
    from google.oauth2.credentials import Credentials
    return Credentials(
        token=data['token'],
        refresh_token=data.get('refresh_token'),
        token_uri=data['token_uri'],
        client_id=data['client_id'],
        client_secret=data['client_secret'],
        scopes=data['scopes']
    )