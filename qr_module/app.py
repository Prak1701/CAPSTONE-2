from flask import Flask, jsonify, send_file
import os
from qr_generator import generate_qr_codes

app = Flask(__name__)

# Mock student data
mock_students = {
    "hash001": {"name": "Amit Sharma", "roll_no": "CS101", "degree": "B.Tech", "year": 2025},
    "hash002": {"name": "Priya Verma", "roll_no": "CS102", "degree": "B.Tech", "year": 2025},
    "hash003": {"name": "Rahul Singh", "roll_no": "CS103", "degree": "B.Tech", "year": 2025},
    "hash004": {"name": "Sneha Patil", "roll_no": "CS104", "degree": "B.Tech", "year": 2025},
}

@app.route("/")
def home():
    return jsonify({"message": "QR Code & Verification API is running!"})

@app.route("/verify/<student_hash>")
def verify(student_hash):
    student = mock_students.get(student_hash)
    if student:
        return jsonify({
            "student": student,
            "blockchain_status": "Valid ✅ (Mock Verification)"
        })
    else:
        return jsonify({"error": "Record not found or tampered ❌"}), 404

@app.route("/qr/<roll_no>")
def get_qr(roll_no):
    path = os.path.join("static", "qrcodes", f"{roll_no}.png")
    if os.path.exists(path):
        return send_file(path, mimetype="image/png")
    return jsonify({"error": "QR not found"}), 404

if __name__ == "__main__":
    # Generate QR codes pointing to your laptop IP
    generate_qr_codes("students.csv")
    
    # Run server accessible on network
    app.run(host="0.0.0.0", port=5000, debug=True)
