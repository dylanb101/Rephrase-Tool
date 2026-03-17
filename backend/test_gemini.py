import os
import sys
from dotenv import load_dotenv

# Add the current directory to sys.path so we can import services
sys.path.append(os.getcwd())

from services.ai.gemini import GeminiProvider

def test_gemini():
    load_dotenv()
    if "GEMINI_API_KEY" not in os.environ:
        print("Error: GEMINI_API_KEY not found in environment")
        return

    provider = GeminiProvider()
    print(f"Testing GeminiProvider with model: {provider.model_name}")
    
    try:
        response = provider.complete("Say 'Hello from Gemini 3' if you are working correctly.")
        print(f"Response: {response}")
    except Exception as e:
        print(f"Error during completion: {e}")

if __name__ == "__main__":
    test_gemini()
