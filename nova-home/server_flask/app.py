import os
import json
import csv
import io
import base64
import hashlib
import datetime
import random
import uuid
from functools import wraps
from flask import Flask, request, jsonify, send_file
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from dotenv import load_dotenv
import qrcode
from PIL import Image, ImageDraw, ImageFont

# Optional MongoDB
try:
    from pymongo import MongoClient
    from pymongo.errors import ServerSelectionTimeoutError
    MONGO_AVAILABLE = True
except Exception:
    MONGO_AVAILABLE = False

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET", "changeme")
MONGO_URI = os.getenv("MONGO_URI", "")  # set this to connect to MongoDB

# Legacy JSON fallback
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
STUDENTS_FILE = os.path.join(DATA_DIR, "students.json")
PROOFS_FILE = os.path.join(DATA_DIR, "proofs.json")
VERIF_FILE = os.path.join(DATA_DIR, "verifications.json")
TEMPLATES_FILE = os.path.join(DATA_DIR, "templates.json")
CERTS_FILE = os.path.join(DATA_DIR, "certificates.json")

CERTS_DIR = os.path.join(DATA_DIR, "certs")
TEMPLATES_DIR = os.path.join(DATA_DIR, "templates")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CERTS_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
for path, default in [
    (USERS_FILE, []),
    (STUDENTS_FILE, []),
    (PROOFS_FILE, []),
    (VERIF_FILE, {}),
    (TEMPLATES_FILE, {}),
    (CERTS_FILE, []),
]:
    if not os.path.exists(path):
        with open(path, "w") as f:
            json.dump(default, f)

# Initialize Mongo client if URI provided and pymongo available
mongo_client = None
db = None
if MONGO_AVAILABLE and MONGO_URI:
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        # trigger server selection
        mongo_client.server_info()
        db = mongo_client.get_database()
        print("Connected to MongoDB")
    except ServerSelectionTimeoutError:
        print("Could not connect to MongoDB, falling back to JSON storage")
        mongo_client = None
        db = None
else:
    if not MONGO_AVAILABLE:
        print("pymongo not installed; using JSON fallback")
    elif not MONGO_URI:
        print("MONGO_URI not set; using JSON fallback")

# Allowed university email domain (strict match)
ALLOWED_UNIVERSITY_DOMAIN = os.getenv("UNIVERSITY_ALLOWED_DOMAIN", "st.niituniversity.in").strip().lower()

def email_domain_ok(email: str) -> bool:
    if not email:
        return False
    email = email.strip().lower()
    if "@" not in email:
        return False
    _, domain = email.rsplit("@", 1)
    domain = domain.strip()
    if not domain:
        return False
    return domain == ALLOWED_UNIVERSITY_DOMAIN

app = Flask(__name__)

# Storage helpers (abstracted to allow Mongo or JSON)
def read_json(path):
    with open(path, "r") as f:
        return json.load(f)

def write_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

# Users
def get_all_users():
    if db:
        return list(db.users.find({}, {"_id": 0}))
    return read_json(USERS_FILE)

def find_user_by_email(email):
    if db:
        return db.users.find_one({"email": email}, {"_id": 0})
    users = get_all_users()
    return next((u for u in users if u["email"] == email), None)

def find_user_by_id(user_id):
    if db:
        return db.users.find_one({"id": int(user_id)}, {"_id": 0})
    users = get_all_users()
    return next((u for u in users if int(u.get("id", -1)) == int(user_id)), None)

def add_user(user):
    user.setdefault("verified", False)
    if db:
        last = db.users.find_one(sort=[("id", -1)])
        user["id"] = (last["id"] + 1) if last and "id" in last else 1
        db.users.insert_one(user)
        _u = user.copy()
        _u.pop("password", None)
        return _u
    users = get_all_users()
    user["id"] = len(users) + 1
    users.append(user)
    write_json(USERS_FILE, users)
    _u = user.copy()
    _u.pop("password", None)
    return _u

# Students
def get_all_students():
    if db:
        return list(db.students.find({}, {"_id": 0}))
    return read_json(STUDENTS_FILE)

def add_student_record(record):
    if db:
        last = db.students.find_one(sort=[("id", -1)])
        record["id"] = (last["id"] + 1) if last and "id" in last else 1
        db.students.insert_one(record)
        return record
    students = get_all_students()
    record["id"] = len(students) + 1
    students.append(record)
    write_json(STUDENTS_FILE, students)
    return record

