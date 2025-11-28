"""
Swarms Tools Integration Module
Integrates swarms-tools for extended agent capabilities including:
- Financial data tools (HTX, Yahoo Finance, CoinGecko, DeFi)
- Web scraping tools
- Social media tools (Twitter, Telegram)
- Development tools (GitHub, Code Executor)
- Search and analytics tools
"""

import os
import logging
from typing import Optional, Dict, Any, List
import json

logger = logging.getLogger(__name__)

# Try to import swarms-tools
try:
    import swarms_tools
    from swarms_tools import (
        fetch_htx_data,
        fetch_stock_news,
        yahoo_finance_api,
        coin_gecko_coin_api,
        telegram_dm_or_tag_api,
    )
    from swarms_tools.search.web_scraper import scrape_single_url_sync
    from swarms_tools.finance.dex_screener import (
        fetch_latest_token_boosts,
        fetch_dex_screener_profiles,
    )
    from swarms_tools.devs.github import GitHubTool
    from swarms_tools.devs.code_executor import CodeExecutor
    from swarms_tools.social_media.twitter_tool import TwitterTool
    from swarms_tools.structs import tool_chainer
    SWARMS_TOOLS_AVAILABLE = True
except ImportError:
    SWARMS_TOOLS_AVAILABLE = False
    logger.warning("swarms-tools not available. Install with: pip install swarms-tools")


class SwarmsToolsIntegration:
    """Integration wrapper for swarms-tools functionality"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = SWARMS_TOOLS_AVAILABLE
        
        if not self.available:
            logger.warning("swarms-tools not installed. Some features will be unavailable.")
            return
        
        # Initialize tools
        self.github_tool = None
        self.code_executor = None
        self.twitter_tool = None
        
        try:
            # Initialize GitHub tool
            self.github_tool = GitHubTool()
            
            # Initialize code executor
            self.code_executor = CodeExecutor()
            
            # Initialize Twitter tool if credentials provided
            twitter_config = self.config.get('twitter', {})
            if twitter_config.get('apiKey'):
                self.twitter_tool = TwitterTool(twitter_config)
            
            logger.info("Swarms Tools integration initialized")
        except Exception as e:
            logger.error(f"Failed to initialize some swarms-tools: {e}")
    
    # Financial Data Tools
    def get_htx_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get HTX trading data"""
        if not self.available:
            return None
        try:
            return fetch_htx_data(symbol)
        except Exception as e:
            logger.error(f"Failed to fetch HTX data: {e}")
            return None
    
    def get_stock_news(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get stock news"""
        if not self.available:
            return None
        try:
            return fetch_stock_news(symbol)
        except Exception as e:
            logger.error(f"Failed to fetch stock news: {e}")
            return None
    
    def get_yahoo_finance_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get Yahoo Finance data"""
        if not self.available:
            return None
        try:
            return yahoo_finance_api(symbol)
        except Exception as e:
            logger.error(f"Failed to fetch Yahoo Finance data: {e}")
            return None
    
    def get_crypto_data(self, coin_id: str) -> Optional[Dict[str, Any]]:
        """Get CoinGecko cryptocurrency data"""
        if not self.available:
            return None
        try:
            return coin_gecko_coin_api(coin_id)
        except Exception as e:
            logger.error(f"Failed to fetch crypto data: {e}")
            return None
    
    def get_dex_screener_profiles(self) -> Optional[List[Dict[str, Any]]]:
        """Get DEX Screener profiles"""
        if not self.available:
            return None
        try:
            return fetch_dex_screener_profiles()
        except Exception as e:
            logger.error(f"Failed to fetch DEX Screener profiles: {e}")
            return None
    
    def get_dex_token_boosts(self) -> Optional[List[Dict[str, Any]]]:
        """Get latest token boosts from DEX Screener"""
        if not self.available:
            return None
        try:
            return fetch_latest_token_boosts()
        except Exception as e:
            logger.error(f"Failed to fetch token boosts: {e}")
            return None
    
    # Web Scraping Tools
    def scrape_url(self, url: str) -> Optional[Dict[str, Any]]:
        """Scrape a single URL"""
        if not self.available:
            return None
        try:
            content = scrape_single_url_sync(url)
            return {
                "title": content.title if hasattr(content, 'title') else None,
                "text": content.text if hasattr(content, 'text') else None,
                "url": url
            }
        except Exception as e:
            logger.error(f"Failed to scrape URL: {e}")
            return None
    
    # Social Media Tools
    def send_telegram_message(self, message: str) -> bool:
        """Send Telegram message"""
        if not self.available:
            return False
        try:
            telegram_dm_or_tag_api(message)
            return True
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False
    
    def post_tweet(self, text: str) -> bool:
        """Post a tweet"""
        if not self.available or not self.twitter_tool:
            logger.warning("Twitter tool not available")
            return False
        try:
            post_tweet_func = self.twitter_tool.get_function("post_tweet")
            post_tweet_func(text)
            return True
        except Exception as e:
            logger.error(f"Failed to post tweet: {e}")
            return False
    
    # Development Tools
    def get_github_repo(self, repo_path: str) -> Optional[Dict[str, Any]]:
        """Get GitHub repository information"""
        if not self.available or not self.github_tool:
            return None
        try:
            return self.github_tool.get_repository(repo_path)
        except Exception as e:
            logger.error(f"Failed to get GitHub repo: {e}")
            return None
    
    def execute_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Execute code securely"""
        if not self.available or not self.code_executor:
            return None
        try:
            result = self.code_executor.execute(code)
            return {"result": result, "success": True}
        except Exception as e:
            logger.error(f"Failed to execute code: {e}")
            return {"error": str(e), "success": False}
    
    # Tool Orchestration
    def chain_tools(self, tools: List[callable], parallel: bool = False) -> List[Any]:
        """Chain multiple tools together"""
        if not self.available:
            return []
        try:
            return tool_chainer(tools, parallel=parallel)
        except Exception as e:
            logger.error(f"Failed to chain tools: {e}")
            return []


# Global instance
swarms_tools_integration: Optional[SwarmsToolsIntegration] = None

def get_swarms_tools_integration(config: Optional[Dict] = None) -> SwarmsToolsIntegration:
    """Get or create swarms-tools integration instance"""
    global swarms_tools_integration
    if swarms_tools_integration is None:
        swarms_tools_integration = SwarmsToolsIntegration(config)
    return swarms_tools_integration

