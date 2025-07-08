# mediconnect
Mediconnect helps the doctors and patients to arrange virtual meetings to save time and make the workflow easy.

# Messaging System API Testing Guide

This README provides a step-by-step guide to test the Messaging System APIs using `curl`. The workflow demonstrates how a doctor and a patient can log in, start a conversation, exchange messages, and retrieve conversation details.

## Prerequisites

- Ensure the API server is running at `http://localhost:5000`.
- You have valid credentials for both a doctor and a patient.

---

## Steps

### 1. Login as Doctor and Get Token

curl -X POST http://localhost:5000/api/login
-H "Content-Type: application/json"
-d '{
"email": "saikat.raj.doctor1@gmail.com",
"password": "Doctor123@"
}'



**Response:**
{
"email": "saikat.raj.doctor1@gmail.com",
"name": "Saikat Raj",
"role": "doctor",
"token": "<DOCTOR_TOKEN>"
}



---

### 2. Login as Patient and Get Token

curl -X POST http://localhost:5000/api/login
-H "Content-Type: application/json"
-d '{
"email": "saikat.raj.patient1@gmail.com",
"password": "Patient123@"
}'



**Response:**
{
"email": "saikat.raj.patient1@gmail.com",
"name": "Saikat Raj",
"role": "patient",
"token": "<PATIENT_TOKEN>"
}



---

### 3. Start a Conversation (Doctor → Patient)

curl -X POST http://localhost:5000/api/conversations/start
-H "Content-Type: application/json"
-H "Authorization: Bearer <DOCTOR_TOKEN>"
-d '{
"other_user_email": "saikat.raj.patient1@gmail.com"
}'



**Response:**
{
"conversation_id": "<CONVERSATION_ID>",
"message": "Conversation created successfully"
}



---

### 4. Send Message from Doctor

curl -X POST http://localhost:5000/api/conversations/<CONVERSATION_ID>/send
-H "Content-Type: application/json"
-H "Authorization: Bearer <DOCTOR_TOKEN>"
-d '{
"message": "Hello! How are you feeling today?"
}'



**Response:**
{
"message": "Message sent successfully"
}



---

### 5. Get Conversations (Patient)

curl -X GET http://localhost:5000/api/conversations
-H "Authorization: Bearer <PATIENT_TOKEN>"



**Response Example:**
{
"conversations": [
{
"conversation_id": "<CONVERSATION_ID>",
"id": "<CONVERSATION_ID>",
"last_message": "Hello! How are you feeling today?",
"last_message_time": "Tue, 08 Jul 2025 02:30:35 GMT",
"other_user_email": "saikat.raj.doctor1@gmail.com",
"other_user_name": "Saikat Raj",
"other_user_role": "doctor",
"unread_count": 1
}
]
}



---

### 6. Get Messages (Patient)

curl -X GET http://localhost:5000/api/conversations/<CONVERSATION_ID>/messages
-H "Authorization: Bearer <PATIENT_TOKEN>"



**Response Example:**
{
"messages": [
{
"id": "<MESSAGE_ID>",
"message": "Hello! How are you feeling today?",
"read": false,
"sender_email": "saikat.raj.doctor1@gmail.com",
"sender_name": "Saikat Raj",
"sender_role": "doctor",
"timestamp": "Tue, 08 Jul 2025 02:30:35 GMT"
}
]
}



---

### 7. Reply from Patient

curl -X POST http://localhost:5000/api/conversations/<CONVERSATION_ID>/send
-H "Content-Type: application/json"
-H "Authorization: Bearer <PATIENT_TOKEN>"
-d '{
"message": "I am feeling much better, thank you doctor!"
}'



**Response:**
{
"message": "Message sent successfully"
}



---

### 8. Check Updated Conversations (Doctor)

curl -X GET http://localhost:5000/api/conversations
-H "Authorization: Bearer <DOCTOR_TOKEN>"



**Response Example:**
{
"conversations": [
{
"conversation_id": "<CONVERSATION_ID>",
"id": "<CONVERSATION_ID>",
"last_message": "I am feeling much better, thank you doctor!",
"last_message_time": "Tue, 08 Jul 2025 02:33:52 GMT",
"other_user_email": "saikat.raj.patient1@gmail.com",
"other_user_name": "Saikat Raj",
"other_user_role": "patient",
"unread_count": 1
}
]
}



---

## Notes

- Replace `<DOCTOR_TOKEN>`, `<PATIENT_TOKEN>`, `<CONVERSATION_ID>`, and `<MESSAGE_ID>` with actual values from previous responses.
- All API requests require valid JWT tokens in the `Authorization` header.
- Timestamps and IDs will vary per session.