from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from pymongo import MongoClient
import bcrypt
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.mediconnect
users_collection = db.users

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
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({"token": token})

#doctor's profile:
@app.route("/api/doctors", methods=["GET"])
def get_doctor_names():
    doctors = users_collection.find({"role": "doctor"}, {"_id": 0, "firstName": 1, "lastName": 1})
    doctor_list = [
        {
            "name": f"{doc.get('firstName', '')} {doc.get('lastName', '')}".strip()
        }
        for doc in doctors
    ]
    return jsonify(doctor_list), 200


if __name__ == "__main__":
    app.run(debug=True)