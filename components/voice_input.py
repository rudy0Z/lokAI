import streamlit as st
from utils.speech_processor import speech_processor
import time

def voice_input_component(
    key: str, 
    language: str = "English", 
    placeholder: str = "Click microphone to record...",
    duration: int = 5
) -> str:
    """Reusable voice input component"""
    
    col1, col2, col3 = st.columns([3, 1, 1])
    
    with col1:
        # Text input field
        text_input = st.text_input(
            "Type or use voice input:",
            key=f"text_{key}",
            placeholder=placeholder
        )
    
    with col2:
        # Voice recording button
        if st.button("🎤 Record", key=f"record_{key}"):
            if speech_processor.calibrate_microphone():
                recorded_text = speech_processor.record_audio(duration, language)
                if recorded_text:
                    st.session_state[f"text_{key}"] = recorded_text
                    st.success(f"✅ Recorded: {recorded_text[:50]}...")
                    st.rerun()
    
    with col3:
        # Audio file upload
        audio_file = st.file_uploader(
            "Upload Audio",
            type=['wav', 'mp3', 'm4a'],
            key=f"audio_{key}",
            label_visibility="collapsed"
        )
        
        if audio_file:
            processed_text = speech_processor.process_audio_file(audio_file, language)
            if processed_text:
                st.session_state[f"text_{key}"] = processed_text
                st.success(f"✅ Processed: {processed_text[:50]}...")
                st.rerun()
    
    return text_input

def voice_chat_component(language: str = "English") -> str:
    """Voice-enabled chat input component"""
    
    st.markdown("### 🎙️ Voice Chat Interface")
    
    # Recording controls
    col1, col2, col3, col4 = st.columns([2, 1, 1, 1])
    
    with col1:
        duration = st.slider("Recording Duration (seconds)", 3, 15, 5)
    
    with col2:
        if st.button("🎤 Start Recording", type="primary"):
            st.session_state.recording_active = True
    
    with col3:
        if st.button("⏹️ Stop"):
            st.session_state.recording_active = False
    
    with col4:
        if st.button("🔄 Clear"):
            if 'voice_chat_text' in st.session_state:
                del st.session_state.voice_chat_text
            st.rerun()
    
    # Recording status
    if st.session_state.get('recording_active', False):
        with st.spinner("🎙️ Recording... Speak now!"):
            recorded_text = speech_processor.record_audio(duration, language)
            if recorded_text:
                st.session_state.voice_chat_text = recorded_text
                st.session_state.recording_active = False
                st.rerun()
    
    # Display recorded text
    if 'voice_chat_text' in st.session_state:
        st.text_area(
            "Recorded Text:",
            value=st.session_state.voice_chat_text,
            height=100,
            key="voice_display"
        )
        return st.session_state.voice_chat_text
    
    return ""

def language_specific_voice_demo():
    """Demo component showing voice input in different languages"""
    
    st.markdown("### 🌐 Multilingual Voice Demo")
    
    demo_phrases = {
        "English": "What are my rights as a tenant?",
        "हिंदी (Hindi)": "किरायेदार के रूप में मेरे क्या अधिकार हैं?",
        "தமிழ் (Tamil)": "குத்தகைதாரராக எனது உரிமைகள் என்ன?",
        "বাংলা (Bengali)": "ভাড়াটিয়া হিসেবে আমার অধিকার কী?",
        "ಕನ್ನಡ (Kannada)": "ಬಾಡಿಗೆದಾರನಾಗಿ ನನ್ನ ಹಕ್ಕುಗಳು ಯಾವುವು?"
    }
    
    selected_lang = st.selectbox(
        "Select language for demo:",
        list(demo_phrases.keys())
    )
    
    st.info(f"Try saying: '{demo_phrases[selected_lang]}'")
    
    if st.button("🎤 Try Voice Input", key="demo_voice"):
        recorded = speech_processor.record_audio(8, selected_lang)
        if recorded:
            st.success(f"You said: {recorded}")
            
            # Generate TTS for the response
            response = f"I understood your query in {selected_lang}. Let me help you with tenant rights information."
            tts_html = speech_processor.text_to_speech_url(response, selected_lang)
            st.markdown(tts_html, unsafe_allow_html=True)
