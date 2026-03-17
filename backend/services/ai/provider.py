from abc import ABC, abstractmethod

class AIProvider(ABC):
    @abstractmethod
    def complete(self, prompt: str, system: str = "") -> str:
        """Send a prompt, return response text."""
        pass

def get_provider() -> AIProvider:
    """
    Read AI_PROVIDER env var and return the correct provider.
    Valid values: "gemini" (default), "openai", "claude"
    """
    import os
    provider = os.getenv("AI_PROVIDER", "gemini").lower()
    if provider == "openai":
        from .openai import OpenAIProvider
        return OpenAIProvider()
    elif provider == "claude":
        from .claude import ClaudeProvider
        return ClaudeProvider()
    else:
        from .gemini import GeminiProvider
        return GeminiProvider()
