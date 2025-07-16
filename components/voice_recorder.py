import streamlit as st
import streamlit.components.v1 as components
from utils.speech_processor import speech_processor

def advanced_voice_recorder(language: str = "English", key: str = "recorder"):
    """Advanced voice recorder with real-time feedback"""
    
    # HTML and JavaScript for advanced voice recording
    recorder_html = f"""
    <div id="voice-recorder-{key}" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 15px;
        color: white;
        text-align: center;
        margin: 10px 0;
    ">
        <h3>🎙️ Voice Recorder</h3>
        <div id="status-{key}" style="margin: 10px 0; font-size: 16px;">Ready to record</div>
        
        <div style="margin: 15px 0;">
            <button id="start-btn-{key}" onclick="startRecording('{key}')" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 24px;
                margin: 5px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
            ">🎤 Start Recording</button>
            
            <button id="stop-btn-{key}" onclick="stopRecording('{key}')" disabled style="
                background: #f44336;
                color: white;
                border: none;
                padding: 12px 24px;
                margin: 5px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
            ">⏹️ Stop Recording</button>
        </div>
        
        <div id="timer-{key}" style="font-size: 18px; font-weight: bold;">00:00</div>
        <div id="volume-indicator-{key}" style="
            width: 100%;
            height: 10px;
            background: rgba(255,255,255,0.3);
            border-radius: 5px;
            margin: 10px 0;
            overflow: hidden;
        ">
            <div id="volume-bar-{key}" style="
                height: 100%;
                background: #4CAF50;
                width: 0%;
                transition: width 0.1s;
            "></div>
        </div>
    </div>
    
    <script>
    let mediaRecorder_{key};
    let audioChunks_{key} = [];
    let startTime_{key};
    let timerInterval_{key};
    let audioContext_{key};
    let analyser_{key};
    let microphone_{key};
    
    async function startRecording(key) {{
        try {{
            const stream = await navigator.mediaDevices.getUserMedia({{ audio: true }});
            
            // Setup audio context for volume monitoring
            audioContext_{key} = new (window.AudioContext || window.webkitAudioContext)();
            analyser_{key} = audioContext_{key}.createAnalyser();
            microphone_{key} = audioContext_{key}.createMediaStreamSource(stream);
            microphone_{key}.connect(analyser_{key});
            analyser_{key}.fftSize = 256;
            
            mediaRecorder_{key} = new MediaRecorder(stream);
            audioChunks_{key} = [];
            
            mediaRecorder_{key}.ondataavailable = event => {{
                audioChunks_{key}.push(event.data);
            }};
            
            mediaRecorder_{key}.onstop = () => {{
                const audioBlob = new Blob(audioChunks_{key}, {{ type: 'audio/wav' }});
                // Here you would typically send the audio to your backend
                document.getElementById('status-{key}').textContent = 'Recording completed! Processing...';
            }};
            
            mediaRecorder_{key}.start();
            startTime_{key} = Date.now();
            
            document.getElementById('start-btn-{key}').disabled = true;
            document.getElementById('stop-btn-{key}').disabled = false;
            document.getElementById('status-{key}').textContent = 'Recording... Speak now!';
            
            // Start timer
            timerInterval_{key} = setInterval(() => {{
                const elapsed = Math.floor((Date.now() - startTime_{key}) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('timer-{key}').textContent = 
                    `${{minutes.toString().padStart(2, '0')}}:${{seconds.toString().padStart(2, '0')}}`;
            }}, 1000);
            
            // Start volume monitoring
            monitorVolume(key);
            
        }} catch (error) {{
            document.getElementById('status-{key}').textContent = 'Error: ' + error.message;
        }}
    }}
    
    function stopRecording(key) {{
        if (mediaRecorder_{key} && mediaRecorder_{key}.state !== 'inactive') {{
            mediaRecorder_{key}.stop();
            mediaRecorder_{key}.stream.getTracks().forEach(track => track.stop());
        }}
        
        if (audioContext_{key}) {{
            audioContext_{key}.close();
        }}
        
        clearInterval(timerInterval_{key});
        
        document.getElementById('start-btn-{key}').disabled = false;
        document.getElementById('stop-btn-{key}').disabled = true;
        document.getElementById('status-{key}').textContent = 'Recording stopped';
    }}
    
    function monitorVolume(key) {{
        if (!analyser_{key}) return;
        
        const bufferLength = analyser_{key}.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        function updateVolume() {{
            if (mediaRecorder_{key} && mediaRecorder_{key}.state === 'recording') {{
                analyser_{key}.getByteFrequencyData(dataArray);
                
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {{
                    sum += dataArray[i];
                }}
                const average = sum / bufferLength;
                const volumePercent = (average / 255) * 100;
                
                document.getElementById('volume-bar-{key}').style.width = volumePercent + '%';
                
                requestAnimationFrame(updateVolume);
            }}
        }}
        
        updateVolume();
    }}
    </script>
    """
    
    # Display the recorder
    components.html(recorder_html, height=300)
    
    # File upload fallback
    st.markdown("**Or upload an audio file:**")
    uploaded_audio = st.file_uploader(
        "Choose audio file",
        type=['wav', 'mp3', 'm4a', 'ogg'],
        key=f"upload_{key}"
    )
    
    if uploaded_audio:
        st.audio(uploaded_audio)
        
        if st.button(f"Process Audio File", key=f"process_{key}"):
            with st.spinner("Processing audio..."):
                transcribed_text = speech_processor.process_audio_file(uploaded_audio, language)
                if transcribed_text:
                    st.success(f"Transcribed: {transcribed_text}")
                    return transcribed_text
    
    return None

def voice_command_interface():
    """Voice command interface with predefined commands"""
    
    st.markdown("### 🎯 Voice Commands")
    
    commands = {
        "📄 Document Generation": [
            "Generate RTI application",
            "Create complaint letter", 
            "Draft legal notice"
        ],
        "⚖️ Legal Help": [
            "What are my tenant rights?",
            "Help with consumer complaint",
            "Labor law information"
        ],
        "🏛️ Civic Information": [
            "Show civic updates",
            "Local government notices",
            "Public meeting information"
        ]
    }
    
    for category, command_list in commands.items():
        with st.expander(category):
            for cmd in command_list:
                col1, col2 = st.columns([3, 1])
                with col1:
                    st.write(f"💬 \"{cmd}\"")
                with col2:
                    if st.button("Try", key=f"cmd_{cmd}"):
                        st.session_state.voice_command_text = cmd
                        st.rerun()
    
    # Display selected command
    if 'voice_command_text' in st.session_state:
        st.info(f"Selected command: {st.session_state.voice_command_text}")
        
        if st.button("Execute Command"):
            # Process the command
            from utils.voice_assistant import voice_assistant
            result = voice_assistant.conversation_flow(
                st.session_state.voice_command_text,
                st.session_state.get('selected_language', 'English')
            )
            
            st.success("Command executed!")
            st.write(result['response_text'])
            
            # Play audio response
            st.markdown(result['voice_response_html'], unsafe_allow_html=True)
