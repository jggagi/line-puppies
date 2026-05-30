import yfinance as yf
import pandas as pd
import logging
from datetime import datetime
from .base import BaseMarketDataFetcher

logger = logging.getLogger(__name__)

class YahooFinanceFetcher(BaseMarketDataFetcher):
    """
    Implementation of BaseMarketDataFetcher using the yfinance library.
    """

    def get_historical_prices(self, ticker: str, period: str = "1mo") -> pd.DataFrame:
        """
        Fetches historical price data using yfinance.
        """
        logger.info(f"Fetching historical prices for {ticker} over period: {period}")
        try:
            ticker_obj = yf.Ticker(ticker)
            df = ticker_obj.history(period=period)
            
            if df.empty:
                logger.warning(f"No price data found for ticker {ticker} and period {period}")
                return pd.DataFrame(columns=['Open', 'High', 'Low', 'Close', 'Volume'])
            
            # Reset index or make sure Date/Datetime is clearly formatted if needed
            # yfinance returns timezone-aware index sometimes, let's keep it clean
            return df
        except Exception as e:
            logger.error(f"Error fetching historical prices from yfinance for {ticker}: {e}")
            return pd.DataFrame(columns=['Open', 'High', 'Low', 'Close', 'Volume'])

    def get_recent_news(self, ticker: str) -> list[dict]:
        """
        Fetches recent news using yfinance and formats it.
        """
        logger.info(f"Fetching recent news for {ticker}")
        try:
            ticker_obj = yf.Ticker(ticker)
            raw_news = ticker_obj.news
            
            if not raw_news:
                logger.warning(f"No news found for ticker {ticker}")
                return []
            
            formatted_news = []
            for item in raw_news:
                # Map yfinance keys to standard structure
                title = item.get("title", "No Title")
                publisher = item.get("publisher", "Unknown Publisher")
                link = item.get("link", "#")
                
                # Try to get publish time (standard yfinance key is providerPublishTime)
                pub_time = item.get("providerPublishTime", 0)
                if isinstance(pub_time, int) and pub_time > 0:
                    pub_str = datetime.fromtimestamp(pub_time).strftime('%Y-%m-%d %H:%M:%S')
                else:
                    pub_str = "Recent"
                
                formatted_news.append({
                    "title": title,
                    "publisher": publisher,
                    "link": link,
                    "published": pub_str
                })
            return formatted_news
        except Exception as e:
            logger.error(f"Error fetching news from yfinance for {ticker}: {e}")
            return []
