import edge_tts
import io

class TTSService:
    def __init__(self, voice="en-US-AndrewNeural"): # "en-US-AriaNeural" is another good option
        self.voice = voice

    async def generate_speech(self, text: str) -> bytes:
        """
        Generates TTS audio bytes (MP3) for the given text using Edge TTS.
        """
        try:
            communicate = edge_tts.Communicate(text, self.voice)
            # Create an in-memory byte stream
            audio_buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.write(chunk["data"])
            
            return audio_buffer.getvalue()
        except Exception as e:
            print(f"TTS Error: {e}")
            return None
