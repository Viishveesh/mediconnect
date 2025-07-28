from flask import Blueprint, current_app, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timedelta
import pytz
from bson import ObjectId
from flask_mail import Message
import logging
import os

notifications = Blueprint('notifications', __name__)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize scheduler
scheduler = BackgroundScheduler(timezone=pytz.UTC)
if not scheduler.running:
    logger.info("Starting APScheduler")
    scheduler.start()

def send_appointment_reminder(appointment_id, recipient_email, doctor_name, patient_name, date_str, time_str, reminder_type, minutes_remaining=None):
    """
    Send appointment reminder email
    """
    try:
        # Access mail from current_app
        if not hasattr(current_app, 'mail'):
            logger.error("Flask app does not have 'mail' attribute")
            raise AttributeError("Flask app does not have 'mail' attribute")
        mail = current_app.mail
        
        # Log the recipient email
        logger.info(f"Preparing to send {reminder_type} reminder for appointment {appointment_id} to {recipient_email}")

        # Parse appointment datetime
        appointment_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        appointment_dt = pytz.UTC.localize(appointment_dt)

        # Email content
        reminder_texts = {
            '30_minutes': '30-minute reminder for your upcoming appointment',
            '15_minutes': '15-minute reminder for your upcoming appointment',
            'confirmation': 'Appointment Confirmation'
        }
        
        subject = f"MediConnect: {reminder_texts.get(reminder_type, 'Appointment Reminder')}"
        
        body = f"""Dear {patient_name},

This is a {reminder_texts.get(reminder_type, 'reminder')} for your appointment with {doctor_name}.

Date: {date_str}
Time: {time_str}
Location: MediConnect Website

Please ensure you are available for your appointment. You can join the video session through your MediConnect dashboard.

Thank you,
MediConnect Team
"""

        # Send email
        msg = Message(subject=subject, recipients=[recipient_email])
        msg.body = body
        mail.send(msg)
        logger.info(f"Sent {reminder_type} reminder for appointment {appointment_id} to {recipient_email}")

    except Exception as e:
        logger.error(f"Failed to send {reminder_type} reminder for appointment {appointment_id} to {recipient_email}: {str(e)}")
        raise

def schedule_appointment_reminders(appointment_id, patient_email, doctor_name, patient_name, date_str, time_str):
    """
    Schedule reminders for an appointment
    """
    try:
        # Access appointments_collection from current_app
        appointments_collection = current_app.db.appointment

        # Validate date and time format
        try:
            appointment_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
            appointment_dt = pytz.UTC.localize(appointment_dt)
        except ValueError as e:
            logger.error(f"Invalid date or time format for appointment {appointment_id}: {date_str} {time_str}")
            raise ValueError(f"Invalid date or time format: {date_str} {time_str}")

        logger.info(f"Appointment datetime for {appointment_id}: {appointment_dt} (patient email: {patient_email})")

        # Current time for comparison
        now = datetime.now(pytz.UTC)

        # Schedule 30-minute reminder
        reminder_30m_time = appointment_dt - timedelta(minutes=30)
        if reminder_30m_time > now:
            scheduler.add_job(
                send_appointment_reminder,
                trigger=DateTrigger(run_date=reminder_30m_time),
                args=[appointment_id, patient_email, doctor_name, patient_name, date_str, time_str, '30_minutes'],
                id=f"reminder_30m_{appointment_id}",
                replace_existing=True
            )
            logger.info(f"Scheduled 30-minute reminder for appointment {appointment_id} at {reminder_30m_time}")

        # Schedule 15-minute reminder
        reminder_15m_time = appointment_dt - timedelta(minutes=15)
        if reminder_15m_time > now:
            scheduler.add_job(
                send_appointment_reminder,
                trigger=DateTrigger(run_date=reminder_15m_time),
                args=[appointment_id, patient_email, doctor_name, patient_name, date_str, time_str, '15_minutes'],
                id=f"reminder_15m_{appointment_id}",
                replace_existing=True
            )
            logger.info(f"Scheduled 15-minute reminder for appointment {appointment_id} at {reminder_15m_time}")

    except Exception as e:
        logger.error(f"Error scheduling reminders for appointment {appointment_id} to {patient_email}: {str(e)}")
        raise

@notifications.route('/api/notifications/test', methods=['GET'])
def test_notification():
    """
    Test endpoint to verify notification system
    """
    try:
        # Access mail from current_app
        if not hasattr(current_app, 'mail'):
            logger.error("Flask app does not have 'mail' attribute")
            return jsonify({"error": "Mail service not initialized"}), 500
        mail = current_app.mail
        
        logger.info(f"Sending test notification to {os.getenv('SENDER_EMAIL')}")
        msg = Message(
            subject="MediConnect: Test Notification",
            recipients=[os.getenv('SENDER_EMAIL')],
            body="This is a test notification from MediConnect."
        )
        mail.send(msg)
        logger.info(f"Sent test notification to {os.getenv('SENDER_EMAIL')}")
        return jsonify({"message": "Test notification sent successfully"}), 200
    except Exception as e:
        logger.error(f"Test notification failed: {str(e)}")
        return jsonify({"error": f"Failed to send test notification: {str(e)}"}), 500

@notifications.route('/api/notifications/jobs', methods=['GET'])
def list_jobs():
    """
    List all scheduled jobs for debugging
    """
    try:
        jobs = scheduler.get_jobs()
        return jsonify([{
            'id': job.id,
            'next_run_time': str(job.next_run_time),
            'args': job.args
        } for job in jobs]), 200
    except Exception as e:
        logger.error(f"Failed to list jobs: {str(e)}")
        return jsonify({"error": f"Failed to list jobs: {str(e)}"}), 500

# Shutdown scheduler when app exits
def shutdown_scheduler():
    if scheduler.running:
        logger.info("Shutting down APScheduler")
        scheduler.shutdown()

import atexit
atexit.register(shutdown_scheduler)