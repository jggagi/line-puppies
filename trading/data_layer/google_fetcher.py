import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta
from .base import BaseMarketDataFetcher

logger = logging.getLogger(__name__)

# MOCK IMPLEMENTATION
class GoogleFinanceFetcher(BaseMarketDataFetcher):
    """
    Mock implementation of Google Finance Fetcher.
    Google Finance has no official public API, so this serves as a fallback
    mock data provider, satisfying the BaseMarketDataFetcher contract
    and enabling integration testing without hitting live networks or limits.
    """

    def get_historical_prices(self, ticker: str, period: str = "1mo") -> pd.DataFrame:
        """
        Generates synthetic historical OHLCV data based on a stable random walk.
        Deterministic seed is based on the ticker string to keep values consistent.
        """
        logger.info(f"[MOCK] Generating synthetic prices for {ticker} (Google Finance Mock)")
        
        # Parse period to determine number of days
        days = 30
        if period == "1mo":
            days = 30
        elif period == "3mo":
            days = 90
        elif period == "6mo":
            days = 180
        elif period == "1y":
            days = 365
            
        # Seed NumPy for deterministic generation per ticker
        hash_seed = sum(ord(c) for c in ticker)
        np.random.seed(hash_seed)
        
        # Set starting prices based on ticker
        start_price = 440.0 if ticker.upper() == "QQQ" else 150.0
        
        # Generate date range (excluding weekends)
        end_date = datetime.now()
        dates = []
        curr = end_date - timedelta(days=days * 1.5)  # Generate extra to filter out weekends
        while len(dates) < days:
            if curr.weekday() < 5:  # Monday to Friday
                dates.append(curr)
            curr += timedelta(days=1)
            
        # Random walk for close prices
        returns = np.random.normal(0.0005, 0.012, size=days)  # Small upward drift
        price_multipliers = np.exp(np.cumsum(returns))
        close_prices = start_price * price_multipliers
        
        # Generate OHLCV metrics
        data = []
        for i in range(days):
            close_p = float(close_prices[i])
            # High/Low fluctuation around close and open
            open_p = float(close_prices[i-1]) if i > 0 else start_price * 0.99
            high_p = max(open_p, close_p) * (1.0 + np.random.uniform(0.002, 0.015))
            low_p = min(open_p, close_p) * (1.0 - np.random.uniform(0.002, 0.015))
            volume = int(np.random.uniform(30_000_000, 60_000_000))
            
            data.append({
                "Date": dates[i],
                "Open": open_p,
                "High": high_p,
                "Low": low_p,
                "Close": close_p,
                "Volume": volume
            })
            
        df = pd.DataFrame(data)
        df.set_index("Date", inplace=True)
        # Ensure it has exactly the standard index name and formatting
        df.index = pd.to_datetime(df.index)
        return df

    def get_recent_news(self, ticker: str) -> list[dict]:
        """
        Returns mock news articles designed to simulate realistic market news
        concerning QQQ/Nasdaq macro conditions or specific company events.
        """
        logger.info(f"[MOCK] Generating synthetic news for {ticker} (Google Finance Mock)")
        
        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        one_day_ago = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')
        two_days_ago = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
        
        if ticker.upper() == "QQQ":
            return [
                {
                    "title": "Fed Hints at Sustained Rates as Tech Earnings Continue to Drive Nasdaq Index Highs",
                    "publisher": "Macro Ledger",
                    "link": "https://example.com/fed-tech-nasdaq",
                    "published": now_str
                },
                {
                    "title": "US CPI Prints Coolest Numbers in 6 Months, Triggering Rally in Interest-Sensitive Growth Stocks",
                    "publisher": "Economic Analyst",
                    "link": "https://example.com/cpi-inflation-growth-stocks",
                    "published": one_day_ago
                },
                {
                    "title": "Tech Sector Allocations Hit Record Levels Amid Robust AI Infrastructure Spend and Cloud Scaling",
                    "publisher": "Strategic Allocator",
                    "link": "https://example.com/ai-spend-cloud-scaling",
                    "published": two_days_ago
                }
            ]
        else:
            return [
                {
                    "title": f"Earnings Report: {ticker} Beats Q1 Revenue Consensus by 4.2%, Citing Strong Product Demand",
                    "publisher": "Corporate Financial News",
                    "link": f"https://example.com/earnings-{ticker.lower()}",
                    "published": now_str
                },
                {
                    "title": f"Industry Headwinds: Sector Rotation Weighs Slightly on Growth Names like {ticker}",
                    "publisher": "Market Sentinel",
                    "link": f"https://example.com/winds-{ticker.lower()}",
                    "published": one_day_ago
                }
            ]
