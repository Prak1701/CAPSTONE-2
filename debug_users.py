import os
from pymongo import MongoClient
from werkzeug.security import check_password_hash

# Connect to Docker MongoDB (exposed on 27018)
client = MongoClient("mongodb://localhost:27018/")

dbs = client.list_database_names()
print("Databases:", dbs)

collections_to_check = ["universities", "student_accounts", "employers", "users", "student_records", "proofs"]

found_any = False

for db_name in ["CAPSTONE-2"]:
    print(f"\n--- Checking Database: {db_name} ---")
    db = client[db_name]
    existing_cols = db.list_collection_names()
    print(f"Collections: {existing_cols}")
    
    for col_name in existing_cols:
        print(f"  Checking collection: {col_name}")
        users = list(db[col_name].find())
        for user in users:
            found_any = True
            print(f"    Found document: {user}")

if not found_any:
    print("\n[WARNING] No relevant data found in ANY database!")
