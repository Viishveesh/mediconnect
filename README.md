# MediConnect

MediConnect is a telehealth web application that facilitates seamless virtual interactions between doctors and patients. The platform streamlines appointment scheduling, video consultations, and patient management — all in one place.

---

## 🌐 Live Demo

👉 [Live Web App](https://dal-mediconnect.netlify.app/)


---

## 🚀 Features

- 👨‍⚕️ User roles for **doctors** and **patients**
- 📅 Appointment scheduling
- 📹 Secure video consultations
- 🧾 Medical history and prescription storage
- 🔐 Login and registration functionality
- 📬 Email confirmations/reminders

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js & npm (for frontend)
- Python 3.x (for backend)
- Flask & required Python packages

---

### 1. Clone the Repository

```bash
git clone https://github.com/Viishveesh/mediconnect.git
cd mediConnect
```

---

### 2. Run Frontend

```bash
cd frontend
npm install
### Edit URL's to https://localhost:5000 to run in local
npm run start
```

### 3. Run Backend

```bash
cd backend
### Add env variables
### 🔐 Example `.env` File

Here’s an example of how to structure your `.env` file:

![.env Example](./env-image.jpg)

pip install -r requirements.txt
python app.py
```
---

## 🛠️ Information about API

| Endpoint          | Method     | Description                      |
| ----------------- | ---------- | -------------------------------- |
| `/login`          | `POST`     | Authenticate user                |
| `/register`       | `POST`     | Register new doctor or patient   |
| `/appointments`   | `GET/POST` | View or create appointments      |
| `/video-call/:id` | `GET`      | Start or join video call session |
| `/prescriptions`  | `POST`     | Store prescription details       |


