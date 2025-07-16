import PyPDF2
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import re

class DocumentProcessor:
    """Handles document processing and web scraping for civic data"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def extract_pdf_text(self, pdf_file) -> str:
        """Extract text from uploaded PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            return f"Error extracting PDF: {str(e)}"
    
    def scrape_government_notices(self, url: str) -> List[Dict]:
        """Scrape government websites for civic notices"""
        try:
            response = self.session.get(url, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            notices = []
            # Generic scraping logic - would need customization per site
            notice_elements = soup.find_all(['div', 'article', 'section'], 
                                          class_=re.compile(r'notice|announcement|news'))
            
            for element in notice_elements[:5]:  # Limit to 5 notices
                title = element.find(['h1', 'h2', 'h3', 'h4'])
                content = element.find(['p', 'div'])
                
                if title and content:
                    notices.append({
                        'title': title.get_text().strip(),
                        'content': content.get_text().strip()[:200] + "...",
                        'source': url,
                        'scraped_at': str(datetime.now())
                    })
            
            return notices
        except Exception as e:
            return [{'error': f"Failed to scrape {url}: {str(e)}"}]
    
    def summarize_document(self, text: str, max_length: int = 200) -> str:
        """Summarize document text using simple extractive method"""
        sentences = text.split('.')
        # Simple scoring based on sentence length and position
        scored_sentences = []
        
        for i, sentence in enumerate(sentences):
            if len(sentence.strip()) > 20:  # Filter out very short sentences
                score = len(sentence.split()) / (i + 1)  # Favor longer, earlier sentences
                scored_sentences.append((score, sentence.strip()))
        
        # Sort by score and take top sentences
        scored_sentences.sort(reverse=True)
        summary_sentences = [sent[1] for sent in scored_sentences[:3]]
        
        summary = '. '.join(summary_sentences)
        return summary[:max_length] + "..." if len(summary) > max_length else summary
