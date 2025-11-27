# Blockchain-Based Academic Credential Verification

This repository contains a React frontend (client/) and a Flask backend (server_flask/) for a capstone project demonstrating blockchain-backed academic credential verification.

Quick start (frontend):

1. Install dependencies
   ```bash
   npm ci
   cd client
   npm ci
   ```

2. Set backend URL (optional)
   ```bash
   export VITE_API_URL=http://localhost:5000
   ```

3. Run dev server
   ```bash
   npm run dev
   ```

Backend (Flask):

1. Create a virtualenv and install requirements
   ```bash
   cd server_flask
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Set JWT_SECRET (defaults to 'changeme') and MONGO_URI (optional)
   ```bash
   export JWT_SECRET=changeme
   export MONGO_URI="mongodb://..."
   ```
3. Run the app
   ```bash
   python app.py
   ```

Deployment
- See docs/DEPLOYMENT.md for Netlify/Vercel and Docker/Kubernetes instructions.

Testing
- Run unit tests with `npm test` (Vitest)

Notes
- The project currently uses a cryptographic-proof mock (SHA256 hashes) for blockchain proofs. Replace with on-chain integration as needed.
