# Deployment Guide

This project uses a split architecture:

- Frontend: React + Vite (client/)
- Backend: Flask (server_flask/)

This document shows steps to deploy the frontend to Netlify or Vercel and to containerize the backend.

## Environment variables
- JWT_SECRET: secret used by Flask for JWT signing (do not commit a production secret)
- MONGO_URI: MongoDB connection string (optional; if unset server uses JSON fallback)
- VITE_API_URL: URL of the backend API used by the frontend

## Netlify (recommended for frontend)
1. Connect your repository to Netlify.
2. In Netlify UI set the build command to `npm run build:client` and the publish directory to `dist` (netlify.toml is provided).
3. Add environment variables in the Netlify site settings: `VITE_API_URL`, `JWT_SECRET` (optional).

## Vercel (alternative)
1. Connect your repository to Vercel.
2. Vercel will use `vercel.json` to build the client. Make sure `VITE_API_URL` is set in project settings.

## Backend (Flask)
- A Dockerfile is provided at `server_flask/Dockerfile`.
- Build and run locally:

  docker build -t bacv-backend -f server_flask/Dockerfile ./server_flask
  docker run -e JWT_SECRET=changeme -e MONGO_URI="$MONGO_URI" -p 5000:5000 bacv-backend

- In production use Kubernetes/CI to push image to your registry and deploy, mounting a secret for MONGO_URI and JWT_SECRET.

## CI (GitHub Actions)
A sample workflow `.github/workflows/ci.yml` runs tests, builds the client, and builds Docker images for both services. Modify to push images to your container registry.

## Notes
- The frontend builds to `dist/` by default. Adjust Netlify/Vercel publish path if you customize the build.
- For on-chain blockchain integration you'll need RPC credentials and private key management; current setup uses a SHA256 mock.
