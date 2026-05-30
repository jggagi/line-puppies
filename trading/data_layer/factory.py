from .base import BaseMarketDataFetcher
from .yahoo_fetcher import YahooFinanceFetcher
from .google_fetcher import GoogleFinanceFetcher

def get_fetcher(provider: str = "yahoo") -> BaseMarketDataFetcher:
    """
    Factory function to retrieve the configured Market Data Fetcher.
    
    Args:
        provider: The string identifier of the provider ('yahoo' or 'google').
        
    Returns:
        An instance of BaseMarketDataFetcher.
    """
    provider_clean = provider.strip().lower()
    
    if provider_clean in ["yahoo", "yfinance"]:
        return YahooFinanceFetcher()
    elif provider_clean in ["google", "googlefinance"]:
        return GoogleFinanceFetcher()
    else:
        # Fallback to yahoo rather than raising ValueError to improve resilience
        import logging
        logging.getLogger(__name__).warning(f"Unknown provider '{provider}', defaulting to YahooFinanceFetcher")
        return YahooFinanceFetcher()
