"""Unified LLM client with cascading fallback: Gemini → Groq.
Usage:
    from llm_client import generate_text
    answer = generate_text("Extract the title from this text:\n\n...")
"""
import os, time, json
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

def _try_gemini(prompt: str) -> str:
    """Try Google Gemini first."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("No GEMINI_API_KEY")
    
    from google import genai
    model = os.getenv("CHAT_MODEL", "gemini-2.5-flash")
    gem = genai.Client(api_key=api_key)
    response = gem.models.generate_content(model=model, contents=[prompt])
    return response.text.strip()

def _try_groq(prompt: str) -> str:
    """Fallback to Groq (OpenAI-compatible API)."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("No GROQ_API_KEY")
    
    import urllib.request
    
    body = json.dumps({
        "model": "openai/gpt-oss-120b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 512,
    }).encode("utf-8")
    
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
    )
    
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"].strip()


# Ordered list of providers to try
_PROVIDERS = [
    ("Gemini", _try_gemini),
    ("Groq",   _try_groq),
]

def generate_text(prompt: str, verbose: bool = True) -> str:
    """Generate text using cascading fallback: Gemini → Groq.
    
    Automatically retries with the next provider on rate-limit or failure.
    """
    errors = []
    for name, fn in _PROVIDERS:
        try:
            if verbose:
                print(f"[LLM] Trying {name}...")
            result = fn(prompt)
            if verbose:
                print(f"[LLM] OK {name} succeeded.")
            return result
        except Exception as e:
            err_str = str(e)
            errors.append((name, err_str))
            if verbose:
                print(f"[LLM] FAIL {name} failed: {err_str[:120]}")
            # Small delay before next provider
            time.sleep(1)
    
    # All providers failed
    raise RuntimeError(
        f"All LLM providers failed:\n" +
        "\n".join(f"  - {name}: {err}" for name, err in errors)
    )
