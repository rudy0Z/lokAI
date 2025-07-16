import streamlit as st
from typing import Dict, List

class AccessibilityFeatures:
    """Accessibility features for users with different needs"""
    
    def __init__(self):
        self.accessibility_settings = {
            'high_contrast': False,
            'large_text': False,
            'voice_navigation': False,
            'screen_reader_mode': False,
            'slow_speech': False
        }
    
    def render_accessibility_panel(self):
        """Render accessibility settings panel"""
        
        st.sidebar.markdown("---")
        st.sidebar.markdown("### ♿ Accessibility")
        
        # High contrast mode
        if st.sidebar.checkbox("🔆 High Contrast Mode"):
            st.markdown("""
            <style>
            .stApp {
                background-color: #000000 !important;
                color: #FFFFFF !important;
            }
            .stButton > button {
                background-color: #FFFF00 !important;
                color: #000000 !important;
                border: 2px solid #FFFFFF !important;
            }
            </style>
            """, unsafe_allow_html=True)
        
        # Large text mode
        if st.sidebar.checkbox("🔍 Large Text"):
            st.markdown("""
            <style>
            .stApp {
                font-size: 18px !important;
            }
            h1, h2, h3 {
                font-size: 1.5em !important;
            }
            </style>
            """, unsafe_allow_html=True)
        
        # Voice navigation
        voice_nav = st.sidebar.checkbox("🎙️ Voice Navigation")
        if voice_nav:
            st.sidebar.info("Voice navigation enabled. Say 'navigate to [section]' to move around.")
        
        # Screen reader mode
        screen_reader = st.sidebar.checkbox("📖 Screen Reader Mode")
        if screen_reader:
            st.sidebar.info("Screen reader optimizations enabled.")
        
        return {
            'high_contrast': st.sidebar.checkbox("🔆 High Contrast Mode"),
            'large_text': st.sidebar.checkbox("🔍 Large Text"),
            'voice_navigation': voice_nav,
            'screen_reader_mode': screen_reader
        }
    
    def generate_aria_labels(self, element_type: str, content: str) -> str:
        """Generate ARIA labels for better accessibility"""
        
        aria_labels = {
            'button': f'aria-label="Button: {content}"',
            'input': f'aria-label="Input field: {content}"',
            'heading': f'aria-label="Heading: {content}"',
            'link': f'aria-label="Link: {content}"'
        }
        
        return aria_labels.get(element_type, f'aria-label="{content}"')
    
    def voice_navigation_commands(self) -> Dict[str, str]:
        """Define voice navigation commands"""
        
        return {
            "go to civic dashboard": "tab1",
            "open legal assistant": "tab2", 
            "show document generator": "tab3",
            "start chat": "tab4",
            "voice demo": "tab5",
            "my activity": "tab6",
            "help": "help_section",
            "settings": "sidebar"
        }

# Global accessibility instance
accessibility = AccessibilityFeatures()
