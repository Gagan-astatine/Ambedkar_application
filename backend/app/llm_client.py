"""Unified LLM client with cascading fallback: Gemini → Groq.
Used by the FastAPI backend for chat/generation calls.
Embeddings stay on Gemini only (for consistency).
"""
import os, json, time
import urllib.request


def _try_gemini(prompt: str) -> str:
    """Try Google Gemini first."""
    from google import genai
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("No GEMINI_API_KEY")
    model = os.getenv("CHAT_MODEL", "gemini-2.5-flash")
    gem = genai.Client(api_key=api_key)
    response = gem.models.generate_content(model=model, contents=[prompt])
    return response.text.strip()


def _try_groq(prompt: str) -> str:
    """Fallback to Groq."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("No GROQ_API_KEY")
    
    body = json.dumps({
        "model": "openai/gpt-oss-120b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 2048,
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


_PROVIDERS = [
    ("Gemini", _try_gemini),
    ("Groq",   _try_groq),
]


def generate_text(prompt: str) -> str:
    """Generate text using cascading fallback: Gemini → Groq."""
    errors_list = []
    for name, fn in _PROVIDERS:
        try:
            print(f"[LLM] Trying {name}...")
            result = fn(prompt)
            print(f"[LLM] OK {name} succeeded.")
            return result
        except Exception as e:
            err_str = str(e)
            errors_list.append((name, err_str))
            print(f"[LLM] FAIL {name} failed: {err_str[:120]}")
            time.sleep(1)
    
    raise RuntimeError(
        f"All LLM providers failed:\n" +
        "\n".join(f"  - {name}: {err}" for name, err in errors_list)
    )
