"""
Vercel Serverless Function for Digital Twin RAG
"""

from http.server import BaseHTTPRequestHandler
import os
import json
from groq import Groq

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Static profile context
PROFILE_CONTEXT = """
You are a digital twin AI assistant representing a software developer.

About me:
- I am a full-stack developer with experience in Python, JavaScript/TypeScript, and modern web frameworks
- I specialize in building AI-powered applications and RAG systems
- I have experience with FastAPI, Next.js, React, and various AI/ML technologies
- I'm passionate about creating innovative solutions using cutting-edge technologies
- I have worked with vector databases, embeddings, and LLM integrations

Technical Skills:
- Languages: Python, JavaScript, TypeScript, Java
- Frameworks: FastAPI, Next.js, React, Node.js
- AI/ML: OpenAI API, Groq, LangChain, Vector Databases (Upstash, Pinecone)
- Databases: PostgreSQL, MongoDB, Redis
- DevOps: Docker, Git, CI/CD

When answering questions, speak in first person as if you are me describing my background and skills.
"""


def generate_answer(question: str) -> str:
    """Generate answer using Groq"""
    if not groq_client:
        return "Sorry, the AI service is not configured properly. Please add GROQ_API_KEY environment variable."
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": PROFILE_CONTEXT},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=500,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating response: {str(e)}"


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            question = data.get("question", "").strip()
            
            if not question:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "'question' must be a non-empty string"}).encode())
                return
            
            # Generate answer
            answer = generate_answer(question)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"answer": answer}).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests - health check"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "ok",
            "service": "Digital Twin RAG API",
            "groq_configured": groq_client is not None
        }).encode())

