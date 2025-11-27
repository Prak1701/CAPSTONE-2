import pytest
import json

def test_employer_search_no_results(client):
    """Test employer search with a query that should return no results"""
    response = client.get('/employer/search?q=nonexistentstudent12345')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['count'] == 0
    assert len(data['results']) == 0

def test_verify_endpoint_invalid_token(client):
    """Test verify endpoint with invalid token"""
    response = client.get('/verify?token=invalid_token_string')
    # Should return 400 or 404, or HTML with error message
    # The current implementation returns 400 for invalid token
    assert response.status_code == 400
    assert b"Invalid or Expired Token" in response.data

def test_verify_endpoint_missing_token(client):
    """Test verify endpoint without token"""
    response = client.get('/verify')
    assert response.status_code == 400
    assert b"Invalid Verification Link" in response.data
