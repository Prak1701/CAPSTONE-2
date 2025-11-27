# QR Code Configuration for Evaluation

## Before Your Evaluation

### Step 1: Find Your Server IP
Run this command on your server:
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

Look for your WiFi adapter's IPv4 address (e.g., `192.168.1.100`)

### Step 2: Configure the IP

**Option A: Using .env file (Recommended)**
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your IP:
   ```
   HOST_IP=192.168.1.100
   ```

**Option B: Direct in docker-compose.yml**
Edit `docker-compose.yml` line 11:
```yaml
- HOST_IP=192.168.1.100  # Your actual IP
```

### Step 3: Restart the Application
```bash
docker-compose down
docker-compose up --build
```

### Step 4: Test QR Code
1. Generate a certificate
2. Scan QR code with your phone (must be on same WiFi)
3. Verification page should open ✅

## Important Notes

- ⚠️ **Both server and phone must be on the same WiFi network**
- ⚠️ **Update the IP before every evaluation if network changes**
- ✅ Default `auto` mode will try to detect IP automatically
- ✅ For Jenkins: Set HOST_IP in pipeline environment variables

## Troubleshooting

**QR scan doesn't work?**
- Check if phone and server are on same WiFi
- Verify the IP in docker-compose.yml is correct
- Check server logs for "Using configured IP: ..." message
