from abc import ABC, abstractmethod
import pandas as pd

class BaseMarketDataFetcher(ABC):
    """
    Abstract Base Class for Market Data Fetchers.
    Ensures dependency inversion so that the system is decoupled
    from any specific financial data provider (e.g. yfinance vs Google Finance mock).
    """

    @abstractmethod
    def get_historical_prices(self, ticker: str, period: str = "1mo") -> pd.DataFrame:
        """
        Fetch historical price data.
        
        Args:
            ticker: The stock/ETF ticker symbol (e.g. 'QQQ').
            period: The historical lookback period (e.g. '1mo', '3mo', '6mo', '1y').
            
        Returns:
            A pandas DataFrame with at least Date/Datetime as index and OHLCV columns:
            ['Open', 'High', 'Low', 'Close', 'Volume']
        """
        pass

    @abstractmethod
    def get_recent_news(self, ticker: str) -> list[dict]:
        """
        Fetch recent news related to the ticker.
        
        Args:
            ticker: The stock/ETF ticker symbol.
            
        Returns:
            A list of dictionaries containing news metadata:
            [
                {
                    "title": str,
                    "publisher": str,
                    "link": str,
                    "published": int (POSIX timestamp) or str
                }
            ]
        """
        pass
