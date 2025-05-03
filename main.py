from flask import Flask, request, jsonify
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

# Initialize Flask app
app = Flask(__name__)

# Load API key from .env
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Ensure API key is set
if not GOOGLE_API_KEY:
    raise ValueError("❌ GOOGLE_API_KEY is missing. Check your .env file.")

# Configure Gemini API
genai.configure(api_key=GOOGLE_API_KEY)

# Gemini Model
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

def clean_json_string(raw_text):
    """Removes unwanted characters (e.g., markdown, backticks) and extracts valid JSON."""
    
    # ✅ Remove markdown code formatting (e.g., ```json ... ```)
    cleaned_text = re.sub(r"```json|```", "", raw_text.strip()).strip()

    try:
        return json.loads(cleaned_text)  # ✅ Ensure valid JSON
    except json.JSONDecodeError as e:
        print("❌ JSON Decode Error:", e)
        return {"drowsiness_score": "N/A", "emotional_state": "N/A"}  # ✅ Return safe default

def analyze_driver_behavior(image_base64):
    """Analyze driver behavior using Gemini AI ONLY for drowsiness & emotional state."""
    
    prompt = (
        "Analyze this image for:\n"
        "- Drowsiness detection (0-5 score)\n"
        "- Emotional state (Happy, Stressed, Angry, etc.)\n"
        "Do NOT analyze abnormal behaviors. Respond in raw JSON format (NO extra text), like:\n"
        "{ 'drowsiness_score': X, 'emotional_state': 'Y' }"
    )
    
    try:
        response = gemini_model.generate_content([prompt, image_base64])
        raw_text = response.text if response else "{}"

        print("✅ Gemini Raw Response:", raw_text)  # Debugging log

        return clean_json_string(raw_text)  # ✅ Ensure clean JSON

    except Exception as e:
        print("❌ Gemini API Error:", e)
        return {"drowsiness_score": "N/A", "emotional_state": "N/A"}

@app.route("/process-analysis", methods=["POST"])
def process_analysis():
    """Processes image/video frames for drowsiness & emotional state analysis using Gemini AI."""
    
    data = request.json
    detections = data.get("detections", [])

    if not detections:
        return jsonify({"error": "No detections provided"}), 400

    # Get the first detected image frame (for videos)
    image_base64 = detections[0].get('image', "")

    try:
        # Get Gemini analysis (ONLY drowsiness & emotion)
        analysis = analyze_driver_behavior(image_base64)

        # Use YOLOv8's detected behaviors (do not modify!)
        yolo_abnormalities = [d["class"] for d in detections]

        response_data = {
            "Drowsiness": {"score": analysis.get("drowsiness_score", "N/A")},
            "EmotionalState": {"emotion": analysis.get("emotional_state", "N/A")},
            "Abnormality": {"detected_behaviors": yolo_abnormalities}  # Only YOLOv8 results!
        }

        print("✅ Final Response:", response_data)  # Debugging log
        return jsonify(response_data)

    except Exception as e:
        print("❌ Server Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8087, debug=True)
