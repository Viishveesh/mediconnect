# MediConnect

MediConnect helps doctors and patients arrange virtual meetings to save time and make the workflow easy. The platform features **End-to-End Encrypted (E2EE) messaging** to ensure complete privacy and security of medical communications.

# End-to-End Encrypted Messaging System API Testing Guide

This README provides a comprehensive guide to test the E2EE Messaging System APIs using `curl`. The workflow demonstrates how a doctor and a patient can log in, exchange public keys, start conversations, and send encrypted messages that are stored securely in the database.

## 🔐 Security Features

- **Client-side encryption** before sending messages
- **Server stores encrypted data only** - no readable text in database
- **Client-side decryption** after receiving messages
- **RSA-OAEP (2048-bit)** for key exchange
- **ECDH (P-256)** for deriving shared secrets
- **AES-GCM (256-bit)** for message encryption

## Prerequisites

- Ensure the API server is running at `http://localhost:5000`
- You have valid credentials for both a doctor and a patient
- Messages must be encrypted before sending (plain text messages are rejected)

---

## Steps

### 1. Login as Doctor and Get Token

```bash
curl -X POST http://localhost:5000/api/login \
-H "Content-Type: application/json" \
-d '{
  "email": "saikat.raj.doctor1@gmail.com",
  "password": "Doctor123@"
}'
```

**Response:**
```json
{
  "email": "saikat.raj.doctor1@gmail.com",
  "name": "Saikat Raj",
  "role": "doctor",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWouZG9jdG9yMUBnbWFpbC5jb20iLCJyb2xlIjoiZG9jdG9yIiwiZXhwIjoxNzUxOTQ4MjczfQ.U5qDFrgxbrYGH2qpTWHSXXIrxdZnFeXKUtw1V_hwDic"
}
```

---

### 2. Login as Patient and Get Token

```bash
curl -X POST http://localhost:5000/api/login \
-H "Content-Type: application/json" \
-d '{
  "email": "saikat.raj.patient1@gmail.com",
  "password": "Patient123@"
}'
```

**Response:**
```json
{
  "email": "saikat.raj.patient1@gmail.com",
  "name": "Saikat Raj",
  "role": "patient",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWoucGF0aWVudDFAZ21haWwuY29tIiwicm9sZSI6InBhdGllbnQiLCJleHAiOjE3NTE5NDgyOTh9.cK224aSh2OPUit4bEEcsHHZchipWRSAO8lCwlWcnzlc"
}
```

---

### 3. Store Public Keys (Doctor)

```bash
curl -X POST http://localhost:5000/api/public-keys \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWouZG9jdG9yMUBnbWFpbC5jb20iLCJyb2xlIjoiZG9jdG9yIiwiZXhwIjoxNzUxOTQ4MjczfQ.U5qDFrgxbrYGH2qpTWHSXXIrxdZnFeXKUtw1V_hwDic" \
-d '{
  "public_keys": {
    "rsa": {
      "key": [48, 130, 1, 34, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 1, 5, 0, 3, 130, 1, 15, 0],
      "keyType": "RSA-OAEP"
    },
    "ecdh": {
      "key": [48, 89, 48, 19, 6, 7, 42, 134, 72, 206, 61, 2, 1, 6, 8, 42, 134, 72, 206, 61, 3, 1, 7, 3, 66, 0],
      "keyType": "ECDH"
    }
  }
}'
```

**Response:**
```json
{
  "message": "Public keys stored successfully"
}
```

---

### 4. Store Public Keys (Patient)

```bash
curl -X POST http://localhost:5000/api/public-keys \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWoucGF0aWVudDFAZ21haWwuY29tIiwicm9sZSI6InBhdGllbnQiLCJleHAiOjE3NTE5NDgyOTh9.cK224aSh2OPUit4bEEcsHHZchipWRSAO8lCwlWcnzlc" \
-d '{
  "public_keys": {
    "rsa": {
      "key": [48, 130, 1, 34, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 1, 5, 0, 3, 130, 1, 15, 0],
      "keyType": "RSA-OAEP"
    },
    "ecdh": {
      "key": [48, 89, 48, 19, 6, 7, 42, 134, 72, 206, 61, 2, 1, 6, 8, 42, 134, 72, 206, 61, 3, 1, 7, 3, 66, 0],
      "keyType": "ECDH"
    }
  }
}'
```

---

### 5. Start a Conversation (Doctor → Patient)

```bash
curl -X POST http://localhost:5000/api/conversations/start \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWouZG9jdG9yMUBnbWFpbC5jb20iLCJyb2xlIjoiZG9jdG9yIiwiZXhwIjoxNzUxOTQ4MjczfQ.U5qDFrgxbrYGH2qpTWHSXXIrxdZnFeXKUtw1V_hwDic" \
-d '{
  "other_user_email": "saikat.raj.patient1@gmail.com"
}'
```

**Response:**
```json
{
  "conversation_id": "686c8264449c108648d611f2",
  "message": "Conversation created successfully"
}
```

---

### 6. Send Encrypted Message from Doctor

```bash
curl -X POST http://localhost:5000/api/conversations/686c8264449c108648d611f2/send \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWouZG9jdG9yMUBnbWFpbC5jb20iLCJyb2xlIjoiZG9jdG9yIiwiZXhwIjoxNzUxOTQ4MjczfQ.U5qDFrgxbrYGH2qpTWHSXXIrxdZnFeXKUtw1V_hwDic" \
-d '{
  "message": {
    "encrypted": [174, 203, 45, 123, 89, 234, 67, 198, 45, 123, 87, 190, 23, 145, 78, 201, 156, 78, 234, 91, 167, 145, 203, 67, 89, 123, 45, 167, 89, 234, 67, 198],
    "iv": [12, 34, 56, 78, 90, 123, 145, 167, 189, 201, 234, 67]
  }
}'
```

