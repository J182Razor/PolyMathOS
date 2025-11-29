"""
SwarmShield Integration Module
Enterprise-grade security system for swarm-based multi-agent communications
"""

import os
import logging
from typing import Optional, Dict, Any, List
import json

logger = logging.getLogger(__name__)

# Try to import SwarmShield
try:
    from swarm_shield.main import SwarmShield, EncryptionStrength
    SWARM_SHIELD_AVAILABLE = True
except ImportError:
    SWARM_SHIELD_AVAILABLE = False
    logger.warning("SwarmShield not available. Install with: pip install swarm-shield")
    SwarmShield = None
    EncryptionStrength = None


class SwarmShieldIntegration:
    """Integration wrapper for SwarmShield security functionality"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = SWARM_SHIELD_AVAILABLE
        self.shield: Optional[SwarmShield] = None
        
        if not self.available:
            logger.warning("SwarmShield package not installed. Security features will be unavailable.")
            return
        
        try:
            # Initialize SwarmShield with encryption strength from config
            encryption_level = self.config.get("encryption_strength", "MAXIMUM")
            strength_map = {
                "STANDARD": EncryptionStrength.STANDARD,
                "ENHANCED": EncryptionStrength.ENHANCED,
                "MAXIMUM": EncryptionStrength.MAXIMUM
            }
            strength = strength_map.get(encryption_level, EncryptionStrength.MAXIMUM)
            
            self.shield = SwarmShield(encryption_strength=strength)
            logger.info("SwarmShield initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize SwarmShield: {e}")
            self.available = False
    
    def protect_message(self, agent_name: str, message: str) -> str:
        """
        Protect a message with encryption.
        
        Args:
            agent_name: Name of the agent sending the message
            message: Message content to protect
        
        Returns:
            Protected/encrypted message
        """
        if not self.available or not self.shield:
            return message  # Return unencrypted if not available
        
        try:
            protected = self.shield.protect_message(agent_name, message)
            return protected
        except Exception as e:
            logger.error(f"Message protection failed: {e}")
            return message
    
    def create_conversation(self, name: str) -> Optional[str]:
        """Create a new secure conversation"""
        if not self.available or not self.shield:
            return None
        
        try:
            conversation_id = self.shield.create_conversation(name)
            return conversation_id
        except Exception as e:
            logger.error(f"Conversation creation failed: {e}")
            return None
    
    def add_message(self, conversation_id: str, agent_name: str, message: str) -> bool:
        """Add a message to a conversation"""
        if not self.available or not self.shield:
            return False
        
        try:
            self.shield.add_message(conversation_id, agent_name, message)
            return True
        except Exception as e:
            logger.error(f"Add message failed: {e}")
            return False
    
    def get_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Get messages from a conversation"""
        if not self.available or not self.shield:
            return []
        
        try:
            messages = self.shield.get_messages(conversation_id)
            return [
                {
                    "agent": agent,
                    "message": msg,
                    "timestamp": ts
                }
                for agent, msg, ts in messages
            ]
        except Exception as e:
            logger.error(f"Get messages failed: {e}")
            return []
    
    def get_conversation_summary(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Get summary of a conversation"""
        if not self.available or not self.shield:
            return None
        
        try:
            summary = self.shield.get_conversation_summary(conversation_id)
            return summary
        except Exception as e:
            logger.error(f"Get conversation summary failed: {e}")
            return None
    
    def export_conversation(self, conversation_id: str, format: str = "json", path: Optional[str] = None) -> Optional[str]:
        """Export conversation to file"""
        if not self.available or not self.shield:
            return None
        
        try:
            export_path = self.shield.export_conversation(conversation_id, format=format, path=path)
            return export_path
        except Exception as e:
            logger.error(f"Export conversation failed: {e}")
            return None
    
    def get_agent_stats(self, agent_name: str) -> Optional[Dict[str, Any]]:
        """Get statistics for an agent"""
        if not self.available or not self.shield:
            return None
        
        try:
            stats = self.shield.get_agent_stats(agent_name)
            return stats
        except Exception as e:
            logger.error(f"Get agent stats failed: {e}")
            return None
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        return {
            "status": "healthy" if self.available else "unavailable",
            "available": self.available,
            "initialized": self.shield is not None
        }


def get_swarm_shield_integration(config: Optional[Dict] = None) -> SwarmShieldIntegration:
    """Get or create SwarmShield integration instance"""
    return SwarmShieldIntegration(config)