def find_student_by_id(student_id):
    if db:
        return db.students.find_one({"id": student_id}, {"_id": 0})
    students = get_all_students()
    return next((s for s in students if s["id"] == student_id), None)

# Proofs
def get_all_proofs():
    if db:
        return list(db.proofs.find({}, {"_id": 0}))
    return read_json(PROOFS_FILE)

def add_proof(proof):
    if db:
        db.proofs.insert_one(proof)
        return proof
    proofs = get_all_proofs()
    proofs.append(proof)
    write_json(PROOFS_FILE, proofs)
    return proof

def get_latest_proof_for_student(student_id):
    if db:
        cursor = db.proofs.find({"student_id": student_id}).sort([("timestamp", -1)])
        doc = cursor.limit(1)
        lst = list(doc)
        return lst[0] if lst else None
    proofs = get_all_proofs()
    for p in reversed(proofs):
        if p.get("student_id") == student_id:
            return p
    return None

# Templates and certificates helpers
def load_templates():
    return read_json(TEMPLATES_FILE)

def save_templates(data):
    write_json(TEMPLATES_FILE, data)

def load_certificates():
    return read_json(CERTS_FILE)

def save_certificates(data):
    write_json(CERTS_FILE, data)

def create_qr_image(payload: dict, size: int = 300) -> Image.Image:
    # payload may be dict or raw token; serialize accordingly
    data = json.dumps(payload) if isinstance(payload, dict) else str(payload)
    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    img = img.resize((size, size))
    return img

def generate_certificate_image(template_path: str, layout: dict, student: dict, cert_id: int) -> str:
    # Open template
    template = Image.open(template_path).convert("RGBA")
    draw = ImageDraw.Draw(template)

    # Prepare font (fallback to default)
    try:
        font_path = os.path.join(os.path.dirname(__file__), "fonts", "DejaVuSans.ttf")
        font = ImageFont.truetype(font_path, layout.get("font_size", 36))
    except Exception:
        font = ImageFont.load_default()

    # Generate signed token for this certificate and student
    token_payload = {"student_id": student.get("id"), "cert_id": cert_id}
    token = make_token(token_payload)

    # Generate QR image containing the token
    qr_img = create_qr_image({"token": token}, size=layout.get("qr_size", 200))

    # Paste QR
    qr_pos = tuple(layout.get("qr_position", (template.width - qr_img.width - 50, template.height - qr_img.height - 50)))
    template.paste(qr_img, qr_pos, qr_img)

    # Draw student name
    name = student.get("data", {}).get("name") or student.get("username") or ""
    name_pos = tuple(layout.get("name_position", (100, template.height - 200)))
    draw.text(name_pos, str(name), font=font, fill=(0, 0, 0))

    # Draw cert number
    cert_no = f"CERT-{cert_id:06d}"
    cert_pos = tuple(layout.get("cert_no_position", (100, template.height - 150)))
    draw.text(cert_pos, cert_no, font=font, fill=(0, 0, 0))

    # Draw date
    date_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    date_pos = tuple(layout.get("date_position", (100, template.height - 100)))
    draw.text(date_pos, date_str, font=font, fill=(0, 0, 0))

    # Save PNG
    cert_filename = f"cert_{cert_id}.png"
    cert_path = os.path.join(CERTS_DIR, cert_filename)
    template.save(cert_path)

    # Also create PDF version
    try:
        img_rgb = Image.open(cert_path).convert("RGB")
        pdf_path = os.path.splitext(cert_path)[0] + ".pdf"
        img_rgb.save(pdf_path, "PDF", resolution=100.0)
        return pdf_path
    except Exception:
        return cert_path

# Auth utils
def make_token(payload):
    payload = payload.copy()
    payload["exp"] = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"]) 
    except Exception:
        return None

