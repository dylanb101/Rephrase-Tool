import os
from openai import OpenAI
from .provider import AIProvider

class OpenAIProvider(AIProvider):
    def __init__(self):
        self.client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    def complete(self, prompt: str, system: str = "") -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        return response.choices[0].message.content
