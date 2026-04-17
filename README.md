# <p align="center">✨ ChatFlow: The Ultimate Aesthetic Chat Experience ✨</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

**ChatFlow** is a premium, full-stack real-time messaging application where **Privacy meets Elegance**. Designed with a breathtaking glassmorphism UI, it offers a secure vault for your private chats and integrated AI voice transcription.

## 🌟 Standout Features

| Feature | Description |
| :--- | :--- |
| **⚡ Instant Relay** | Real-time WebSockets connection for lightning-fast delivery. |
| **🔐 Private Vault** | A high-security "Safe Mode" to hide and preserve important chats. |
| **🎙️ Speech-to-Text** | AI-powered voice transcription integrated directly into the input. |
| **🛡️ Privacy Plus** | Built-in User Blocking and JWT-certified security layers. |
| **🔥 Auto-Destroy** | Ephemeral messaging that wipes temporary chats every 120 minutes. |
| **🎨 Minty Design** | Stunning Mint-to-Teal glassmorphism UI using Tailwind CSS. |

---

## 🛠️ The Tech Stack

- **✨ Frontend**: React (Vite) + Tailwind CSS (Glassmorphism System)
- **⚡ Backend**: FastAPI (Python 3.10+) + Uvicorn
- **🗄️ Database**: PostgreSQL (Primary) / SQLAlchemy ORM
- **📡 Channels**: WebSocket Protocol for real-time relay

---

## 🚀 Speed Run (Setup)

### 1️⃣ Prepare Environment
```bash
# Backend Setup
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2️⃣ Ignition
```bash
# Run Backend
uvicorn main:app --reload

# Run Frontend (In Root Directory)
npm install
npm run dev
```

---

## 🔒 Security Philosophy

ChatFlow was built on the principle of **"Privacy by Default"**.
- **Ephemeral Storage**: All messages are temporary unless manually moved to the **Vault** or sent in **Safe Mode**.
- **Encryption**: Industry-standard bcrypt hashing for user credentials.
- **Relay Mechanism**: Messages are relayed through a clean WebSocket manager that prevents cross-talk.

---

<p align="center">
  Built with ❤️ for a better chatting experience.
</p>
