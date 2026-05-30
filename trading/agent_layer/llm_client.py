import logging
import requests
import json
import config

logger = logging.getLogger(__name__)

def call_llm(
    system_prompt: str, 
    user_message: str, 
    provider: str = None, 
    model: str = None, 
    api_key: str = None
) -> str:
    """
    Thin, completely stateless wrapper around Gemini and OpenAI APIs.
    No LangChain, CrewAI, AutoGen, or heavy stateful agent frameworks.
    
    Args:
        system_prompt: Guidelines instructing the LLM persona/role.
        user_message: Input text/context.
        provider: 'gemini' or 'openai'. If None, uses config.DEFAULT_LLM_PROVIDER.
        model: Model name. If None, uses provider-specific defaults from config.
        api_key: Optional API key override (useful for UI injected keys).
        
    Returns:
        Raw text response from the LLM, or a clean error message.
    """
    # 1. Resolve Provider
    prov = (provider or config.DEFAULT_LLM_PROVIDER).lower()
    
    # 2. Resolve API Key
    key = api_key
    if not key:
        if prov == "gemini":
            key = config.GEMINI_API_KEY
        elif prov == "openai":
            key = config.OPENAI_API_KEY
            
    if not key:
        logger.warning(f"No API key provided for {prov}")
        return f"[Error: API Key for '{prov.upper()}' is not set. Please supply a key in the settings or .env file.]"
        
    # 3. Call corresponding provider
    if prov == "gemini":
        model_name = model or config.GEMINI_DEFAULT_MODEL
        logger.info(f"Calling Gemini API (model: {model_name}) statelessly...")
        return _call_gemini(system_prompt, user_message, model_name, key)
    elif prov == "openai":
        model_name = model or config.OPENAI_DEFAULT_MODEL
        logger.info(f"Calling OpenAI API (model: {model_name}) statelessly...")
        return _call_openai(system_prompt, user_message, model_name, key)
    else:
        return f"[Error: Supported providers are 'gemini' or 'openai'. Got: '{prov}']"


def _call_gemini(system_prompt: str, user_message: str, model_name: str, api_key: str) -> str:
    """
    Stateless call to Gemini using the google-generativeai SDK,
    or fallback to direct REST API call.
    """
    try:
        import google.generativeai as genai
        # Configure statelessly for this call
        genai.configure(api_key=api_key)
        
        # We specify system_instruction in the GenerativeModel constructor
        # Note: 'system_instruction' parameter is supported in newer google-generativeai versions.
        # If it fails, we fall back to pre-pending the system prompt to the user message.
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_prompt
            )
            response = model.generate_content(user_message)
            return response.text
        except Exception as sdk_err:
            logger.warning(f"Gemini SDK system_instruction failed, falling back: {sdk_err}")
            # Fallback configuration (pre-pending instructions to the chat prompt)
            model = genai.GenerativeModel(model_name=model_name)
            combined_message = f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER MESSAGE:\n{user_message}"
            response = model.generate_content(combined_message)
            return response.text
            
    except Exception as e:
        logger.warning(f"Gemini SDK failed or not available, falling back to raw HTTP: {e}")
        # Raw HTTP Fallback using official v1beta API endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": f"System Guidelines: {system_prompt}\n\nUser Input: {user_message}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.95
            }
        }
        
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                res_data = res.json()
                text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                return f"[Gemini HTTP Error {res.status_code}]: {res.text}"
        except Exception as http_err:
            return f"[Gemini Connection Failure]: {str(http_err)}"


def _call_openai(system_prompt: str, user_message: str, model_name: str, api_key: str) -> str:
    """
    Stateless call to OpenAI using direct REST API requests to keep the footprint small
    and avoid heavy runtime package bindings.
    """
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.2
    }
    
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        if res.status_code == 200:
            res_data = res.json()
            return res_data["choices"][0]["message"]["content"]
        else:
            return f"[OpenAI HTTP Error {res.status_code}]: {res.text}"
    except Exception as http_err:
        return f"[OpenAI Connection Failure]: {str(http_err)}"
