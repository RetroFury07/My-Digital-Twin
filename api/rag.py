"""
Advanced RAG with query preprocessing and response post-processing.
Features:
- Query enhancement with synonyms and context
- Interview-focused response formatting
- STAR format when appropriate
"""

from http.server import BaseHTTPRequestHandler
import os
import json
from groq import Groq

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Enhanced profile context with achievements and metrics
PROFILE_CONTEXT = """
You are a digital twin AI assistant representing a professional software developer.

Professional Background:
- Full-stack developer with 5+ years of experience
- Expertise in Python, JavaScript/TypeScript, and modern web frameworks
- Successfully built and deployed 15+ production applications
- Led teams of 3-5 developers on multiple projects

Technical Skills & Achievements:
- Languages: Python, JavaScript, TypeScript, Java
- Frameworks: FastAPI (built 10+ APIs), Next.js (5+ production apps), React (50+ components)
- AI/ML: Implemented RAG systems serving 1000+ daily queries, integrated OpenAI/Groq APIs
- Databases: Designed schemas for PostgreSQL (3+ projects), MongoDB (2 projects), Redis caching
- DevOps: Set up CI/CD pipelines reducing deployment time by 60%, Docker containerization
- Vector Databases: Implemented Upstash and Pinecone for semantic search (3 projects)

Notable Projects:
1. AI-Powered Digital Twin Platform - Built RAG system with 95% accuracy
2. Real-time Analytics Dashboard - Handled 10K+ concurrent users
3. MCP Server Integration - Reduced API latency by 40%

Soft Skills:
- Strong problem-solving and debugging capabilities
- Excellent communication and team collaboration
- Agile/Scrum methodology experience
- Code review and mentoring junior developers
"""


def enhance_query(user_question: str) -> str:
    """Preprocess query to improve retrieval quality."""
    if not groq_client:
        return user_question
    
    enhanced_prompt = f"""You are a query optimization assistant for a professional profile system.

Improve this question to better search professional profile data:

Original Question: {user_question}

Enhanced query should:
- Include relevant synonyms (e.g., "built" → "developed, created, implemented")
- Add professional context (e.g., "Python" → "Python development, Python frameworks")
- Focus on interview-relevant aspects
- Expand acronyms if present

Return ONLY the enhanced query, no explanations:"""
    
    try:
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": enhanced_prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=150,
        )
        return response.choices[0].message.content.strip()
    except:
        return user_question


def format_for_interview(answer: str, original_question: str) -> str:
    """Post-process response for interview scenarios."""
    if not groq_client:
        return answer
    
    interview_prompt = f"""You are an expert interview coach. Refine this response for an interview setting.

Original Question: {original_question}
Current Response: {answer}

Improve the response to:
- Use STAR format (Situation, Task, Action, Result) if describing past work
- Include specific metrics and achievements when mentioned
- Sound confident, natural, and conversational
- Be concise but complete (2-4 sentences for simple questions, more for complex)
- Speak in first person
- Directly address the question

Return ONLY the improved response:"""
    
    try:
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": interview_prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=600,
        )
        return response.choices[0].message.content.strip()
    except:
        return answer


def generate_answer(question: str) -> str:
    """Generate answer using Advanced RAG with preprocessing and post-processing"""
    if not groq_client:
        return "Sorry, the AI service is not configured properly. Please add GROQ_API_KEY environment variable."
    
    try:
        # Step 1: Query preprocessing
        enhanced_query = enhance_query(question)
        
        # Step 2: Generate initial response
        prompt = f"""{PROFILE_CONTEXT}

Question: {enhanced_query}

Provide a helpful, professional response in first person, including specific examples and metrics when relevant:"""
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an AI digital twin representing a professional software developer. Answer in first person with specific examples and achievements."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=700,
        )
        
        initial_answer = completion.choices[0].message.content.strip()
        
        # Step 3: Response post-processing
        final_answer = format_for_interview(initial_answer, question)
        
        return final_answer
        
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
            
            # Accept both 'question' and 'query' fields for compatibility
            question = data.get("question") or data.get("query", "")
            if question:
                question = question.strip()
            
            if not question:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Question is required and must be a non-empty string"}).encode())
                return
            
            # Generate answer with advanced RAG
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
            "service": "Digital Twin Advanced RAG API",
            "features": ["query_enhancement", "interview_formatting", "star_format"],
            "groq_configured": groq_client is not None
        }).encode())

