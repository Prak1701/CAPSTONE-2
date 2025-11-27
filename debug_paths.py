import os
import sys

# Simulate the environment
BASE_DIR = os.path.abspath(os.path.join("server_flask"))
DATA_DIR = os.path.join(BASE_DIR, "data")
CERTS_DIR = os.path.join(DATA_DIR, "certs")

print(f"CWD: {os.getcwd()}")
print(f"BASE_DIR: {BASE_DIR}")
print(f"DATA_DIR: {DATA_DIR}")
print(f"CERTS_DIR: {CERTS_DIR}")

# Simulate the file path from certificates.json
stored_file_path = "certs/cert_11.pdf"
print(f"\nStored path: {stored_file_path}")

# Logic from app.py
file_path = stored_file_path.replace("\\", "/")
if os.path.isabs(file_path):
    path = file_path
else:
    path = os.path.join(DATA_DIR, file_path)

path = os.path.abspath(path)
print(f"Constructed path: {path}")
print(f"Exists? {os.path.exists(path)}")

# Alternative logic
filename = os.path.basename(file_path)
alt_path = os.path.join(CERTS_DIR, filename)
print(f"Alt path: {alt_path}")
print(f"Exists? {os.path.exists(alt_path)}")

# Check actual file in directory
if os.path.exists(CERTS_DIR):
    print(f"\nListing {CERTS_DIR}:")
    try:
        files = os.listdir(CERTS_DIR)
        if "cert_11.pdf" in files:
            print("cert_11.pdf FOUND in listing")
        else:
            print("cert_11.pdf NOT FOUND in listing")
            print(f"First 5 files: {files[:5]}")
    except Exception as e:
        print(f"Error listing dir: {e}")
else:
    print(f"CERTS_DIR does not exist")
