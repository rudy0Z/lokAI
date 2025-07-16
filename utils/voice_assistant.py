import streamlit as st
from utils.speech_processor import speech_processor
from typing import Dict, List, Optional
import json
import time

class VoiceAssistant:
    """Advanced voice assistant with conversation management"""
    
    def __init__(self):
        self.conversation_context = []
        self.voice_commands = {
            "generate document": self.handle_document_generation,
            "legal help": self.handle_legal_query,
            "civic update": self.handle_civic_query,
            "my rights": self.handle_rights_query,
            "complaint letter": self.handle_complaint_generation,
            "rti application": self.handle_rti_generation
        }
    
    def process_voice_command(self, voice_text: str, language: str) -> Dict:
        """Process voice command and determine intent"""
        
        voice_lower = voice_text.lower()
        detected_intent = None
        confidence = 0.0
        
        # Intent detection based on keywords
        for command, handler in self.voice_commands.items():
            if any(keyword in voice_lower for keyword in command.split()):
                detected_intent = command
                confidence = 0.8
                break
        
        # If no specific command detected, treat as general query
        if not detected_intent:
            detected_intent = "general_query"
            confidence = 0.6
        
        return {
            "intent": detected_intent,
            "confidence": confidence,
            "original_text": voice_text,
            "language": language,
            "timestamp": time.time()
        }
    
    def handle_document_generation(self, context: Dict) -> str:
        """Handle document generation requests"""
        return "I can help you generate legal documents. What type of document do you need - RTI application, complaint letter, or legal notice?"
    
    def handle_legal_query(self, context: Dict) -> str:
        """Handle legal help requests"""
        return "I'm here to help with your legal questions. Please describe your legal issue in detail, and I'll provide relevant information about your rights and possible actions."
    
    def handle_civic_query(self, context: Dict) -> str:
        """Handle civic update requests"""
        return "Let me check for civic updates in your area. I can provide information about local government notices, public meetings, and policy changes."
    
    def handle_rights_query(self, context: Dict) -> str:
        """Handle rights-related queries"""
        return "I can explain your legal rights in various situations. Are you asking about tenant rights, consumer rights, labor rights, or something else?"
    
    def handle_complaint_generation(self, context: Dict) -> str:
        """Handle complaint letter generation"""
        return "I'll help you generate a complaint letter. Please provide details about: 1) Who you're complaining to, 2) What the issue is, and 3) What resolution you're seeking."
    
    def handle_rti_generation(self, context: Dict) -> str:
        """Handle RTI application generation"""
        return "I'll help you create an RTI application. Please tell me: 1) Which government department, 2) What information you need, and 3) Your contact details."
    
    def generate_voice_response(self, text: str, language: str) -> str:
        """Generate voice response HTML"""
        return speech_processor.text_to_speech_url(text, language)
    
    def conversation_flow(self, voice_input: str, language: str) -> Dict:
        """Manage conversation flow with context"""
        
        # Process the voice command
        command_result = self.process_voice_command(voice_input, language)
        
        # Generate appropriate response
        if command_result["intent"] in self.voice_commands:
            response_text = self.voice_commands[command_result["intent"]](command_result)
        else:
            response_text = f"I heard: '{voice_input}'. How can I help you with legal or civic matters?"
        
        # Add to conversation context
        self.conversation_context.append({
            "user_input": voice_input,
            "intent": command_result["intent"],
            "response": response_text,
            "timestamp": command_result["timestamp"],
            "language": language
        })
        
        return {
            "response_text": response_text,
            "intent": command_result["intent"],
            "confidence": command_result["confidence"],
            "voice_response_html": self.generate_voice_response(response_text, language)
        }

# Global voice assistant instance
voice_assistant = VoiceAssistant()
