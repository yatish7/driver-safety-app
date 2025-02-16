# from flask import Flask, request, jsonify
# import os
# import cv2
# import tempfile
# import subprocess
# from google.generativeai import GenerativeModel
# from langchain.chains import LLMChain
# from langchain.prompts import PromptTemplate
# from pydantic import BaseModel

# app = Flask(__name__)
# UPLOAD_FOLDER = "uploads"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# # Google Gemini AI Setup
# gemini_model = GenerativeModel(model_name="gemini-1.5-flash-latest")

# class AnalysisResult(BaseModel):
#     abnormal_behaviors: list
#     emotions: list
#     recommendations: str
#     overall_score: int

# def convert_to_mp4(input_path):
#     output_path = tempfile.mktemp(suffix=".mp4")
#     command = ["ffmpeg", "-i", input_path, "-c:v", "libx264", "-preset", "fast", "-crf", "23", output_path]
#     subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#     return output_path

# def extract_frames(video_path, num_frames=5):
#     cap = cv2.VideoCapture(video_path)
#     total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#     frame_indices = [i * (total_frames // num_frames) for i in range(num_frames)]
#     frames = []
#     for idx in frame_indices:
#         cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
#         ret, frame = cap.read()
#         if ret:
#             frames.append(frame)
#     cap.release()
#     return frames

# def analyze_frames(frames):
#     results = {"abnormal_behaviors": [], "emotions": []}
#     for frame in frames:
#         response = gemini_model.generate_text("Analyze this image for driver safety and emotion detection.")
#         results["abnormal_behaviors"].append("Drowsiness")
#         results["emotions"].append("Fatigue")
#     return results

# def generate_feedback(analysis_result):
#     prompt_template = PromptTemplate.from_template(
#         "Given the driver behaviors: {abnormal_behaviors} and emotions: {emotions}, provide feedback with a score (0-100) and recommendations."
#     )
#     chain = LLMChain(llm=gemini_model, prompt=prompt_template)
#     feedback = chain.run(abnormal_behaviors=analysis_result["abnormal_behaviors"], emotions=analysis_result["emotions"])
#     return feedback

# @app.route("/api/process-image", methods=["POST"])
# def process_video():
#     file = request.files.get("video")
#     if not file:
#         return jsonify({"error": "No file provided"}), 400
#     file_path = os.path.join(UPLOAD_FOLDER, file.filename)
#     file.save(file_path)
#     mp4_path = convert_to_mp4(file_path)
#     frames = extract_frames(mp4_path)
#     analysis_result = analyze_frames(frames)
#     feedback = generate_feedback(analysis_result)
#     return jsonify({"feedback": feedback, "analysis": analysis_result})

# @app.route("/health", methods=["GET"])
# def health_check():
#     return jsonify({"status": "OK"})

# if __name__ == "__main__":
#     app.run(debug=True)


from typing import List
from flask import Flask, request, jsonify
import cv2
import base64
import os
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# Initialize Flask app
app = Flask(__name__)

# Load API key from .env
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Ensure API key is set
if not GOOGLE_API_KEY:
    raise ValueError("❌ GOOGLE_API_KEY is missing. Check your .env file.")

# Configure Gemini API with 1.5 Flash Model
genai.configure(api_key=GOOGLE_API_KEY)
class drowsiness(BaseModel):
    score:int=Field(ge=0, le=5)
    analysis:List[str]
class emotional_states(BaseModel):
    score:int=Field(ge=0, le=5)
    analysis:List[str]
class Abnormality(BaseModel):
    score:int=Field(ge=0, le=5)
    analysis:List[str]  
class report(BaseModel):
    Drowsiness:drowsiness
    Emotional_states: emotional_states
    abnormality: Abnormality
def analyze_driver_behavior(image_file):
    """Analyze driver behavior using the Gemini 1.5 Flash model."""
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = (
        "Analyze the following image for potential driver safety risks, including:\n"
        "- Drowsiness\n- Phone usage\n- Smoking\n- Drinking\n- No seat belt\n"
        "- Emotional states (Anger, Fear, Anxiety, Sadness)\n"
        "- Any abnormal driving behaviors\n\n"
        "Provide a structured safety report.\n\n"
    )
    
    response = model.generate_content([prompt,image_file])
    return response.text if response else "⚠️ No analysis received from the model."

def generate_report():
    parser = PydanticOutputParser(pydantic_object=report)
    prompt = PromptTemplate(
        template="""Analyze the following driving behavior analysis to provide comprehensive feedback.

Driving Behavior Analysis:
{driving_data}

Provide a detailed evaluation of the driver's performance including:

1. Drowsiness Analysis:
   - Assess signs of drowsiness while driving
   - Identify instances of inattentiveness
   - Provide recommendations for reducing drowsiness

2. Emotional State Analysis:
   - Evaluate emotional states during driving (e.g., stress, anger, calmness)
   - Analyze impact on driving behavior
   - Provide recommendations for managing emotional states

3. Abnormality Analysis:
   - Assess unusual or erratic driving behaviors (e.g., sudden lane changes, abrupt braking)
   - Identify potential causes for abnormalities
   - Provide corrective recommendations

4. Overall Assessment:
   - Calculate overall score (0-100) based on driving performance
   - Highlight key observations
   - List areas for improvement
   - Provide actionable recommendations to enhance driving safety and performance

{format_instructions}
""",
        input_variables=["driving_data"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash-latest",
        temperature=0.7,
        top_p=0.9,
        top_k=40
    )
    
    return LLMChain(llm=llm, prompt=prompt, output_parser=parser)


@app.route("/process-image", methods=["POST"])
def process_image():
    """Process an image for driver behavior analysis."""
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400
    
    image_file = request.files['image']
    image = Image.open(image_file)
    image_path = f"temp_{image_file.filename}"
    image_file.save(image_path)

    try:
        analysis = analyze_driver_behavior(image)
        print(analysis)
        response = generate_report()
        response = response.run(
                driving_data=analysis
            )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(image_path)  # Clean up the temporary image file

        return jsonify({
                'status': 'success',
                'feedback': response.dict()
            })

if __name__ == "__main__":
    app.run(port=8087,debug=True)  # Start the Flask server in debug mode