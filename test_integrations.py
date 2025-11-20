from dotenv import load_dotenv
from upstash_vector import Index
from groq import Groq
import os

load_dotenv()

print("✅ Environment variables loaded successfully!")

# Test Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
print("✅ Groq client initialized successfully!")

# Test Upstash
index = Index(
    url=os.getenv("UPSTASH_VECTOR_REST_URL"),
    token=os.getenv("UPSTASH_VECTOR_REST_TOKEN")
)
print("✅ Upstash index initialized successfully!")
