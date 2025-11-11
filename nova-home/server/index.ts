import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import multer from "multer";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import nodemailer from "nodemailer";

const DATA_DIR = path.resolve(__dirname, "../server/data");
const TEMPLATES_DIR = path.join(DATA_DIR, "templates");
const CERTS_DIR = path.join(DATA_DIR, "certs");
const TEMPLATES_FILE = path.join(DATA_DIR, "templates.json");
const CERTS_FILE = path.join(DATA_DIR, "certificates.json");

fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
fs.mkdirSync(CERTS_DIR, { recursive: true });
if (!fs.existsSync(TEMPLATES_FILE)) fs.writeFileSync(TEMPLATES_FILE, JSON.stringify({}));
if (!fs.existsSync(CERTS_FILE)) fs.writeFileSync(CERTS_FILE, JSON.stringify([]));

const upload = multer({ dest: path.join(DATA_DIR, "uploads") });

function readJson(p: string) {
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch(e) { return null; }
}
function writeJson(p: string, data: any) { fs.writeFileSync(p, JSON.stringify(data, null, 2)); }

// Simple transporter using SMTP env vars
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
let transporter: any = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT || 587, secure: (SMTP_PORT === 465), auth: { user: SMTP_USER, pass: SMTP_PASS } });
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Upload template
  app.post('/university/template/upload', upload.single('file'), (req, res) => {
    const file = req.file as any;
    const layout = req.body.layout ? JSON.parse(req.body.layout) : {};
    if (!file) return res.status(400).json({ error: 'No file' });
    const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
    const ext = path.extname(file.originalname) || '.png';
    const filename = `template_${id}${ext}`;
    const dest = path.join(TEMPLATES_DIR, filename);
    fs.renameSync(file.path, dest);
    const templates = readJson(TEMPLATES_FILE) || {};
    templates[id] = { filename, layout, uploaded_at: new Date().toISOString() };
    writeJson(TEMPLATES_FILE, templates);
    res.json({ ok: true, template_id: id, template: templates[id] });
  });

  // list templates
  app.get('/university/templates', (req, res) => {
    const templates = readJson(TEMPLATES_FILE) || {};
    res.json({ templates });
  });

  // upload csv (simple) - expects file field 'file' and optional template_id
  app.post('/university/upload', upload.single('file'), (req, res) => {
    const file = req.file as any;
    const template_id = req.body.template_id;
    if (!file) return res.status(400).json({ error: 'No file' });
    const content = fs.readFileSync(file.path, 'utf-8');
    // parse CSV header
    const lines = content.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(l => {
      const parts = l.split(',');
      const obj: any = {};
      header.forEach((h, i) => obj[h] = parts[i] || '');
      return obj;
    });
    // create certificate records
    const certs = readJson(CERTS_FILE) || [];
    const templates = readJson(TEMPLATES_FILE) || {};
    const template = template_id ? templates[template_id] : null;
    rows.forEach((r: any, idx: number) => {
      const cert_id = certs.length + 1;
      const filename = template ? template.filename : null;
      const storedFile = filename ? path.join('templates', filename) : null;
      const rec = { cert_id, student_data: r, generated_at: new Date().toISOString(), file: storedFile };
      certs.push(rec);
      // attempt to email if transporter and email field
      try {
        const to = r.email;
        if (transporter && to && storedFile) {
          const filePath = path.join(DATA_DIR, storedFile);
          if (fs.existsSync(filePath)) {
            transporter.sendMail({ from: SMTP_FROM, to, subject: 'Your certificate', text: 'Please find attached', attachments: [{ filename: path.basename(filePath), path: filePath }] }).catch(e => console.error('mail error', e));
            rec.emailed_to = to; rec.emailed_at = new Date().toISOString();
          }
        }
      } catch(e){ console.error(e); }
    });
    writeJson(CERTS_FILE, certs);
    res.json({ uploaded: rows.length, rows: rows.map((r:any,i:number)=>({ student: r, cert_id: i+1 })) });
  });

  // list certificates
  app.get('/university/certificates', (req, res) => {
    const certs = readJson(CERTS_FILE) || [];
    res.json({ count: certs.length, certificates: certs });
  });

  // download cert
  app.get('/certificates/:cert_id', (req, res) => {
    const certs = readJson(CERTS_FILE) || [];
    const cid = parseInt(req.params.cert_id, 10);
    const rec = certs.find((c:any) => c.cert_id === cid);
    if (!rec) return res.status(404).json({ error: 'not found' });
    if (!rec.file) return res.status(404).json({ error: 'file missing' });
    const p = path.join(DATA_DIR, rec.file);
    if (!fs.existsSync(p)) return res.status(404).json({ error: 'file missing on disk' });
    res.download(p);
  });

  // student certificates (mock: find by ?email param)
  app.get('/student/certificates', (req, res) => {
    const email = req.query.email as string | undefined;
    const certs = readJson(CERTS_FILE) || [];
    if (email) {
      const filtered = certs.filter((c:any) => (c.student_data && c.student_data.email && c.student_data.email.toLowerCase() === email.toLowerCase()));
      return res.json({ count: filtered.length, certificates: filtered });
    }
    res.json({ count: certs.length, certificates: certs });
  });

  // generate QR for student: returns data URL
  app.post('/generate_qr', express.json(), async (req, res) => {
    const { student_id } = req.body as any;
    // find student data in certs
    const certs = readJson(CERTS_FILE) || [];
    const rec = certs.find((c:any) => c.student_data && (c.student_data.id == student_id || c.student_data.student_id == student_id));
    const payload = { student_id: student_id || null, timestamp: new Date().toISOString() };
    try {
      const dataUrl = await QRCode.toDataURL(JSON.stringify(payload));
      const base64 = dataUrl.split(',')[1];
      res.json({ qr_base64: base64, payload });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  return app;
}
