import os
from pymongo import MongoClient
from dotenv import load_dotenv

import certifi
load_dotenv()
client = MongoClient(os.getenv("MONGO_ENDPOINT"), tlsCAFile=certifi.where())
db = client["SheBuilds"]
collections = db.list_collection_names()
print(f"Collections: {collections}")

for coll_name in collections:
    count = db[coll_name].count_documents({})
    print(f"Collection '{coll_name}' count: {count}")
    if count > 0:
        sample = db[coll_name].find_one()
        print(f"Sample from '{coll_name}': {sample.keys()}")