def auth_required(role=None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization", "")
            if not auth.startswith("Bearer "):
                return jsonify({"error": "Missing token"}), 401
            token = auth.split(" ", 1)[1]
            data = verify_token(token)
            if not data:
                return jsonify({"error": "Invalid token"}), 401
            user = find_user_by_id(data.get("id"))
            if not user:
                return jsonify({"error": "User not found"}), 401
            if role and user.get("role") != role:
                return jsonify({"error": "Forbidden"}), 403
            if user.get("role") == "university" and not user.get("verified"):
                return jsonify({"error": "University account not verified"}), 403
            request.user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Auth endpoints
@app.route("/auth/send_verification", methods=["POST"])
def send_verification():
    body = request.get_json() or {}
    email = body.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    if not email_domain_ok(email):
        return jsonify({"error": "Invalid university domain"}), 400
    code = create_verification(email)
    print(f"Verification code for {email}: {code}")
    return jsonify({"ok": True, "message": "Verification code generated and (in dev) returned in response.", "code": code})

@app.route("/auth/verify_code", methods=["POST"])
def verify_code():
    body = request.get_json() or {}
    email = body.get("email")
    code = body.get("code")
    if not email or not code:
        return jsonify({"error": "Email and code required"}), 400
    if verify_code_for_email(email, str(code)):
        return jsonify({"ok": True})
    return jsonify({"error": "Invalid or expired code"}), 400

@app.route("/auth/register", methods=["POST"])
def register():
    body = request.get_json() or {}
    username = body.get("username")
    email = body.get("email")
    password = body.get("password")
    role = body.get("role", "student")
    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400
    if find_user_by_email(email):
        return jsonify({"error": "User exists"}), 400
    verified = True
    if role == "university":
        verified = False
        if not email_domain_ok(email):
            return jsonify({"error": "University signups are restricted to the configured domain"}), 400
        if is_email_verified(email):
            verified = True
    user = {
        "username": username,
        "email": email,
        "password": generate_password_hash(password),
        "role": role,
        "verified": verified,
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    _u = add_user(user)
    token = make_token({"id": _u["id"], "email": email, "role": role, "verified": _u.get("verified", False)})
    return jsonify({"token": token, "user": {"id": _u["id"], "username": username, "email": email, "role": role, "verified": _u.get("verified", False)}})

@app.route("/auth/login", methods=["POST"])
def login():
    body = request.get_json() or {}
    email = body.get("email")
    password = body.get("password")
    user = find_user_by_email(email)
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401
    token = make_token({"id": user["id"], "email": user["email"], "role": user.get("role", "student"), "verified": user.get("verified", False)})
    return jsonify({"token": token, "user": {"id": user["id"], "username": user["username"], "email": user["email"], "role": user.get("role", "student"), "verified": user.get("verified", False)}})

# Admin: list pending university signups
@app.route("/admin/pending-users", methods=["GET"])
@auth_required(role="admin")
def admin_pending_users():
    users = get_all_users()
    pending = [u for u in users if u.get("role") == "university" and not u.get("verified")]
    return jsonify({"count": len(pending), "users": pending})

# Admin: approve a university account
@app.route("/admin/approve", methods=["POST"])
@auth_required(role="admin")
def admin_approve():
    body = request.get_json() or {}
    user_id = body.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    if db:
        res = db.users.update_one({"id": int(user_id)}, {"$set": {"verified": True}})
        if res.matched_count == 0:
            return jsonify({"error": "user not found"}), 404
        return jsonify({"ok": True})
    users = get_all_users()
    found = False
    for u in users:
        if int(u.get("id", -1)) == int(user_id):
            u["verified"] = True
            found = True
            break
    if not found:
        return jsonify({"error": "user not found"}), 404
    write_json(USERS_FILE, users)
    return jsonify({"ok": True})

# Upload certificate template (university)
@app.route("/university/template/upload", methods=["POST"])
@auth_required(role="university")
def upload_template():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    layout_str = request.form.get("layout", "{}")
    try:
        layout = json.loads(layout_str)
    except Exception:
        layout = {}

    # save file
    ext = os.path.splitext(file.filename)[1] or ".png"
    template_id = str(uuid.uuid4())
    filename = f"template_{template_id}{ext}"
    path = os.path.join(TEMPLATES_DIR, filename)
    file.save(path)

    templates = load_templates()
    templates[template_id] = {"filename": filename, "layout": layout, "uploaded_by": request.user.get("email"), "uploaded_at": datetime.datetime.utcnow().isoformat()}
    save_templates(templates)

    return jsonify({"ok": True, "template_id": template_id, "template": templates[template_id]})

# List templates (university)
@app.route("/university/templates", methods=["GET"])
@auth_required(role="university")
def university_templates():
    templates = load_templates()
    # return only templates uploaded by this university or all if admin
    user_email = request.user.get("email")
    filtered = {tid: meta for tid, meta in templates.items() if meta.get("uploaded_by") == user_email}
    return jsonify({"templates": filtered})

# University CSV upload (protected: university)
@app.route("/university/upload", methods=["POST"])
@auth_required(role="university")
def university_upload():
    # expects multipart form with file and optional template_id
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    template_id = request.form.get("template_id")

    templates = load_templates()
    template_meta = templates.get(template_id) if template_id else None
    template_path = os.path.join(TEMPLATES_DIR, template_meta["filename"]) if template_meta else None
    layout = template_meta["layout"] if template_meta else {}

    stream = io.StringIO(file.stream.read().decode("utf-8"))
    reader = csv.DictReader(stream)
    new_rows = []
    certs = load_certificates()
    for row in reader:
        row_record = {
            "data": row,
            "uploaded_by": request.user.get("email"),
            "created_at": datetime.datetime.utcnow().isoformat(),
        }
        stored = add_student_record(row_record)
        # create proof (sha256 of JSON string)
        h = hashlib.sha256(json.dumps(stored["data"], sort_keys=True).encode("utf-8")).hexdigest()
        proof = {"student_id": stored["id"], "hash": h, "timestamp": datetime.datetime.utcnow().isoformat()}
        add_proof(proof)

        # generate certificate if template provided
        cert_info = None
        if template_path and os.path.exists(template_path):
            cert_id = len(certs) + 1
            try:
                cert_path = generate_certificate_image(template_path, layout, stored, cert_id)
                cert_record = {"cert_id": cert_id, "student_id": stored["id"], "file": os.path.relpath(cert_path, DATA_DIR), "generated_at": datetime.datetime.utcnow().isoformat(), "issued_by": request.user.get("email")}
                certs.append(cert_record)
                # attempt to email cert to student if email present
                student_email = stored.get("data", {}).get("email")
                cert_record["emailed_to"] = None
                if student_email and os.path.exists(os.path.join(DATA_DIR, cert_record["file"])):
                    sent = send_email_with_attachment(student_email, "Your Certificate", "Please find your certificate attached.", os.path.join(DATA_DIR, cert_record["file"]))
                    if sent:
                        cert_record["emailed_to"] = student_email
                        cert_record["emailed_at"] = datetime.datetime.utcnow().isoformat()
                save_certificates(certs)
                cert_info = cert_record
            except Exception as e:
                print("certificate generation failed:", e)
                cert_info = {"error": str(e)}

        new_rows.append({"student": stored, "proof": proof, "certificate": cert_info})
    return jsonify({"uploaded": len(new_rows), "rows": new_rows})

# send email helper
import smtplib
from email.message import EmailMessage

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "0")) if os.getenv("SMTP_PORT") else None
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)


