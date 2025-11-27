import os
import sys
import json
import datetime

# Add backend_main to path
sys.path.append(os.path.abspath("backend_main"))

from app import generate_certificate_html, CERTS_DIR

def test_generate_cert():
    print("Testing certificate generation...")
    
    student = {
        "id": 123,
        "data": {
            "Name": "Test Student",
            "Course": "Computer Science",
            "Grade": "A"
        }
    }
    cert_id = 999
    
    try:
        filename = generate_certificate_html(student, cert_id)
        print(f"Success! Certificate generated: {filename}")
        
        filepath = os.path.join(CERTS_DIR, filename)
        if os.path.exists(filepath):
            print(f"File exists at: {filepath}")
            with open(filepath, "r") as f:
                content = f.read()
                if "Test Student" in content:
                    print("Content verification passed.")
                else:
                    print("Content verification FAILED: Name not found.")
        else:
            print("File NOT found.")
            
    except Exception as e:
        print(f"FAILED with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_generate_cert()
