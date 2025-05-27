# Deployment Guide for Solana Jackpot Platform

This guide explains how to deploy your Solana Jackpot Platform on Render.com.

## Prerequisites

1. A GitHub repository with your code
2. A Render.com account
3. Your QuikNode RPC endpoint URL

## Files Required for Deployment

### Core Files
- `package.json` - Updated with all dependencies
- `render.yaml` - Render service configuration
- `server/index.js` - Backend server
- All frontend files (`app/`, `components/`, `hooks/`, etc.)

### Optional Files
- `Dockerfile` - For containerized deployment
- `.dockerignore` - Docker build exclusions

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Environment Variables**
   The following environment variables will be automatically set from `render.yaml`:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta`
   - `NEXT_PUBLIC_RPC_ENDPOINT=your-quiknode-url`
   - `PORT=10000` (for backend)
   - URLs will be automatically linked between services

### Option 2: Manual Service Creation

1. **Create Backend Service**
   - Service Type: Web Service
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm run server`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=10000
     CLIENT_URL=https://your-frontend-url.onrender.com
     ```

2. **Create Frontend Service**
   - Service Type: Web Service
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.onrender.com
     NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
     NEXT_PUBLIC_RPC_ENDPOINT=https://magical-boldest-patina.solana-mainnet.quiknode.pro/a94255dcbb27e52b1d4cca35d10e899b82b6bdba/
     ```

## Important Notes

### Service Dependencies
- The frontend depends on the backend for socket connections
- Update `NEXT_PUBLIC_SOCKET_URL` with your backend service URL
- Update `CLIENT_URL` on backend with your frontend service URL

### Performance Considerations
- Use Render's Starter plan for testing
- Consider upgrading to Standard plan for production traffic
- Backend service should always be running (not sleep) for real-time functionality

### Security
- Your RPC endpoint URL is exposed in the frontend (normal for public RPC endpoints)
- Consider implementing rate limiting for production use
- Monitor for abuse and implement user limits as needed

### Troubleshooting
- Check service logs in Render dashboard
- Ensure all environment variables are set correctly
- Verify CORS settings allow your frontend domain
- Test socket connections work between services

## Cost Estimation
- 2 Starter services: ~$14/month
- 2 Standard services: ~$50/month (recommended for production)

## Health Checks
Both services include health check endpoints:
- Backend: `GET /health`
- Frontend: Default Next.js health checks

## Scaling
- Render automatically handles scaling within service limits
- Consider implementing Redis for multi-instance state management if scaling beyond single instance 