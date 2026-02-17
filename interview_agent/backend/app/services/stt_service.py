import os
from groq import Groq
import io

class STTService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            # Fallback or allow lazy loading if user hasn't set it yet
             print("GROQ_API_KEY environment variable not set")
        self.client = Groq(api_key=self.api_key)

    async def transcribe(self, audio_bytes: bytes) -> str:
        """
        Transcribes audio bytes to text using Groq (Whisper).
        """
        try:
            # Create a file-like object
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "audio.webm" # Necessary for Groq to detect type

            transcription = self.client.audio.transcriptions.create(
                file=(audio_file.name, audio_file.read()),
                model="whisper-large-v3-turbo", # Fast and accurate
                response_format="json",
                language="en",
                temperature=0.0
            )
            return transcription.text
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"STT Error: {e}")
            return ""
