dd# 🧘‍♀️ Theraia – Your Personal AI Therapy Companion

**Theraia** is a web-based AI therapy chatbot designed to offer users a safe and calming space to express their thoughts. Unlike generic chatbots, Theraia retains session context by saving personalized session summaries, mimicking how real therapists remember patient history. Built with React, TypeScript, Firebase, and powered by Google’s Gemini API, Theraia combines emotional intelligence, memory, and a warm user interface.

---

## ✨ Features

- 💬 Chat with **Sage**, your AI therapist  
- 🧠 **Session Memory**: Summarizes and stores session notes to maintain continuity  
- 📂 Saves session data locally as structured summaries  
- 🎵 Optional ambient background audio for a calming experience  
- 🌱 Minimalistic, peaceful UI designed for mental wellness  
- 🔐 Private deployment — no user data is shared externally  

---

## 🛠 Tech Stack

| Layer       | Technologies                                                                 |
|-------------|--------------------------------------------------------------------------------|
| Frontend    | React, TypeScript, CSS Modules / Styled Components (via Firebase Studio IDE)   |
| Backend     | Firebase Hosting, Firebase Functions (Node.js/TypeScript)                     |
| AI          | Google Gemini API integrated via Cloud Functions                              |
| Storage     | Local session files and optional Firebase Firestore                           |

---

## 🧭 How It Works

1. User visits the Theraia site and clicks **Start Session**  
2. A session begins with a gentle introduction from **Sage**  
3. User chats freely; the bot responds empathetically  
4. On **Conclude Session**, the bot:  
   - Sends the chat history + prior summaries to Gemini  
   - Writes a personalized closing and therapist-style notes  
   - Saves everything to a session file  
5. When the next session starts, Theraia loads past summaries and continues the journey  

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js & npm  
- Firebase CLI (`npm install -g firebase-tools`)  
- Git  
- A Gemini API key from Google

### 🧪 Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/Sterling1320/Theraia-AI-Therapist.git
   cd Theraia-AI-Therapist
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Initialize Firebase & set functions:

   ```bash
   firebase login
   firebase init
   ```

4. Secure your Gemini API key locally (e.g. `.env.local` or Firebase config).

5. Build and deploy:

   ```bash
   npm run build
   firebase deploy
   ```

---

## 📁 Folder Structure

```
Theraia-AI-Therapist/
├── public/                   # Static assets
├── src/                      # React + TypeScript frontend
│   ├── components/
│   ├── styles/
│   └── index.tsx
├── functions/                # Firebase Functions (Node.js/TS backend)
│   └── index.ts
├── sessions/                 # Saved session summaries/notes
├── .firebaserc
├── tsconfig.json
├── .gitignore
└── README.md
```

---

## 🔐 Security Notes

- ✅ **Do not commit** any API keys or `.env` files  
- Use `.gitignore` to exclude `/sessions`, `/node_modules`, `.env*`, etc.  
- For public deployment, consider adding **Firebase Auth** for user tracking and data security

---

## 🤝 Contributions

This is a personal project, but feel free to **fork**, suggest improvements, or open issues!

---

## 🧘‍♂️ Author

**Avinash Praveen (Sterling1320)**  
AI Developer | Mental Wellness Advocate  
🌐 [YourPortfolio.com] | 🐙 [@Sterling1320](https://github.com/Sterling1320)

---

## 📜 License

MIT License — see [LICENSE](LICENSE) file for details.

---

## 🌟 Inspiration

Inspired by creating emotionally intelligent AI tools that go beyond mere chat — focusing on **empathy, memory, and mental wellness**.

> “It’s okay to not be okay. But it’s not okay to stay that way forever. Let’s talk.”