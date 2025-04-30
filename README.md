# 🧠 MindWell – Your AI-Powered Mental Wellness Companion

MindWell is an AI-driven mental health assistant designed to help individuals better understand and manage their emotional well-being. The platform integrates intelligent mood tracking, personalized recommendations, therapeutic content, and supportive community features—all in one seamless experience.

---

## 🚀 Features

### 1. 🌡️ Mood Check-In & Analytics
- Log your current mood through an intuitive interface.
- Visualize your emotional journey with a **Mood Level vs Time** graph.
- Track mental health patterns and identify triggers.

### 2. 📚 Mental Health Library & Personalized Recommendations
- Explore a rich collection of **articles, exercises, and videos** covering a wide range of mental wellness topics.
- Get **AI-powered personalized content** recommendations (videos, articles, and products) tailored to your current emotional state using **Gemini API** and **Ollama Phi**.

### 3. 💬 Community Chat
- Engage with others on similar journeys through a **real-time community chat**.
- Share your experiences, get support, and foster meaningful connections.

### 4. 📄 DocMe – Long-Term Insights
- Generate a summarized mental health profile and insights over extended periods.
- Get a **longitudinal overview** of mood trends, common emotional states, and improvements.

### 5. 🤖 AI Smart Mental Health Chatbot
- Interact with an intelligent mental wellness assistant powered by **Google Gemini**.
- Get advice, practice guided self-reflection, and learn coping strategies through natural conversation.

### 6. 🗓️ Book Therapy
- Discover certified mental health professionals.
- Easily book therapy sessions and manage your appointments.

### 7. 🧘 Relaxation Zone
- Access a dedicated space for **meditation** and **relaxation exercises**.
- Improve mindfulness and reduce stress with guided audio and video content.

---

## 🛠️ Tech Stack

| Category         | Tool/Tech                         |
|------------------|----------------------------------|
| Frontend         | React.js                         |
| Backend          | FastAPI                          |
| Realtime Database| Firebase (Check-ins & Community) |
| AI Models        | Gemini API, Ollama Phi           |
| Hosting          | Firebase / Vercel / Render       |

---

## 🔐 Data & Privacy
- All personal check-ins and chat messages are securely stored using **Firebase Realtime Database**.
- Secrets and credentials are safely handled via environment variables. No sensitive data is stored in the public codebase.

---

## 📦 Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/ECELLPCCE25/Night-Owls.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Night-Owls
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Start the frontend:
   ```bash
   npm start
   ```

5. Run the backend:
   ```bash
   uvicorn main:app --reload
   ```

---

## 👥 Contributors
- **Nikhil Savita**
- **Sakshi Kamble**
- **Jonathan Raposo**