def send_email_with_attachment(to_email: str, subject: str, body: str, attachment_path: str) -> bool:
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        print("SMTP not configured; skipping email to", to_email)
        return False
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = to_email
        msg.set_content(body)

        with open(attachment_path, "rb") as f:
            data = f.read()
            maintype = "application"
            subtype = "pdf" if attachment_path.lower().endswith('.pdf') else 'octet-stream'
            msg.add_attachment(data, maintype=maintype, subtype=subtype, filename=os.path.basename(attachment_path))

        if SMTP_PORT and SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT or 587)
            server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        print(f"Email sent to {to_email}")
        return True
    except Exception as e:
        print("Failed to send email", e)
        return False

# Endpoint to list certificates for the university
@app.route("/university/certificates", methods=["GET"])
@auth_required(role="university")
def university_certificates():
    certs = load_certificates()
    # filter by issuer
    user_email = request.user.get("email")
    filtered = [c for c in certs if c.get("issued_by") == user_email]
    return jsonify({"count": len(filtered), "certificates": filtered})

# Download certificate file
@app.route("/certificates/<int:cert_id>", methods=["GET"])
def download_certificate(cert_id):
    certs = load_certificates()
    rec = next((c for c in certs if int(c.get("cert_id")) == int(cert_id)), None)
    if not rec:
        return jsonify({"error": "certificate not found"}), 404
    path = os.path.join(DATA_DIR, rec.get("file"))
    if not os.path.exists(path):
        return jsonify({"error": "file missing"}), 404
    return send_file(path, as_attachment=True)

# Student: list their certificates
@app.route("/student/certificates", methods=["GET"])
@auth_required(role="student")
def student_certificates():
    user = request.user
    certs = load_certificates()
    my = [c for c in certs if int(c.get("student_id")) == int(user.get("id"))]
    return jsonify({"count": len(my), "certificates": my})

