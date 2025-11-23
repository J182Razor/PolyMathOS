import os
from typing import Dict, Any
import logging
from pathlib import Path
from dotenv import load_dotenv, set_key

logger = logging.getLogger(__name__)

class ConfigManager:
    def __init__(self, env_file_path: str = ".env"):
        self.env_file_path = Path(env_file_path)
        self._ensure_env_file()
        self.load_config()

    def _ensure_env_file(self):
        """Ensure the .env file exists"""
        if not self.env_file_path.exists():
            self.env_file_path.touch()

    def load_config(self):
        """Load configuration from .env file into environment"""
        load_dotenv(self.env_file_path, override=True)

    def get(self, key: str, default: Any = None) -> Any:
        """Get a configuration value"""
        return os.getenv(key, default)

    def set(self, key: str, value: str):
        """Set a configuration value and update the .env file"""
        try:
            # Update the file
            set_key(self.env_file_path, key, value)
            # Update current environment
            os.environ[key] = value
            return True
        except Exception as e:
            logger.error(f"Failed to set config {key}: {e}")
            return False

    def update_bulk(self, config: Dict[str, str]) -> Dict[str, bool]:
        """Update multiple configuration values"""
        results = {}
        for key, value in config.items():
            results[key] = self.set(key, value)
        return results

# Global instance
config_manager = ConfigManager(env_file_path=os.path.join(os.getcwd(), ".env"))

