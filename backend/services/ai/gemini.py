import os
from google import genai
from .provider import AIProvider

class GeminiProvider(AIProvider):
    def __init__(self):
        # Configure the Client
        self.client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        self.model_name = "gemini-3-pro-preview"

    def complete(self, prompt: str, system: str = "") -> str:
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config={'system_instruction': system} if system else None
        )
        return response.text
