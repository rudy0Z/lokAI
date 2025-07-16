import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import json
from typing import Dict, List
import re
import speech_recognition as sr
import pydub
from pydub import AudioSegment
import io
import base64
from components.voice_input import voice_input_component, voice_chat_component, language_specific_voice_demo
from utils.speech_processor import speech_processor

# Configure Streamlit page
st.set_page_config(
    page_title="LokAI - Civic & Legal Assistant",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #FF6B35 0%, #F7931E 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    .feature-card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 4px solid #FF6B35;
        margin: 1rem 0;
    }
    .alert-box {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 5px;
        padding: 1rem;
        margin: 1rem 0;
    }
    .success-box {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 5px;
        padding: 1rem;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'user_location' not in st.session_state:
    st.session_state.user_location = ""
if 'selected_language' not in st.session_state:
    st.session_state.selected_language = "English"
if 'audio_input_enabled' not in st.session_state:
    st.session_state.audio_input_enabled = False
if 'recorded_audio' not in st.session_state:
    st.session_state.recorded_audio = None

# Mock data for demonstration
CIVIC_NOTICES = [
    {
        "title": "Water Tax Revision - Ward 15",
        "date": "2024-01-15",
        "summary": "Proposed 2% increase in water tax. Public hearing scheduled for January 20th, 2024.",
        "category": "Municipal",
        "location": "Mumbai",
        "action_required": True
    },
    {
        "title": "New Traffic Rules Implementation",
        "date": "2024-01-10",
        "summary": "Updated traffic regulations for two-wheelers effective February 1st, 2024.",
        "category": "Transport",
        "location": "Delhi",
        "action_required": False
    },
    {
        "title": "Public Park Development Plan",
        "date": "2024-01-12",
        "summary": "Community consultation for new park development in Sector 21.",
        "category": "Development",
        "location": "Bangalore",
        "action_required": True
    }
]

LEGAL_TEMPLATES = {
    "RTI Application": {
        "template": """To,
The Public Information Officer,
{department}
{address}

Subject: Application under Right to Information Act, 2005

Sir/Madam,

I, {applicant_name}, resident of {applicant_address}, would like to obtain the following information under the Right to Information Act, 2005:

{information_requested}

I am enclosing the application fee of Rs. 10/- as required under the Act.

Please provide the information within the stipulated time period of 30 days.

Thanking you,

{applicant_name}
Date: {date}
""",
        "fields": ["department", "address", "applicant_name", "applicant_address", "information_requested"]
    },
    "Complaint Letter": {
        "template": """To,
{authority_name}
{authority_address}

Subject: Complaint regarding {complaint_subject}

Sir/Madam,

I am writing to bring to your attention the following issue:

{complaint_details}

This matter has been causing significant inconvenience and requires immediate attention. I request you to take necessary action to resolve this issue at the earliest.

I look forward to your prompt response and action.

Thanking you,

{complainant_name}
{complainant_address}
{contact_details}
Date: {date}
""",
        "fields": ["authority_name", "authority_address", "complaint_subject", "complaint_details", "complainant_name", "complainant_address", "contact_details"]
    }
}

def voice_demo_tab():
    st.header("🎙️ Voice Input Demo & Settings")
    
    # Import the new components
    from components.voice_recorder import advanced_voice_recorder, voice_command_interface
    
    # Advanced voice recorder
    st.subheader("🎤 Advanced Voice Recorder")
    transcribed = advanced_voice_recorder(st.session_state.selected_language, "demo_recorder")
    
    if transcribed:
        st.markdown("### 🤖 AI Response")
        ai_response = generate_ai_response(transcribed)
        st.write(ai_response)
        
        # Generate voice response
        tts_html = speech_processor.text_to_speech_url(ai_response, st.session_state.selected_language)
        st.markdown(tts_html, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Voice commands interface
    voice_command_interface()
    
    st.markdown("---")
    
    # Voice settings
    st.subheader("🔧 Voice Settings")
    
    col1, col2 = st.columns(2)
    with col1:
        st.info("**Supported Languages:**")
        for lang in speech_processor.get_supported_languages():
            st.write(f"• {lang}")
    
    with col2:
        st.info("**Audio Formats Supported:**")
        st.write("• WAV files")
        st.write("• MP3 files") 
        st.write("• M4A files")
        st.write("• Live microphone input")
    
    # Language-specific demo
    language_specific_voice_demo()
    
    # Voice input tips
    st.subheader("💡 Voice Input Tips")
    
    tips = [
        "🎤 **Clear Speech**: Speak clearly and at a moderate pace",
        "🔇 **Quiet Environment**: Use in a quiet environment for better accuracy",
        "📱 **Mobile Friendly**: Works on mobile devices with microphone access",
        "🌐 **Language Switching**: Switch languages in the sidebar for better recognition",
        "⏱️ **Recording Duration**: Adjust recording duration based on your query length",
        "🔄 **Retry Option**: If recognition fails, try recording again"
    ]
    
    for tip in tips:
        st.markdown(tip)
    
    # Troubleshooting
    with st.expander("🔧 Troubleshooting Voice Input"):
        st.markdown("""
        **Common Issues and Solutions:**
        
        1. **Microphone not working:**
           - Check browser permissions for microphone access
           - Ensure microphone is not muted
           - Try refreshing the page
        
        2. **Poor recognition accuracy:**
           - Speak more slowly and clearly
           - Reduce background noise
           - Try using the correct language setting
        
        3. **Audio file upload issues:**
           - Ensure file is in supported format (WAV, MP3, M4A)
           - Check file size (should be under 25MB)
           - Try converting to WAV format for best results
        
        4. **Language-specific issues:**
           - Make sure the correct language is selected
           - Some regional accents may have varying accuracy
           - Try speaking in a neutral accent for better results
        """)

def main():
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>🏛️ LokAI - Your Civic & Legal Assistant</h1>
        <p>Empowering Indian citizens with accessible legal and civic information</p>
    </div>
    """, unsafe_allow_html=True)

    # Sidebar for user preferences
    with st.sidebar:
        st.header("🔧 Settings")
        
        # Language selection
        languages = ["English", "हिंदी (Hindi)", "தமிழ் (Tamil)", "বাংলা (Bengali)", "ಕನ್ನಡ (Kannada)"]
        st.session_state.selected_language = st.selectbox("Select Language", languages)
        
        # Voice input toggle
        st.session_state.audio_input_enabled = st.checkbox("🎤 Enable Voice Input", value=st.session_state.audio_input_enabled)

        if st.session_state.audio_input_enabled:
            st.info("🎙️ Voice input enabled. Use the microphone buttons throughout the app.")
        
        # Location input
        st.session_state.user_location = st.text_input("Your Location (City/Ward)", value=st.session_state.user_location)
        
        st.markdown("---")
        st.markdown("### 📊 Quick Stats")
        st.metric("Active Civic Notices", len(CIVIC_NOTICES))
        st.metric("Documents Generated", "127")
        st.metric("Users Helped", "1,234")

    # Main content tabs
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "🏛️ Civic Dashboard", 
        "⚖️ Legal Assistant", 
        "📄 Document Generator", 
        "💬 AI Chat", 
        "🎙️ Voice Demo",
        "📊 My Activity"
    ])

    with tab1:
        civic_dashboard()
    
    with tab2:
        legal_assistant()
    
    with tab3:
        document_generator()
    
    with tab4:
        ai_chat()
    
    with tab5:
        voice_demo_tab()
    
    with tab6:
        activity_tracker()

def civic_dashboard():
    st.header("🏛️ Civic Awareness Dashboard")
    
    # Location-based filtering
    if st.session_state.user_location:
        st.success(f"📍 Showing information for: {st.session_state.user_location}")
    else:
        st.warning("📍 Set your location in the sidebar for personalized civic updates")
    
    # Active alerts
    st.subheader("🚨 Active Civic Alerts")
    
    for notice in CIVIC_NOTICES:
        with st.container():
            col1, col2, col3 = st.columns([3, 1, 1])
            
            with col1:
                st.markdown(f"**{notice['title']}**")
                st.write(notice['summary'])
                st.caption(f"📅 {notice['date']} | 📍 {notice['location']} | 🏷️ {notice['category']}")
            
            with col2:
                if notice['action_required']:
                    st.error("Action Required")
                else:
                    st.info("Informational")
            
            with col3:
                if st.button(f"View Details", key=f"view_{notice['title']}"):
                    show_notice_details(notice)
            
            st.markdown("---")

def show_notice_details(notice):
    st.modal("Notice Details")
    with st.container():
        st.markdown(f"### {notice['title']}")
        st.write(f"**Date:** {notice['date']}")
        st.write(f"**Location:** {notice['location']}")
        st.write(f"**Category:** {notice['category']}")
        st.write(f"**Summary:** {notice['summary']}")
        
        if notice['action_required']:
            st.markdown("### 🎯 Recommended Actions:")
            st.write("1. Attend the public hearing")
            st.write("2. Submit written feedback")
            st.write("3. Contact your local representative")
            
            if st.button("Generate Feedback Letter"):
                st.success("Feedback letter template generated! Check the Document Generator tab.")

def legal_assistant():
    st.header("⚖️ Legal Rights Companion")
    
    # Quick legal scenarios
    st.subheader("🔍 Common Legal Scenarios")
    
    scenarios = [
        "Landlord not returning security deposit",
        "Workplace harassment or discrimination",
        "Consumer complaint against defective product",
        "Property dispute with neighbor",
        "Traffic challan dispute",
        "Bank loan or credit card issues"
    ]
    
    selected_scenario = st.selectbox("Select a common scenario or describe your issue below:", 
                                   ["Select a scenario..."] + scenarios)
    
    if selected_scenario != "Select a scenario...":
        show_legal_guidance(selected_scenario)
    
    # Custom legal query with voice input
    st.subheader("💭 Describe Your Legal Issue")

    if st.session_state.audio_input_enabled:
        user_query = voice_input_component(
            key="legal_query",
            language=st.session_state.selected_language,
            placeholder="Describe your legal situation or use voice input...",
            duration=10
        )
    else:
        user_query = st.text_area("Describe your situation in detail:", 
                                 placeholder="e.g., My landlord is asking me to vacate without proper notice...")

    if st.button("Get Legal Guidance") and user_query:
        provide_legal_guidance(user_query)

def show_legal_guidance(scenario):
    st.markdown("### 📋 Legal Guidance")
    
    guidance_data = {
        "Landlord not returning security deposit": {
            "rights": "Under the Rent Control Act, landlords must return security deposits within 30 days of lease termination, minus legitimate deductions.",
            "actions": [
                "Send a written demand notice",
                "File complaint with local rent controller",
                "Approach consumer court if applicable",
                "Seek legal aid if needed"
            ],
            "documents": ["Demand Notice", "Complaint Letter"],
            "resources": ["Local Rent Controller Office", "Consumer Court", "Legal Aid Clinic"]
        }
    }
    
    if scenario in guidance_data:
        data = guidance_data[scenario]
        
        st.markdown("#### 🛡️ Your Rights:")
        st.info(data["rights"])
        
        st.markdown("#### 📝 Recommended Actions:")
        for i, action in enumerate(data["actions"], 1):
            st.write(f"{i}. {action}")
        
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### 📄 Documents You Can Generate:")
            for doc in data["documents"]:
                st.write(f"• {doc}")
        
        with col2:
            st.markdown("#### 🏢 Helpful Resources:")
            for resource in data["resources"]:
                st.write(f"• {resource}")

def provide_legal_guidance(query):
    # Simulate AI-powered legal guidance
    st.markdown("### 🤖 AI Legal Analysis")
    
    with st.spinner("Analyzing your legal situation..."):
        # Simulate processing time
        import time
        time.sleep(2)
    
    st.success("Analysis Complete!")
    
    # Mock AI response
    st.markdown("#### 📊 Situation Analysis:")
    st.write("Based on your description, this appears to be a landlord-tenant dispute involving improper notice procedures.")
    
    st.markdown("#### ⚖️ Applicable Laws:")
    st.write("• Rent Control Act (State-specific)")
    st.write("• Consumer Protection Act, 2019")
    st.write("• Indian Contract Act, 1872")
    
    st.markdown("#### 🎯 Immediate Steps:")
    st.write("1. Document all communications with your landlord")
    st.write("2. Check your lease agreement for notice period clauses")
    st.write("3. Send a legal notice requesting proper notice period")
    st.write("4. Contact local tenant rights organization")
    
    if st.button("Generate Legal Notice"):
        st.success("Legal notice template has been prepared! Check the Document Generator tab.")

def document_generator():
    st.header("📄 Document Generator")
    
    st.subheader("📝 Generate Legal Documents")
    
    doc_type = st.selectbox("Select Document Type:", list(LEGAL_TEMPLATES.keys()))
    
    if doc_type:
        template_data = LEGAL_TEMPLATES[doc_type]
        
        st.markdown(f"### Generating: {doc_type}")
        
        # Create form for template fields
        form_data = {}
        with st.form(f"{doc_type}_form"):
            st.markdown("#### Fill in the required information:")
            
            for field in template_data["fields"]:
                if field == "date":
                    form_data[field] = datetime.now().strftime("%Y-%m-%d")
                else:
                    form_data[field] = st.text_input(
                        field.replace("_", " ").title(),
                        key=f"{doc_type}_{field}"
                    )
            
            submitted = st.form_submit_button("Generate Document")
            
            if submitted:
                # Generate document
                generated_doc = template_data["template"].format(**form_data)
                
                st.success("Document generated successfully!")
                
                # Display generated document
                st.markdown("### 📄 Generated Document:")
                st.text_area("Document Content:", generated_doc, height=400)
                
                # Download button
                st.download_button(
                    label="📥 Download Document",
                    data=generated_doc,
                    file_name=f"{doc_type.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.txt",
                    mime="text/plain"
                )

def ai_chat():
    st.header("💬 AI Legal & Civic Assistant")
    
    # Chat interface
    st.subheader("🤖 Chat with LokAI")
    
    # Display chat history
    for message in st.session_state.chat_history:
        if message["role"] == "user":
            st.markdown(f"**You:** {message['content']}")
        else:
            st.markdown(f"**LokAI:** {message['content']}")
    
    # Voice-enabled chat interface
    if st.session_state.audio_input_enabled:
        st.markdown("### 🎙️ Voice Chat")
        voice_text = voice_chat_component(st.session_state.selected_language)
        
        if voice_text and st.button("Send Voice Message"):
            # Add user message to history
            st.session_state.chat_history.append({"role": "user", "content": voice_text})
            
            # Generate AI response
            ai_response = generate_ai_response(voice_text)
            st.session_state.chat_history.append({"role": "assistant", "content": ai_response})
            
            # Generate TTS for AI response
            tts_html = speech_processor.text_to_speech_url(ai_response, st.session_state.selected_language)
            st.markdown("**AI Response (Click to listen):**")
            st.markdown(tts_html, unsafe_allow_html=True)
            
            st.rerun()

    # Traditional text input
    st.markdown("### ⌨️ Text Chat")
    user_input = st.text_input("Ask me anything about legal rights or civic matters:", 
                              placeholder="e.g., What are my rights as a tenant?")

    if st.button("Send") and user_input:
        # Add user message to history
        st.session_state.chat_history.append({"role": "user", "content": user_input})
        
        # Generate AI response
        ai_response = generate_ai_response(user_input)
        st.session_state.chat_history.append({"role": "assistant", "content": ai_response})
        
        st.rerun()
    
    # Quick action buttons
    st.subheader("🚀 Quick Actions")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("🏠 Tenant Rights"):
            quick_response("tenant_rights")
    
    with col2:
        if st.button("🚗 Traffic Rules"):
            quick_response("traffic_rules")
    
    with col3:
        if st.button("💼 Labor Laws"):
            quick_response("labor_laws")

def generate_ai_response(user_input):
    # Mock AI response generation
    responses = {
        "tenant": "As a tenant in India, you have several important rights including the right to peaceful enjoyment of the property, protection against arbitrary eviction, and the right to get your security deposit back. The specific laws vary by state, but generally landlords must provide proper notice before eviction and cannot increase rent arbitrarily.",
        "traffic": "Indian traffic rules are governed by the Motor Vehicles Act, 1988. Key points include mandatory helmet for two-wheelers, seat belts for cars, speed limits, and prohibition of mobile phone use while driving. Violations can result in fines and license suspension.",
        "labor": "Indian labor laws provide extensive protection to workers including minimum wage rights, working hour limits (typically 8 hours/day), overtime compensation, and protection against unfair dismissal. The Industrial Disputes Act and various state-specific laws govern employment relationships."
    }
    
    # Simple keyword matching for demo
    user_lower = user_input.lower()
    if "tenant" in user_lower or "landlord" in user_lower or "rent" in user_lower:
        return responses["tenant"]
    elif "traffic" in user_lower or "driving" in user_lower or "vehicle" in user_lower:
        return responses["traffic"]
    elif "job" in user_lower or "work" in user_lower or "employee" in user_lower:
        return responses["labor"]
    else:
        return f"I understand you're asking about: '{user_input}'. This is an important legal/civic matter. Let me provide you with relevant information and suggest the best course of action. Would you like me to help you generate any specific documents or connect you with local resources?"

def quick_response(topic):
    responses = {
        "tenant_rights": "🏠 **Tenant Rights Summary**: You have the right to peaceful enjoyment, proper notice for eviction (usually 30 days), return of security deposit, and protection against arbitrary rent increases. Would you like me to generate a tenant rights document?",
        "traffic_rules": "🚗 **Traffic Rules Update**: Recent changes include increased penalties for violations, mandatory FASTag, and stricter drunk driving laws. Always carry valid documents and follow speed limits.",
        "labor_laws": "💼 **Labor Rights**: You're entitled to minimum wage, 8-hour work day, overtime pay, and protection against unfair dismissal. File complaints with Labor Commissioner for violations."
    }
    
    st.session_state.chat_history.append({"role": "assistant", "content": responses[topic]})
    st.rerun()

def activity_tracker():
    st.header("📊 My Activity & Alerts")
    
    # User activity summary
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Documents Generated", "5", "2")
    with col2:
        st.metric("Legal Queries", "12", "3")
    with col3:
        st.metric("Civic Alerts", "8", "1")
    with col4:
        st.metric("Actions Taken", "3", "1")
    
    # Recent activity
    st.subheader("📋 Recent Activity")
    
    activities = [
        {"date": "2024-01-15", "action": "Generated RTI Application", "status": "Completed"},
        {"date": "2024-01-14", "action": "Legal Query: Tenant Rights", "status": "Resolved"},
        {"date": "2024-01-13", "action": "Civic Alert: Water Tax Hearing", "status": "Pending Action"},
        {"date": "2024-01-12", "action": "Generated Complaint Letter", "status": "Sent"},
    ]
    
    for activity in activities:
        col1, col2, col3 = st.columns([2, 3, 1])
        with col1:
            st.write(activity["date"])
        with col2:
            st.write(activity["action"])
        with col3:
            if activity["status"] == "Pending Action":
                st.error(activity["status"])
            elif activity["status"] == "Completed":
                st.success(activity["status"])
            else:
                st.info(activity["status"])
    
    # Upcoming reminders
    st.subheader("⏰ Upcoming Reminders")
    
    reminders = [
        {"date": "2024-01-20", "reminder": "Water Tax Public Hearing", "priority": "High"},
        {"date": "2024-01-25", "reminder": "Follow up on complaint letter", "priority": "Medium"},
        {"date": "2024-02-01", "reminder": "New traffic rules effective", "priority": "Low"},
    ]
    
    for reminder in reminders:
        priority_color = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}
        st.write(f"{priority_color[reminder['priority']]} **{reminder['date']}**: {reminder['reminder']}")

if __name__ == "__main__":
    main()
