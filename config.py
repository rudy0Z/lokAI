import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_TRANSLATE_API_KEY = os.getenv("GOOGLE_TRANSLATE_API_KEY")

# Application Configuration
SUPPORTED_LANGUAGES = {
    "English": "en",
    "हिंदी (Hindi)": "hi",
    "தமிழ் (Tamil)": "ta",
    "বাংলা (Bengali)": "bn",
    "ಕನ್ನಡ (Kannada)": "kn"
}

# Legal Templates and Data
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

# Civic Data Sources (for web scraping)
CIVIC_DATA_SOURCES = {
    "central": [
        "https://www.india.gov.in",
        "https://www.mygov.in"
    ],
    "state_portals": {
        "Maharashtra": "https://www.maharashtra.gov.in",
        "Karnataka": "https://www.karnataka.gov.in",
        "Tamil Nadu": "https://www.tn.gov.in"
    }
}
