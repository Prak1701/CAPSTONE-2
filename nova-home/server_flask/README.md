Flask backend for Blockchain-Based Academic Credential Verification (JSON fallback + optional MongoDB)

Setup (local JSON fallback)

1. Create a virtual environment and install dependencies:

   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

2. Set environment variable JWT_SECRET (defaults to 'changeme' if not set):

   export JWT_SECRET=changeme

3. Optional: connect to MongoDB by setting MONGO_URI (example placeholder):

   export MONGO_URI="mongodb://username:password@host:port/dbname"

4. Optional: set UNIVERSITY_EMAIL_DOMAINS (comma separated) to allow auto-verification for university signups from trusted domains.

   export UNIVERSITY_EMAIL_DOMAINS="university.in,college.edu"

   If MONGO_URI is set and pymongo can connect, the app will use MongoDB instead of local JSON files.

5. Run the server:

   python app.py

Endpoints
- POST /auth/register {username,email,password,role}
  - Universities are auto-verified if their email domain matches UNIVERSITY_EMAIL_DOMAINS; otherwise admin approval is required.
- POST /auth/login {email,password}
- POST /university/upload (multipart file, header Authorization: Bearer <token>) - only verified university accounts can upload
- POST /blockchain/add {student_id} (protected)
- POST /blockchain/verify {student_id}
- POST /generate_qr {student_id}
- GET /employer/search?q=search-term
- GET /university/records (protected)
- GET /admin/pending-users (admin only)
- POST /admin/approve {user_id} (admin only)

Notes
- This project supports two storage modes:
  1) MongoDB (when MONGO_URI is provided and reachable)
  2) Local JSON files under server_flask/data/ (default)
- Universities are protected: they must be verified before using university endpoints. Use trusted email domains or admin approval.
- Blockchain is mocked using SHA256 hashes stored in the proofs collection/file. Replace with actual chain integration where needed.
