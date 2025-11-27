import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "server_flask", ".env"))

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/cp")
print(f"Connecting to {MONGO_URI}")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    db = client.get_database()
    
    print("\n=== ACCOUNTS (db.student_accounts) ===")
    accounts = list(db.student_accounts.find({}, {"_id": 0, "id": 1, "email": 1}))
    for a in accounts:
        print(f"ID: {a.get('id')}, Email: {a.get('email')}")
        
    print("\n=== RECORDS (db.student_records) ===")
    records = list(db.student_records.find({}, {"_id": 0, "id": 1, "data": 1}))
    for r in records:
        data = r.get('data', {})
        # Try to find email in data
        email = None
        for k, v in data.items():
            if "email" in k.lower():
                email = v
                break
        print(f"ID: {r.get('id')}, Email: {email}, Data keys: {list(data.keys())}")

    print("\n=== CERTIFICATES (JSON) ===")
    cert_path = os.path.join("server_flask", "data", "certificates.json")
    if os.path.exists(cert_path):
        with open(cert_path, "r") as f:
            certs = json.load(f)
            for c in certs:
                print(f"CertID: {c.get('cert_id')}, StudentID: {c.get('student_id')}")
    else:
        print("certificates.json not found")

except Exception as e:
    print("Error:", e)
