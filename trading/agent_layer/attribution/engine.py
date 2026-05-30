import pandas as pd
import json
import logging
from ..llm_client import call_llm

logger = logging.getLogger(__name__)

class AttributionEngine:
    """
    Synthesizes historical price movements and recent news articles
    to formulate a coherent, objective attribution analysis using stateless LLM calls.
    """

    def analyze(
        self, 
        ticker: str, 
        prices_df: pd.DataFrame, 
        news_list: list[dict],
        provider: str = None,
        api_key: str = None
    ) -> dict:
        """
        Processes price and news data, formats them into a robust prompt,
        calls the LLM statelessly, and returns a structured dictionary.
        
        Args:
            ticker: The stock ticker (e.g., 'QQQ').
            prices_df: DataFrame containing OHLCV history.
            news_list: List of formatted news articles.
            provider: 'gemini' or 'openai' override.
            api_key: Optional API key override.
            
        Returns:
            A structured dict:
            {
                "summary": str,
                "price_trend": str,
                "key_events": list[str],
                "sentiment": str,
                "raw_response": str (optional)
            }
        """
        logger.info(f"Synthesizing price & news attribution for {ticker}...")
        
        # 1. Edge Case: Empty data
        if prices_df.empty:
            return {
                "summary": "No historical price data was found to perform attribution analysis.",
                "price_trend": "Unknown",
                "key_events": [],
                "sentiment": "Neutral"
            }
            
        # 2. Extract metrics from price history
        start_date = prices_df.index[0].strftime('%Y-%m-%d')
        end_date = prices_df.index[-1].strftime('%Y-%m-%d')
        
        start_price = float(prices_df['Close'].iloc[0])
        end_price = float(prices_df['Close'].iloc[-1])
        percent_change = ((end_price - start_price) / start_price) * 100
        
        highest_price = float(prices_df['High'].max())
        lowest_price = float(prices_df['Low'].min())
        
        # Create a brief summary of daily closing prices for context
        # Sampling up to 10 historical datapoints to keep context lightweight
        sample_size = min(10, len(prices_df))
        indices = [int(i) for i in pd.Series(range(len(prices_df))).iloc[::len(prices_df)//sample_size or 1]]
        if len(prices_df) - 1 not in indices:
            indices.append(len(prices_df) - 1)
        
        price_trend_context = []
        for idx in sorted(list(set(indices))):
            date_str = prices_df.index[idx].strftime('%Y-%m-%d')
            close_val = float(prices_df['Close'].iloc[idx])
            price_trend_context.append(f"{date_str}: ${close_val:.2f}")
            
        # 3. Format News context
        news_context = []
        if news_list:
            for idx, item in enumerate(news_list[:8]):  # Limit to top 8 news items
                news_context.append(
                    f"[{idx+1}] TITLE: {item.get('title')}\n"
                    f"    PUBLISHER: {item.get('publisher')}\n"
                    f"    DATE: {item.get('published')}\n"
                    f"    LINK: {item.get('link')}"
                )
        else:
            news_context.append("No recent news articles found for this timeframe.")
            
        # 4. Formulate the prompt
        system_prompt = (
            "You are a highly analytical Senior Financial Analyst. Your job is to analyze "
            "financial data and recent news to explain why a stock or ETF moved the way it did. "
            "You must return your output ONLY in a valid JSON format. "
            "Ensure the JSON matches the schema below exactly. Do not include markdown code block formatting like ```json, "
            "just return raw valid JSON. "
            "\n"
            "JSON SCHEMA:\n"
            "{\n"
            "  \"summary\": \"An objective, professional, and detailed narrative (2-3 paragraphs) explaining the price movements, attributing the changes to specific macro factors, central bank policies, interest rate updates, or corporate earnings listed in the news.\",\n"
            "  \"price_trend\": \"Bullish / Bearish / Volatile / Sideways\",\n"
            "  \"key_events\": [\n"
            "    \"Event 1: Short summary of first critical news driver/catalyst and its impact on price\",\n"
            "    \"Event 2: Short summary of second critical news driver/catalyst and its impact on price\"\n"
            "  ],\n"
            "  \"sentiment\": \"Bullish / Bearish / Neutral / Mixed\"\n"
            "}"
        )
        
        user_message = f"""
Attribution Data for Ticker: {ticker}
Timeframe: {start_date} to {end_date}

=== HISTORICAL PRICES SUMMARY ===
Start Price ({start_date}): ${start_price:.2f}
End Price ({end_date}): ${end_price:.2f}
Total Price Change: {percent_change:+.2f}%
Highest Price over period: ${highest_price:.2f}
Lowest Price over period: ${lowest_price:.2f}

Price Trend Samples:
{chr(10).join(price_trend_context)}

=== RECENT NEWS HEADLINES ===
{chr(10).join(news_context)}

Please analyze this data and generate the structured JSON output.
"""
        
        # 5. Call LLM statelessly
        raw_output = call_llm(
            system_prompt=system_prompt,
            user_message=user_message,
            provider=provider,
            api_key=api_key
        )
        
        # 6. Parse JSON safely
        # Strips out potential markdown code blocks if the LLM ignored instruction
        clean_json_str = raw_output.strip()
        if clean_json_str.startswith("```"):
            # strip markdown lines
            lines = clean_json_str.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_json_str = "\n".join(lines).strip()
            
        try:
            parsed_data = json.loads(clean_json_str)
            # Validate essential fields are present
            required_fields = ["summary", "price_trend", "key_events", "sentiment"]
            for field in required_fields:
                if field not in parsed_data:
                    parsed_data[field] = "N/A" if field != "key_events" else []
            return parsed_data
        except Exception as parse_err:
            logger.error(f"Error parsing LLM response as JSON: {parse_err}. Raw output was:\n{raw_output}")
            
            # Formulate a structured fallback dict if JSON decoding fails completely
            return {
                "summary": f"Could not parse analysis output. Here is the raw text instead:\n\n{raw_output}",
                "price_trend": "Volatile" if percent_change > 2 or percent_change < -2 else "Sideways",
                "key_events": ["Error: The LLM returned non-JSON structured data."],
                "sentiment": "Mixed"
            }
