from flask import Blueprint, request, jsonify, current_app
from models.doctor_availability import DoctorAvailabilitySchema
from models.doctor_busy_time import DoctorBusyTimeSchema

doctor_schedule = Blueprint('doctor_schedule', __name__)


# Availability routes
@doctor_schedule.route('/doctor/availability', methods=['POST'])
def add_doctor_availability():
    try:
        validated = DoctorAvailabilitySchema(**request.get_json())
        data = validated.dict()

        db = current_app.db
        result = db.doctor_availability.insert_one(data)

        return jsonify({"message": "Availability added", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@doctor_schedule.route('/doctor/availability', methods=['GET'])
def get_doctor_availability():
    try:
        doctor_id = request.args.get("doctorId")
        if not doctor_id:
            return jsonify({"error": "Missing doctorId parameter"}), 400

        db = current_app.db
        slots = list(db.doctor_availability.find({"doctorId": doctor_id}))
        # Convert ObjectId and datetime to JSON-serializable values
        for slot in slots:
            slot["_id"] = str(slot["_id"])
            slot["startTime"] = slot["startTime"].isoformat()
            slot["endTime"] = slot["endTime"].isoformat()
            slot["createdAt"] = slot["createdAt"].isoformat()
            slot["updatedAt"] = slot["updatedAt"].isoformat()

        return jsonify(slots), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from bson import ObjectId

@doctor_schedule.route('/doctor/availability/<slot_id>', methods=['DELETE'])
def delete_doctor_availability(slot_id):
    try:
        db = current_app.db
        result = db.doctor_availability.delete_one({"_id": ObjectId(slot_id)})

        if result.deleted_count == 1:
            return jsonify({"message": "Slot deleted"}), 200
        else:
            return jsonify({"error": "Slot not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Busy slot routes
@doctor_schedule.route('/doctor/busy', methods=['POST'])
def add_doctor_busy_time():
    try:
        validated = DoctorBusyTimeSchema(**request.get_json())
        data = validated.dict()

        db = current_app.db
        result = db.doctor_busy_time.insert_one(data)

        return jsonify({"message": "Busy time added", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@doctor_schedule.route('/doctor/busy', methods=['GET'])
def get_doctor_busy_times():
    try:
        doctor_id = request.args.get("doctorId")
        if not doctor_id:
            return jsonify({"error": "Missing doctorId parameter"}), 400

        db = current_app.db
        busy_times = list(db.doctor_busy_time.find({"doctorId": doctor_id}))
        for slot in busy_times:
            slot["_id"] = str(slot["_id"])
            slot["startTime"] = slot["startTime"].isoformat()
            slot["endTime"] = slot["endTime"].isoformat()
            slot["createdAt"] = slot["createdAt"].isoformat()
            slot["updatedAt"] = slot["updatedAt"].isoformat()

        return jsonify(busy_times), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@doctor_schedule.route('/doctor/busy/<slot_id>', methods=['DELETE'])
def delete_doctor_busy_time(slot_id):
    try:
        db = current_app.db
        result = db.doctor_busy_time.delete_one({"_id": ObjectId(slot_id)})

        if result.deleted_count == 1:
            return jsonify({"message": "Busy time deleted"}), 200
        else:
            return jsonify({"error": "Busy time not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Combined route
@doctor_schedule.route('/doctor/schedule', methods=['GET'])
def get_combined_doctor_schedule():
    try:
        doctor_id = request.args.get("doctorId")
        if not doctor_id:
            return jsonify({"error": "Missing doctorId parameter"}), 400

        db = current_app.db

        # Fetch availability
        availability = list(db.doctor_availability.find({"doctorId": doctor_id}))
        for slot in availability:
            slot["_id"] = str(slot["_id"])
            slot["startTime"] = slot["startTime"].isoformat()
            slot["endTime"] = slot["endTime"].isoformat()
            slot["createdAt"] = slot["createdAt"].isoformat()
            slot["updatedAt"] = slot["updatedAt"].isoformat()
            slot["type"] = "available"  # Tag it for frontend

        # Fetch busy slots
        busy = list(db.doctor_busy_time.find({"doctorId": doctor_id}))
        for slot in busy:
            slot["_id"] = str(slot["_id"])
            slot["startTime"] = slot["startTime"].isoformat()
            slot["endTime"] = slot["endTime"].isoformat()
            slot["createdAt"] = slot["createdAt"].isoformat()
            slot["updatedAt"] = slot["updatedAt"].isoformat()
            slot["type"] = "busy"  # Tag it for frontend

        # Combine and return
        combined_schedule = availability + busy
        return jsonify(combined_schedule), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
