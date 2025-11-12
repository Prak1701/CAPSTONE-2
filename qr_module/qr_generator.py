import os
import pandas as pd
import qrcode

# Folder to save QR codes
QR_FOLDER = os.path.join("static", "qrcodes")

# Your laptop IP (replace with your actual IP)
PC_IP = "172.19.24.103"
PORT = 5000

def generate_qr_codes(csv_file):
    if not os.path.exists(QR_FOLDER):
        os.makedirs(QR_FOLDER)
    
    df = pd.read_csv(csv_file)
    for _, row in df.iterrows():
        # Use your IP instead of localhost
        qr_data = f"http://{PC_IP}:{PORT}/verify/{row['Student_Hash']}"
        qr_img = qrcode.make(qr_data)
        qr_path = os.path.join(QR_FOLDER, f"{row['Roll_No']}.png")
        qr_img.save(qr_path)
        print(f"✅ QR generated for {row['Name']} → {qr_path}")
