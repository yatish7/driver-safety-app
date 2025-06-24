🚗 Abnormal Behavior & Health Monitoring for Driver Safety
A real-time AI-powered mobile application designed to monitor driver behavior and emotional state to prevent accidents and promote safer driving. The system uses computer vision models to detect distractions (like phone use, drowsiness), emotional distress (e.g., stress, anger), and delivers intelligent alerts and behavior analytics to the user via a connected app.



📌 Key Features
**Real-Time Behavior Detection**:
YOLOv8-powered detection of unsafe driving behaviors such as phone usage, drowsiness, eating, and head tilting.
**Emotion Recognition**:
Uses ResNet50 trained on FER2013 to detect emotions like stress, frustration, and fatigue, critical for early intervention.
**Gemini AI Integration**:
Performs contextual analysis, combines model outputs, assigns risk/drowsiness scores, and summarizes trends over time.
**Instant Alerts**:
Real-time visual/audio notifications for unsafe behavior or emotional distress during driving.
**Driver Dashboard**:
In-app analytics show daily/weekly trends, risk scores, and personalized insights for habit improvement.

🛠️ Tech Stack
Platform: React Native (cross-platform: iOS & Android)
Backend: Flask + Gemini AI for model orchestration and risk evaluation
ML Models: YOLOv8 (behavior), ResNet50 + FER (emotion), Gemini logic engine (fusion)
Storage: SQLite (local trip data), Firebase (cloud sync & real-time DB)
Notifications: React Native mobile alerts

⚙️ Setup & Installation
Prerequisites
Python ≥ 3.10 (for model backend)
Node.js ≥ v16 (for app)
React Native CLI
Android Studio or Xcode
Quickstart
git clone https://github.com/yatish7/driver-safety-app.git
cd driver-safety-app

# Install mobile dependencies
npm install

# Start mobile app
npm start

# Run on Android
npm run android

# (Optional) Start Flask API
cd backend/
pip3 install -r requirements.txt
python3 app.py

🧩 How It Works
Data Collection:
Video frames are captured in real time through the phone camera.
Behavior & Emotion Detection:
YOLOv8 detects distractions; ResNet50 identifies emotional states.
AI Fusion Engine:
Gemini AI analyzes combined outputs, calculates a drowsiness score, and assesses driver safety.
Alerts & Logging:
Triggers alerts for unsafe patterns and logs risk scores for trip reviews.
Insights Dashboard:
Visual graphs showing daily scores, emotion trends, and behavior heatmaps.
🎯 Use Cases
Personal Safety: Helps users recognize fatigue or distraction early.
Fleet Monitoring: Can be scaled for logistics or cab fleets to track driver fitness.
Insurance Integration: Real-time driver scoring for usage-based insurance models.
Smart Mobility Research: Great for ML research or hackathons around real-time vision.
🔧 Customization & Extensions
📊 Add new detections: fatigue from posture, yawning, unsafe eye closure patterns
🌐 Cloud sync: Enable enterprise dashboard or analytics
🔔 Push alerts: Coach drivers with weekly summaries or urgent warnings
📱 Multi-driver support: Track individual profiles for shared vehicles
✅ Roadmap
Gemini AI expansion for deeper contextual learning
Add offline mode + edge deployment for embedded systems
Real-time crash detection and SOS
Gamification: driving scores, safe-driving streaks, leaderboards
Fleet dashboard with real-time alerts
👤 Contributors & Credit
Yatish Manne – AI pipeline, app architecture, mobile dashboard, Gemini fusion
Open-source libraries: Ultralytics YOLOv8, FER2013, Flask, React Native, Victory Charts
📄 License
MIT License — Use, share, or modify freely for personal or commercial projects.
📞 Contact
Email: yatish.manne09@gamil.com
LinkedIn: [linkedin.com/in/yatishmanne](https://www.linkedin.com/in/yatish-manne-ab2836254/)
GitHub: github.com/yatish7