# University: resend email for a certificate
@app.route("/certificates/<int:cert_id>/resend", methods=["POST"])
@auth_required(role="university")
def resend_certificate_email(cert_id):
    certs = load_certificates()
    rec = next((c for c in certs if int(c.get("cert_id")) == int(cert_id)), None)
    if not rec:
        return jsonify({"error": "certificate not found"}), 404
    student = find_student_by_id(rec.get("student_id"))
    if not student:
        return jsonify({"error": "student not found"}), 404
    student_email = student.get("data", {}).get("email")
    path = os.path.join(DATA_DIR, rec.get("file"))
    sent = False
    if student_email and os.path.exists(path):
        sent = send_email_with_attachment(student_email, "Your certificate", "Please find your certificate attached.", path)
        if sent:
            rec["emailed_to"] = student_email
            rec["emailed_at"] = datetime.datetime.utcnow().isoformat()
            save_certificates(certs)
    return jsonify({"ok": True, "sent": sent})

# Blockchain mock: add proof for a single record
@app.route("/blockchain/add", methods=["POST"])
@auth_required()
def blockchain_add():
    body = request.get_json() or {}
    student_id = body.get("student_id")
    student = find_student_by_id(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    h = hashlib.sha256(json.dumps(student["data"], sort_keys=True).encode("utf-8")).hexdigest()
    proof = {"student_id": student_id, "hash": h, "timestamp": datetime.datetime.utcnow().isoformat(), "added_by": request.user.get("email")}
    add_proof(proof)
    return jsonify({"proof": proof})

# Verify proof
@app.route("/blockchain/verify", methods=["POST"])
def blockchain_verify():
    body = request.get_json() or {}
    student_id = body.get("student_id")
    student = find_student_by_id(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    expected = hashlib.sha256(json.dumps(student["data"], sort_keys=True).encode("utf-8")).hexdigest()
    proof = get_latest_proof_for_student(student_id)
    valid = proof and proof.get("hash") == expected
    return jsonify({"valid": bool(valid), "proof": proof, "expected": expected})

# Verify a signed token from QR
@app.route("/verify_token", methods=["POST"])
def verify_token_endpoint():
    body = request.get_json() or {}
    token = body.get("token") or request.args.get("token")
    if not token:
        return jsonify({"error": "token required"}), 400
    payload = verify_token(token)
    if not payload:
        return jsonify({"error": "invalid or expired token"}), 400
    cert_id = payload.get("cert_id")
    student_id = payload.get("student_id")
    # locate certificate and check proof
    certs = load_certificates()
    cert = next((c for c in certs if int(c.get("cert_id")) == int(cert_id)), None)
    student = find_student_by_id(student_id)
    if not student:
        return jsonify({"error": "student not found"}), 404
    proof = get_latest_proof_for_student(student_id)
    expected = hashlib.sha256(json.dumps(student.get("data", {}), sort_keys=True).encode("utf-8")).hexdigest()
    valid = bool(proof and proof.get("hash") == expected)
    return jsonify({"valid": valid, "proof": proof, "expected": expected, "certificate": cert})

# Generate QR for a student (returns base64 PNG)
@app.route("/generate_qr", methods=["POST"])
def generate_qr():
    body = request.get_json() or {}
    student_id = body.get("student_id")
    student = find_student_by_id(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    payload = {"student_id": student_id, "timestamp": datetime.datetime.utcnow().isoformat()}
    data = json.dumps(payload)
    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return jsonify({"qr_base64": img_b64, "payload": payload})

# Employer search
@app.route("/employer/search", methods=["GET"])
def employer_search():
    q = request.args.get("q", "").lower()
    students = get_all_students()
    matches = [s for s in students if q in json.dumps(s.get("data", {})).lower() or q in str(s.get("id", ""))]
    results = []
    for s in matches:
        expected = hashlib.sha256(json.dumps(s["data"], sort_keys=True).encode("utf-8")).hexdigest()
        proof = get_latest_proof_for_student(s["id"])
        valid = proof and proof.get("hash") == expected
        results.append({"student": s, "verified": bool(valid), "proof": proof})
    return jsonify({"count": len(results), "results": results})

# Simple endpoint to fetch records (protected: university)
@app.route("/university/records", methods=["GET"])
@auth_required(role="university")
def university_records():
    students = get_all_students()
    return jsonify({"count": len(students), "students": students})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
