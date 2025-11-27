"""
Certificate generation and operations tests
"""
import json
import os

def test_get_local_ip():
    """Test IP detection function"""
    from app import get_local_ip
    ip = get_local_ip()
    assert ip is not None
    assert ip != ""

def test_certificate_generation(client, sample_student_data):
    """Test certificate HTML generation"""
    from app import generate_certificate_html
    
    student = {
        "id": 1,
        "data": sample_student_data
    }
    cert_id = 1
    
    filename = generate_certificate_html(student, cert_id)
    
    assert filename is not None
    assert filename == f"cert_{cert_id}.html"

def test_qr_code_generation(client):
    """Test QR code base64 generation"""
    from app import create_qr_base64
    
    test_data = "http://example.com/verify?token=test123"
    qr_base64 = create_qr_base64(test_data)
    
    assert qr_base64 is not None
    assert qr_base64.startswith("data:image/png;base64,")

def test_token_generation():
    """Test JWT token generation"""
    from app import make_token, verify_token
    
    payload = {"user_id": 1, "role": "student"}
    token = make_token(payload)
    
    assert token is not None
    decoded = verify_token(token)
    assert decoded["user_id"] == 1
