import logging
import config
from ..llm_client import call_llm

logger = logging.getLogger(__name__)

class MasterCritiqueEngine:
    """
    Executes a 'roundtable' of legendary investors evaluating the QQQ price action
    and market news. Utilizes stateless, skill-based prompts with zero framework bloat.
    """

    def run_critique(
        self, 
        ticker: str, 
        attribution_summary: str,
        price_trend: str,
        sentiment: str,
        provider: str = None,
        api_key: str = None
    ) -> dict[str, str]:
        """
        Runs the critique loop over each defined master investor persona.
        
        Args:
            ticker: Stock ticker analyzed.
            attribution_summary: The generated attribution narrative from Module C.
            price_trend: General trend of the asset.
            sentiment: Measured market sentiment.
            provider: 'gemini' or 'openai' override.
            api_key: Optional API key override.
            
        Returns:
            A dictionary mapping Persona Name -> Critique Output Text.
        """
        logger.info(f"Initiating Master Critique roundtable for {ticker}...")
        
        # Prepare the context to present to each persona
        context_message = (
            f"Asset Analyzed: {ticker}\n"
            f"Observed Price Trend: {price_trend}\n"
            f"General Market Sentiment: {sentiment}\n\n"
            f"ATTRIBUTION NARRATIVE SUMMARY:\n{attribution_summary}\n\n"
            f"Legendary Master, please review the above market situation, price action, and news attribution. "
            f"Provide your detailed critique and strategic investment advice based ONLY on your core principles. "
            f"Be highly specific, direct, and speak strictly in your authentic voice."
        )
        
        critique_results = {}
        
        # Simple, robust skill-based prompting loop over config.MASTER_SKILLS
        for persona_name, system_prompt in config.MASTER_SKILLS.items():
            logger.info(f"Running critique for: {persona_name}")
            try:
                critique_text = call_llm(
                    system_prompt=system_prompt,
                    user_message=context_message,
                    provider=provider,
                    api_key=api_key
                )
                critique_results[persona_name] = critique_text
            except Exception as e:
                logger.error(f"Failed to generate critique for {persona_name}: {e}")
                critique_results[persona_name] = (
                    f"[System Warning: Could not complete critique for {persona_name} due to an execution error: {e}]"
                )
                
        return critique_results
