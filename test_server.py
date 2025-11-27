"""Simple test to verify server is accessible"""
import socket

def get_local_ip():
    """Get the local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        
        # Filter virtual adapters
        if local_ip.startswith("192.168.56.") or local_ip.startswith("169.254."):
            hostname = socket.gethostname()
            all_ips = socket.gethostbyname_ex(hostname)[2]
            for ip in all_ips:
                if not ip.startswith("127.") and not ip.startswith("169.254.") and not ip.startswith("192.168.56."):
                    return ip
        return local_ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    ip = get_local_ip()
    print(f"\n{'='*60}")
    print(f"Your laptop's IP address: {ip}")
    print(f"{'='*60}\n")
    print("To test if the server is accessible:")
    print(f"1. Make sure your Flask server is running")
    print(f"2. On your phone's browser, go to: http://{ip}:5000/")
    print(f"3. You should see the Flask app\n")
    print("If it doesn't work, the issue is likely:")
    print("- Windows Firewall blocking port 5000")
    print("- Your phone and laptop are on different WiFi networks")
    print("- The Flask server isn't running with host='0.0.0.0'")
    print(f"\n{'='*60}\n")