**Response:**
```json
{
  "message": "Message sent successfully"
}
```

---

### 7. Send Encrypted Message from Patient

```bash
curl -X POST http://localhost:5000/api/conversations/686c8264449c108648d611f2/send \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWoucGF0aWVudDFAZ21haWwuY29tIiwicm9sZSI6InBhdGllbnQiLCJleHAiOjE3NTE5NDgyOTh9.cK224aSh2OPUit4bEEcsHHZchipWRSAO8lCwlWcnzlc" \
-d '{
  "message": {
    "encrypted": [221, 156, 78, 234, 91, 167, 145, 203, 67, 89, 123, 45, 167, 89, 234, 67, 198, 174, 203, 45, 123, 89, 234, 67, 198, 45, 123, 87, 190, 23, 145, 78],
    "iv": [87, 190, 23, 145, 78, 201, 156, 78, 234, 91, 167, 145]
  }
}'
```

**Response:**
```json
{
  "message": "Message sent successfully"
}
```

---

### 8. Get Messages (Returns Encrypted Data)

```bash
curl -X GET http://localhost:5000/api/conversations/686c8264449c108648d611f2/messages \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWouZG9jdG9yMUBnbWFpbC5jb20iLCJyb2xlIjoiZG9jdG9yIiwiZXhwIjoxNzUxOTQ4MjczfQ.U5qDFrgxbrYGH2qpTWHSXXIrxdZnFeXKUtw1V_hwDic"
```

**Response (showing encrypted data):**
```json
{
  "messages": [
    {
      "encrypted": true,
      "id": "686c92013dfd7fc50cf19305",
      "message": {
        "encrypted": [174, 203, 45, 123, 89, 234, 67, 198, 45, 123, 87, 190, 23, 145, 78, 201, 156, 78, 234, 91, 167, 145, 203, 67, 89, 123, 45, 167, 89, 234, 67, 198],
        "iv": [12, 34, 56, 78, 90, 123, 145, 167, 189, 201, 234, 67]
      },
      "read": false,
      "sender_email": "saikat.raj.doctor1@gmail.com",
      "sender_name": "Saikat Raj",
      "sender_role": "doctor",
      "timestamp": "Tue, 08 Jul 2025 03:35:29 GMT"
    }
  ]
}
```

---

### 9. Test Plain Text Rejection

```bash
curl -X POST http://localhost:5000/api/conversations/686c8264449c108648d611f2/send \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWouZG9jdG9yMUBnbWFpbC5jb20iLCJyb2xlIjoiZG9jdG9yIiwiZXhwIjoxNzUxOTQ4MjczfQ.U5qDFrgxbrYGH2qpTWHSXXIrxdZnFeXKUtw1V_hwDic" \
-d '{
  "message": "This plain text message should be rejected"
}'
```

**Response (Expected Error):**
```json
{
  "error": "Invalid encrypted message format. Expected {encrypted: [...], iv: [...]}"
}
```

---

### 10. Get Other User's Public Keys

```bash
# Doctor gets patient's public keys
curl -X GET http://localhost:5000/api/public-keys/saikat.raj.patient1@gmail.com \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWouZG9jdG9yMUBnbWFpbC5jb20iLCJyb2xlIjoiZG9jdG9yIiwiZXhwIjoxNzUxOTQ4MjczfQ.U5qDFrgxbrYGH2qpTWHSXXIrxdZnFeXKUtw1V_hwDic"

# Patient gets doctor's public keys
curl -X GET http://localhost:5000/api/public-keys/saikat.raj.doctor1@gmail.com \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWoucGF0aWVudDFAZ21haWwuY29tIiwicm9sZSI6InBhdGllbnQiLCJleHAiOjE3NTE5NDgyOTh9.cK224aSh2OPUit4bEEcsHHZchipWRSAO8lCwlWcnzlc"
```

---

### 11. Get Conversations List

```bash
# Get all conversations for doctor
curl -X GET http://localhost:5000/api/conversations \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWouZG9jdG9yMUBnbWFpbC5jb20iLCJyb2xlIjoiZG9jdG9yIiwiZXhwIjoxNzUxOTQ4MjczfQ.U5qDFrgxbrYGH2qpTWHSXXIrxdZnFeXKUtw1V_hwDic"

# Get all conversations for patient
curl -X GET http://localhost:5000/api/conversations \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaWthdC5yYWoucGF0aWVudDFAZ21haWwuY29tIiwicm9sZSI6InBhdGllbnQiLCJleHAiOjE3NTE5NDgyOTh9.cK224aSh2OPUit4bEEcsHHZchipWRSAO8lCwlWcnzlc"
```

---

## 🔐 Security Verification

### Database Security
- **✅ Encrypted messages are stored as binary blobs** - no readable text
- **✅ Plain text messages are rejected** by the server
- **✅ Last messages show "[Encrypted Message]"** placeholder only
- **✅ Database administrators cannot read message content**

### API Security
- **✅ All endpoints require JWT authentication**
- **✅ Message format validation** ensures only encrypted data is accepted
- **✅ Public key exchange** for secure communication setup
- **✅ Conversation isolation** - users can only access their own messages

### Client Security
- **✅ Encryption happens client-side** before network transmission
- **✅ Decryption happens client-side** after receiving messages
- **✅ Private keys never leave the client**
- **✅ Forward secrecy** through ECDH key exchange

---

## Notes

- Replace tokens with actual values from login responses
- All API requests require valid JWT tokens in the `Authorization` header
- **Messages must be encrypted** - plain text messages are rejected
- The frontend automatically handles encryption/decryption when using the UI
- Database stores only encrypted blobs, ensuring complete privacy
- For production use, implement proper key management and rotation