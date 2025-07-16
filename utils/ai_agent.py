from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json

class CivicAIAgent:
    """Agentic AI system for proactive civic engagement"""
    
    def __init__(self):
        self.user_preferences = {}
        self.interaction_history = []
        self.pending_actions = []
    
    def analyze_user_context(self, user_data: Dict) -> Dict:
        """Analyze user context for personalized recommendations"""
        context = {
            'location': user_data.get('location', ''),
            'interests': user_data.get('interests', []),
            'past_queries': user_data.get('query_history', []),
            'engagement_level': self.calculate_engagement_level(user_data)
        }
        return context
    
    def generate_proactive_suggestions(self, context: Dict) -> List[Dict]:
        """Generate proactive suggestions based on user context"""
        suggestions = []
        
        # Location-based suggestions
        if context['location']:
            suggestions.append({
                'type': 'civic_alert',
                'title': f"Upcoming municipal meeting in {context['location']}",
                'description': "Your local ward meeting is scheduled for next week",
                'priority': 'medium',
                'action': 'set_reminder'
            })
        
        # Query history-based suggestions
        if 'tenant' in str(context['past_queries']).lower():
            suggestions.append({
                'type': 'legal_update',
                'title': "New tenant protection laws",
                'description': "Recent amendments to rent control act may affect you",
                'priority': 'high',
                'action': 'read_update'
            })
        
        return suggestions
    
    def calculate_engagement_level(self, user_data: Dict) -> str:
        """Calculate user engagement level"""
        interactions = len(user_data.get('query_history', []))
        documents_generated = user_data.get('documents_generated', 0)
        
        if interactions > 10 or documents_generated > 3:
            return 'high'
        elif interactions > 3 or documents_generated > 1:
            return 'medium'
        else:
            return 'low'
    
    def schedule_follow_up(self, action_type: str, days_ahead: int = 7) -> Dict:
        """Schedule follow-up actions"""
        follow_up_date = datetime.now() + timedelta(days=days_ahead)
        
        follow_up = {
            'id': f"followup_{datetime.now().timestamp()}",
            'type': action_type,
            'scheduled_date': follow_up_date.isoformat(),
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }
        
        self.pending_actions.append(follow_up)
        return follow_up
    
    def get_pending_actions(self) -> List[Dict]:
        """Get all pending actions for the user"""
        current_time = datetime.now()
        due_actions = []
        
        for action in self.pending_actions:
            scheduled_time = datetime.fromisoformat(action['scheduled_date'])
            if scheduled_time <= current_time and action['status'] == 'pending':
                due_actions.append(action)
        
        return due_actions
