import pytest
import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app as flask_app

@pytest.fixture
def app():
    """Create and configure a test Flask application instance."""
    flask_app.config.update({
        "TESTING": True,
        "MONGO_URI": "",  # Use JSON files for testing
    })
    yield flask_app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test CLI runner for the app."""
    return app.test_cli_runner()

@pytest.fixture
def auth_headers():
    """Generate authentication headers for testing."""
    # You'll need to generate a valid token here
    # For now, returning empty dict
    return {}

@pytest.fixture
def sample_student_data():
    """Sample student data for testing."""
    return {
        "name": "Test Student",
        "email": "test.student@example.com",
        "roll_number": "TEST001",
        "degree": "B.Tech Computer Science"
    }

@pytest.fixture
def sample_university_user():
    """Sample university user for testing."""
    return {
        "username": "Test University",
        "email": "test.university@st.niituniversity.in",
        "password": "testpass123",
        "role": "university"
    }

@pytest.fixture
def sample_student_user():
    """Sample student user for testing."""
    return {
        "username": "Test Student User",
        "email": "test.student@example.com",
        "password": "testpass123",
        "role": "student"
    }
