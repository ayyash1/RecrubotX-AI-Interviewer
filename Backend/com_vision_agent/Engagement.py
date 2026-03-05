import cv2
import threading
import time
from collections import deque
import numpy as np
from deepface import DeepFace
import mediapipe as mp

# ------- PARAMETERS (tune these) -------
WINDOW_SECONDS = 3.0         # sliding window for attentiveness (seconds). Smaller -> faster response.
DETECT_INTERVAL = 12         # run DeepFace every N frames (adjust for speed)
EYE_CONTACT_THRESH = 0.035   # threshold for simple head/eye alignment check
# ---------------------------------------

# Mediapipe setup
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=1)

# Video capture
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Unable to open camera")

# Shared state (thread-safe access via lock)
dominant_emotion = "Detecting..."
lock = threading.Lock()
analyzing = False  # flag to avoid concurrent deepface threads

# Time-window deques
total_frame_times = deque()   # timestamps of frames (all frames) within window
face_frame_times = deque()    # timestamps of frames where face was present within window

# Helper to purge old timestamps older than window
def purge_old(deq, now, window_seconds):
    cutoff = now - window_seconds
    while deq and deq[0] < cutoff:
        deq.popleft()

def analyze_emotion_thread(face_crop):
    """Background thread to run DeepFace on cropped face image."""
    global dominant_emotion, analyzing
    try:
        # mark analyzing
        analyzing = True
        # run DeepFace (enforce_detection False because we already have crop)
        res = DeepFace.analyze(face_crop, actions=['emotion'], enforce_detection=False, detector_backend='mediapipe')
        with lock:
            dominant_emotion = res[0].get('dominant_emotion', dominant_emotion)
    except Exception as e:
        # keep previous emotion on error, optionally print
        print("DeepFace error:", e)
    finally:
        analyzing = False

def landmarks_to_bbox(landmarks, w, h, pad=0.2):
    """Compute bounding box for face mesh landmarks with padding (normalized -> px)."""
    xs = [lm.x for lm in landmarks]
    ys = [lm.y for lm in landmarks]
    min_x = max(int((min(xs) - pad) * w), 0)
    max_x = min(int((max(xs) + pad) * w), w - 1)
    min_y = max(int((min(ys) - pad) * h), 0)
    max_y = min(int((max(ys) + pad) * h), h - 1)
    return min_x, min_y, max_x, max_y

def estimate_eye_contact(landmarks):
    """
    Simple heuristic: compare center of eyes vs nose x-position.
    Returns True if within threshold -> looking forward.
    """
    # Mediapipe face mesh landmark indices (approx)
    LEFT_EYE = [33, 133]    # outer/inner
    RIGHT_EYE = [362, 263]
    NOSE_TIP = 1

    left_x = (landmarks[LEFT_EYE[0]].x + landmarks[LEFT_EYE[1]].x) / 2.0
    right_x = (landmarks[RIGHT_EYE[0]].x + landmarks[RIGHT_EYE[1]].x) / 2.0
    nose_x = landmarks[NOSE_TIP].x

    center_eyes = (left_x + right_x) / 2.0
    diff = abs(center_eyes - nose_x)
    return diff < EYE_CONTACT_THRESH

# Main loop
frame_idx = 0
eye_contact_str = "Unknown"
engagement_score = 0
attentiveness_pct = 0

try:
    while True:
        t0 = time.time()
        ret, frame = cap.read()
        if not ret:
            break
        frame_idx += 1

        # Convert to RGB and process with Mediapipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(frame_rgb)

        now = time.time()
        # append this frame's timestamp to total frames deque
        total_frame_times.append(now)
        purge_old(total_frame_times, now, WINDOW_SECONDS)
        purge_old(face_frame_times, now, WINDOW_SECONDS)

        face_present = False
        eye_contact_bool = False
        face_crop = None

        if results.multi_face_landmarks:
            # We only handle first face (max_num_faces=1)
            face_present = True
            face_landmarks = results.multi_face_landmarks[0].landmark
            ih, iw, _ = frame.shape

            # estimate eye contact
            try:
                eye_contact_bool = estimate_eye_contact(face_landmarks)
                eye_contact_str = "looking at screen" if eye_contact_bool else "Away"
            except Exception:
                eye_contact_str = "Unknown"
                eye_contact_bool = False

            # mark face present in deque
            face_frame_times.append(now)

            # crop the face region for DeepFace (use landmarks bbox)
            x1, y1, x2, y2 = landmarks_to_bbox(face_landmarks, iw, ih, pad=0.25)
            # ensure reasonable bbox size
            if x2 - x1 > 20 and y2 - y1 > 20:
                face_crop = frame[y1:y2, x1:x2].copy()

            # optionally draw landmark bbox
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 1)
        else:
            eye_contact_str = "Away"

        # Purge old timestamps again (keeps window clean)
        purge_old(total_frame_times, now, WINDOW_SECONDS)
        purge_old(face_frame_times, now, WINDOW_SECONDS)

        # Compute attentiveness: fraction of frames with face in window
        total_count = len(total_frame_times)
        face_count = len(face_frame_times)
        attentiveness_pct = int((face_count / total_count) * 100) if total_count > 0 else 0

        # Compute engagement: mix of presence ratio and current eye-contact
        presence_ratio = (face_count / total_count) if total_count > 0 else 0.0
        engagement_score = int((presence_ratio * 0.5 + (1.0 if eye_contact_bool else 0.0) * 0.5) * 100)

        # Trigger DeepFace (only if face detected, crop available, and not already analyzing)
        if (frame_idx % DETECT_INTERVAL == 0) and face_crop is not None and (not analyzing):
            # spawn background analysis thread (daemon so it won't block exit)
            t = threading.Thread(target=analyze_emotion_thread, args=(face_crop,), daemon=True)
            t.start()

        # Draw overlay values (read dominant_emotion under lock)
        with lock:
            disp_emotion = dominant_emotion

        cv2.putText(frame, f"Emotion: {disp_emotion}", (16, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 0), 2)
        cv2.putText(frame, f"Eye Contact: {eye_contact_str}", (16, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 200), 2)
        cv2.putText(frame, f"Engagement: {engagement_score}%", (16, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 200, 0), 2)
        cv2.putText(frame, f"Attentiveness (last {int(WINDOW_SECONDS)}s): {attentiveness_pct}%", (16, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 100, 0), 2)

        cv2.imshow("RecruBotX - Interview Analyzer", frame)

        # quick sleep to avoid 100% CPU if needed (useful on some machines)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

finally:
    cap.release()
    cv2.destroyAllWindows()
