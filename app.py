from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image
import io
import requests
import os
import base64

app = FastAPI()

model = YOLO("best.pt")

CLASS_NAMES = [
    "Drinking", "Hair and Makeup", "Operating the radio", "Reaching Behind",
    "Safe Driving", "Talking on the Phone", "Talking to Passenger", "Texting"
]

FLASK_API_URL = "https://twenty-toys-talk.loca.lt/process-analysis"

def encode_image(image):
    """Encodes image to base64 format."""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode()

def extract_frames_from_video(video_path, frame_skip=10):
    """Extracts frames from a video file at every `frame_skip` interval."""
    cap = cv2.VideoCapture(video_path)
    frames = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_skip == 0:
            frame = cv2.resize(frame, (640, 640))
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame)

        frame_count += 1

    cap.release()
    return frames

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        file_extension = file.filename.split(".")[-1].lower()
        print(f"📂 Received File: {file.filename}, Detected Type: {file_extension}")

        if file_extension not in ["jpg", "jpeg", "png", "mp4", "avi", "mov"]:
            return {"error": f"Unsupported file format: {file_extension}"}

        predictions = []

        if file_extension in ["jpg", "jpeg", "png"]:  # Image processing
            image = Image.open(io.BytesIO(await file.read()))
            image = image.resize((640, 640))
            input_data = np.array(image.convert("RGB"))
            results = model(input_data, imgsz=640)

            encoded_img = encode_image(image)

            for box in results[0].boxes.data.tolist():
                x1, y1, x2, y2, conf, class_id = box
                if conf > 0.5:
                    predictions.append({
                        "class": CLASS_NAMES[int(class_id)],
                        "confidence": round(float(conf), 4),
                        "image": encoded_img
                    })

        elif file_extension in ["mp4", "avi", "mov"]:  # Video processing
            video_path = f"./temp_{file.filename}"
            with open(video_path, "wb") as buffer:
                buffer.write(await file.read())

            frames = extract_frames_from_video(video_path)
            os.remove(video_path)  # Delete after processing

            for frame in frames:
                frame_pil = Image.fromarray(frame)
                encoded_img = encode_image(frame_pil)

                results = model(frame, imgsz=640)

                for box in results[0].boxes.data.tolist():
                    x1, y1, x2, y2, conf, class_id = box
                    if conf > 0.5:
                        predictions.append({
                            "class": CLASS_NAMES[int(class_id)],
                            "confidence": round(float(conf), 4),
                            "image": encoded_img
                        })

        # ✅ Send detected objects to Flask for report generation
        response_data = {"detections": predictions}
        flask_response = requests.post(FLASK_API_URL, json=response_data)
        return flask_response.json()

    except Exception as e:
        return {"error": str(e)}
