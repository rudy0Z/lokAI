from typing import Dict, Optional
import json

class MultilingualSupport:
    """Handle multilingual content translation and localization"""
    
    def __init__(self):
        # Mock translation data - in production, use Google Translate API
        self.translations = {
            'hi': {  # Hindi
                'welcome': 'स्वागत है',
                'legal_rights': 'कानूनी अधिकार',
                'civic_updates': 'नागरिक अपडेट',
                'generate_document': 'दस्तावेज़ बनाएं',
                'tenant_rights': 'किरायेदार के अधिकार',
                'complaint_letter': 'शिकायत पत्र'
            },
            'ta': {  # Tamil
                'welcome': 'வரவேற்கிறோம்',
                'legal_rights': 'சட்ட உரிமைகள்',
                'civic_updates': 'குடிமக்கள் புதுப்பிப்புகள்',
                'generate_document': 'ஆவணத்தை உருவாக்கவும்',
                'tenant_rights': 'குத்தகைதாரர் உரிமைகள்',
                'complaint_letter': 'புகார் கடிதம்'
            },
            'bn': {  # Bengali
                'welcome': 'স্বাগতম',
                'legal_rights': 'আইনি অধিকার',
                'civic_updates': 'নাগরিক আপডেট',
                'generate_document': 'নথি তৈরি করুন',
                'tenant_rights': 'ভাড়াটিয়ার অধিকার',
                'complaint_letter': 'অভিযোগ পত্র'
            }
        }
    
    def translate_text(self, text: str, target_language: str) -> str:
        """Translate text to target language"""
        # Mock translation - in production, use actual translation API
        if target_language == 'en' or target_language not in self.translations:
            return text
        
        # Simple word replacement for demo
        translated = text
        for english_word, translated_word in self.translations[target_language].items():
            translated = translated.replace(english_word, translated_word)
        
        return translated
    
    def get_localized_content(self, content_key: str, language: str) -> str:
        """Get localized content for a specific key"""
        lang_code = self.get_language_code(language)
        
        if lang_code in self.translations and content_key in self.translations[lang_code]:
            return self.translations[lang_code][content_key]
        
        return content_key  # Return key if translation not found
    
    def get_language_code(self, language_display: str) -> str:
        """Convert display language to language code"""
        language_map = {
            'हिंदी (Hindi)': 'hi',
            'தமிழ் (Tamil)': 'ta',
            'বাংলা (Bengali)': 'bn',
            'ಕನ್ನಡ (Kannada)': 'kn'
        }
        return language_map.get(language_display, 'en')
    
    def format_legal_document(self, template: str, language: str, data: Dict) -> str:
        """Format legal document in specified language"""
        # Translate template if needed
        if language != 'English':
            template = self.translate_text(template, self.get_language_code(language))
        
        # Format with user data
        try:
            formatted_doc = template.format(**data)
            return formatted_doc
        except KeyError as e:
            return f"Error formatting document: Missing field {e}"
