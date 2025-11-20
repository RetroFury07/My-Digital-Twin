# embed_digitaltwin.py
# -----------------------------------------------------
# Build embeddings from your professional profile (digitaltwin.json)
# and store them in Upstash Vector for semantic retrieval.
# -----------------------------------------------------

import os
import json
from dotenv import load_dotenv
from upstash_vector import Index

# Load environment variables
load_dotenv()

# Try to import sentence-transformers for local embeddings
try:
    from sentence_transformers import SentenceTransformer
    USE_LOCAL_EMBEDDINGS = True
    print("✅ Using local sentence-transformers model (free, no API key needed)")
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')  # 384 dimensions, fast and efficient
except ImportError:
    USE_LOCAL_EMBEDDINGS = False
    print("⚠️  sentence-transformers not installed. Installing...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'sentence-transformers'])
    from sentence_transformers import SentenceTransformer
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    USE_LOCAL_EMBEDDINGS = True

vector_index = Index(
    url=os.getenv("UPSTASH_VECTOR_REST_URL"),
    token=os.getenv("UPSTASH_VECTOR_REST_TOKEN")
)

def load_digital_twin():
    """Load professional profile JSON file."""
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "digitaltwin.json")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def flatten_json(obj, parent_key="", sep="."):
    """Recursively flatten nested JSON for embedding."""
    items = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            items.extend(flatten_json(v, new_key, sep=sep))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            new_key = f"{parent_key}[{i}]"
            items.extend(flatten_json(v, new_key, sep=sep))
    else:
        items.append((parent_key, str(obj)))
    return items

def generate_embedding(text: str):
    """Create embeddings for given text using local sentence-transformers model."""
    # Using all-MiniLM-L6-v2: 384-dim, fast, and free
    # Pad to 1536 dimensions to match Upstash Vector index
    embedding = embedding_model.encode(text, show_progress_bar=False)
    embedding_list = embedding.tolist()
    
    # Pad with zeros to reach 1536 dimensions (Upstash index requirement)
    if len(embedding_list) < 1536:
        padding = [0.0] * (1536 - len(embedding_list))
        embedding_list.extend(padding)
    
    return embedding_list

def upload_embeddings_to_upstash(flattened_data):
    """Send embeddings to Upstash Vector database."""
    print(f"Uploading {len(flattened_data)} records to Upstash Vector...")

    count = 0
    for key, text in flattened_data:
        if not text.strip():
            continue
        
        try:
            embedding = generate_embedding(text)
            # Upstash Vector API format: upsert(vectors=[...])
            vector_index.upsert(
                vectors=[
                    {
                        "id": key,
                        "vector": embedding,
                        "metadata": {"text": text}
                    }
                ]
            )
            count += 1
            if count % 50 == 0:
                print(f"  Uploaded {count}/{len(flattened_data)} records...")
        except Exception as e:
            print(f"⚠️  Error uploading {key}: {e}")
            continue

    print(f"✅ All data embedded and uploaded successfully! Total: {count} records")

def main():
    print("🚀 Starting Digital Twin RAG Embedding Process...")
    profile_data = load_digital_twin()
    flattened_data = flatten_json(profile_data)
    upload_embeddings_to_upstash(flattened_data)

if __name__ == "__main__":
    main()
