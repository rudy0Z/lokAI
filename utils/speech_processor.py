import speech_recognition as sr
import pydub
from pydub import AudioSegment
import io
import tempfile
import os
from typing import Optional, Dict, Tuple
import streamlit as st

class SpeechProcessor:
    """Handle speech-to-text processing with multilingual support"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Language mapping for speech recognition
        self.language_codes = {
            "English": "en-IN",
            "हिंदी (Hindi)": "hi-IN",
            "தமிழ் (Tamil)": "ta-IN",
            "বাংলা (Bengali)": "bn-IN",
            "ಕನ್ನಡ (Kannada)": "kn-IN",
            "ગુજરાતી (Gujarati)": "gu-IN",
            "मराठी (Marathi)": "mr-IN",
            "తెలుగు (Telugu)": "te-IN",
            "ਪੰਜਾਬੀ (Punjabi)": "pa-IN"
        }
    
    def calibrate_microphone(self) -> bool:
        """Calibrate microphone for ambient noise"""
        try:
            with self.microphone as source:
                st.info("🎤 Calibrating microphone for ambient noise... Please wait.")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
            return True
        except Exception as e:
            st.error(f"Microphone calibration failed: {str(e)}")
            return False
    
    def record_audio(self, duration: int = 5, language: str = "English") -> Optional[str]:
        """Record audio and convert to text"""
        try:
            lang_code = self.language_codes.get(language, "en-IN")
            
            with self.microphone as source:
                st.info(f"🎙️ Recording for {duration} seconds in {language}... Speak now!")
                
                # Record audio
                audio_data = self.recognizer.listen(source, timeout=duration, phrase_time_limit=duration)
                
                st.info("🔄 Processing speech...")
                
                # Convert speech to text using Google Speech Recognition
                try:
                    text = self.recognizer.recognize_google(audio_data, language=lang_code)
                    return text
                except sr.UnknownValueError:
                    st.warning("Could not understand the audio. Please try again.")
                    return None
                except sr.RequestError as e:
                    st.error(f"Speech recognition service error: {str(e)}")
                    return None
                    
        except Exception as e:
            st.error(f"Recording failed: {str(e)}")
            return None
    
    def process_audio_file(self, audio_file, language: str = "English") -> Optional[str]:
        """Process uploaded audio file"""
        try:
            lang_code = self.language_codes.get(language, "en-IN")
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
                tmp_file.write(audio_file.read())
                tmp_file_path = tmp_file.name
            
            # Load and process audio
            with sr.AudioFile(tmp_file_path) as source:
                audio_data = self.recognizer.record(source)
                
                try:
                    text = self.recognizer.recognize_google(audio_data, language=lang_code)
                    os.unlink(tmp_file_path)  # Clean up temp file
                    return text
                except sr.UnknownValueError:
                    st.warning("Could not understand the audio file.")
                    return None
                except sr.RequestError as e:
                    st.error(f"Speech recognition service error: {str(e)}")
                    return None
                    
        except Exception as e:
            st.error(f"Audio file processing failed: {str(e)}")
            return None
        finally:
            # Ensure temp file is cleaned up
            if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
    
    def get_supported_languages(self) -> list:
        """Get list of supported languages"""
        return list(self.language_codes.keys())
    
    def text_to_speech_url(self, text: str, language: str = "English") -> str:
        """Generate text-to-speech URL (using browser's built-in TTS)"""
        lang_code = self.language_codes.get(language, "en-IN")
        
        # Create JavaScript for text-to-speech
        js_code = f"""
        <script>
        function speakText() {{
            const utterance = new SpeechSynthesisUtterance("{text}");
            utterance.lang = "{lang_code}";
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }}
        </script>
        <button onclick="speakText()" style="
            background-color: #FF6B35;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        ">🔊 Listen</button>
        """
        return js_code

# Global speech processor instance
speech_processor = SpeechProcessor()
