import os
import pickle
import logging  
from bson import Binary
from dotenv import load_dotenv
from pymongo import MongoClient
# Load environment variables
from pymongo.operations import SearchIndexModel
# from sentence_transformers import SentenceTransformer

from backend.utils.embedding import generate_text_embedding
from backend.logger import CustomFormatter

load_dotenv()
print("MONGO_ENDPOINT:", os.getenv("MONGO_ENDPOINT"))

# Initialize db_client as None globally to cache the connection
db_client = None

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(CustomFormatter())
logger.addHandler(handler)

def get_database():
    """
    Connect to the MongoDB database. Caches the connection so that it is reused
    across multiple calls, improving performance by avoiding repeated handshakes.
    """
    global db_client
    if db_client is None:
        try:
            import certifi
            db_client = MongoClient(
                os.getenv("MONGO_ENDPOINT"),
                tlsCAFile=certifi.where()
            )
            logger.info("Connected to the database (with certifi)")    
        except Exception as e:
            print("Error connecting to the database:", e)
            return None
    return db_client["SheBuilds"]


def insert_data_into_db(
    name, location, contact_info, severity, culprit, relationship_to_culprit, other_info
):
    """
    Inserts a document into the 'posts' collection of the MongoDB database.
    Reuses the cached database connection.
    """
    db = get_database()
    if db is None:
        print("Database connection is not available.")
        return None

    collection = db["complains2"]
    document = {
        "name": name,
        "location": location,
        "contact_info": contact_info,
        "severity": severity,
        "culprit": culprit,
        "relationship_to_culprit": relationship_to_culprit,
        "other_info": other_info,
        "status": "Pending",
    }
    culprit_embedding = generate_text_embedding(culprit)
    document["culprit_embedding"] = culprit_embedding
    try:
        # Insert the document into the collection
        result = collection.insert_one(document)
        print(f"Inserted document with ID: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print("Error inserting data:", e)
        return None


# culprit='a black eyed women who is bald'
# insert_data_into_db('name', 'location', '', '', culprit, 'husband', '')
# # insert sample data into the database with some random location as {lat, lng}
# insert_data_into_db("Alice", {"lat": 37.7749, "lng": -122.4194}, "High", "Broken window", "Needs urgent repair")
# insert_data_into_db("Bob", {"lat": 37.7749, "lng": -122.4194}, "Low", "Leaky faucet", "Minor issue")
# insert_data_into_db("Charlie", {"lat": 37.7749, "lng": -122.4194}, "Medium", "Faulty wiring", "Needs inspection")


import time

# Function to upload embeddings to MongoDB
def upload_embeddings_to_mongo(file_contents):
    db = get_database()
    collection = db["doc_embedding"]
    for filename, content in file_contents:
        # Split content into smaller chunks (e.g., 2000 chars) to avoid token limits
        chunks = [content[i:i+2000] for i in range(0, len(content), 2000)]
        
        for i, chunk in enumerate(chunks):
            # Generate embeddings for the chunk
            embedding = generate_text_embedding(chunk)

            doc = {
                "filename": f"{filename}_part_{i}",
                "original_filename": filename,
                "embedding": Binary(pickle.dumps(embedding)),
                "content": chunk[:500],
            }

            collection.insert_one(doc)
            print(f"Uploaded {filename} part {i} to MongoDB.")
            
            # Wait 4 seconds to avoid 429 rate limit (max 15 RPM)
            time.sleep(4)
