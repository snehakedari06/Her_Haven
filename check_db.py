import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGO_ENDPOINT"))
db = client["SheBuilds"]
collection = db["doc_embedding"]

count = collection.count_documents({})
print(f"Total embedded documents: {count}")
