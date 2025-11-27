import os
import sys

# Add backend_main to path
sys.path.append(os.path.abspath("backend_main"))

from app import get_local_ip

def test_ip():
    print("Testing IP detection...")
    ip = get_local_ip()
    print(f"Detected IP: {ip}")
    
    with open("ip_debug.txt", "w") as f:
        f.write(f"Detected IP: {ip}\n")
    
    if ip == "127.0.0.1":
        print("WARNING: Detected localhost. Are you connected to a network?")
    else:
        print("Success: Detected a non-localhost IP.")

if __name__ == "__main__":
    test_ip()
