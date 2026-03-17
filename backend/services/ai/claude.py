import os
import anthropic
from .provider import AIProvider

class ClaudeProvider(AIProvider):
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    def complete(self, prompt: str, system: str = "") -> str:
        kwargs = {
            "model": "claude-3-5-sonnet-20240620", # Updated from prompt's old version to a standard valid one
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}]
        }
        if system:
            kwargs["system"] = system
        response = self.client.messages.create(**kwargs)
        return response.content[0].text
