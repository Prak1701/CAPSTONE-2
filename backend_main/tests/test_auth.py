"""
Authentication endpoint tests
"""
import json

def test_register_university(client, sample_university_user):
    """Test university user registration"""
    import time
    sample_university_user["email"] = f"uni_{int(time.time())}@st.niituniversity.in"
    response = client.post('/auth/register',
                          data=json.dumps(sample_university_user),
                          content_type='application/json')
    if response.status_code != 200:
        print(f"DEBUG: Registration failed: {response.data}")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'token' in data

def test_register_student(client, sample_student_user):
    """Test student user registration"""
    import time
    sample_student_user["email"] = f"student_{int(time.time())}@test.com"
    response = client.post('/auth/register',
                          data=json.dumps(sample_student_user),
                          content_type='application/json')
    if response.status_code != 200:
        print(f"DEBUG: Registration failed: {response.data}")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'token' in data

def test_register_invalid_email(client):
    """Test registration with invalid email"""
    invalid_user = {
        "email": "invalid-email",
        "password": "testpass123",
        "role": "student"
    }
    response = client.post('/auth/register',
                          data=json.dumps(invalid_user),
                          content_type='application/json')
    assert response.status_code == 400

def test_login_success(client, sample_student_user):
    """Test successful login"""
    import time
    sample_student_user["email"] = f"login_{int(time.time())}@test.com"
    # First register
    client.post('/auth/register',
               data=json.dumps(sample_student_user),
               content_type='application/json')
    
    # Then login
    login_data = {
        "email": sample_student_user["email"],
        "password": sample_student_user["password"]
    }
    response = client.post('/auth/login',
                          data=json.dumps(login_data),
                          content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'token' in data

def test_login_wrong_password(client, sample_student_user):
    """Test login with wrong password"""
    # First register
    client.post('/auth/register',
               data=json.dumps(sample_student_user),
               content_type='application/json')
    
    # Try login with wrong password
    login_data = {
        "email": sample_student_user["email"],
        "password": "wrongpassword"
    }
    response = client.post('/auth/login',
                          data=json.dumps(login_data),
                          content_type='application/json')
    assert response.status_code == 401

def test_login_nonexistent_user(client):
    """Test login with non-existent user"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "testpass123"
    }
    response = client.post('/auth/login',
                          data=json.dumps(login_data),
                          content_type='application/json')
    assert response.status_code == 401
