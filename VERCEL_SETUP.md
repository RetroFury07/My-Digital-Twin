# 🚀 Vercel Deployment Setup

## ⚠️ Current Issue
Your app is deployed but getting "backend server error" because environment variables aren't configured.

## ✅ Fix: Add Environment Variables

### Step 1: Go to Vercel Settings
https://vercel.com/retrofury07s-projects/my-digital-twin-m79j/settings/environment-variables

### Step 2: Add Required Variable
Click "Add New" and enter:

**Name:** `GROQ_API_KEY`  
**Value:** Your Groq API key (get it from: https://console.groq.com/keys)  
**Environment:** Production, Preview, Development (select all)

### Step 3: Optional - Add Vector DB Variables
If you want to use Upstash Vector instead of mock data:

**Name:** `UPSTASH_VECTOR_REST_URL`  
**Value:** Your Upstash URL  
**Environment:** All

**Name:** `UPSTASH_VECTOR_REST_TOKEN`  
**Value:** Your Upstash token  
**Environment:** All

**Name:** `VECTOR_DB_PROVIDER`  
**Value:** `upstash`  
**Environment:** All

### Step 4: Redeploy
After adding variables, go to:
https://vercel.com/retrofury07s-projects/my-digital-twin-m79j

Click "Redeploy" on your latest deployment, or just push a small change to trigger auto-deploy.

## 🧪 Test After Setup

Visit: https://my-digital-twin-m79j.vercel.app

The chat should work without the "backend server error" once the `GROQ_API_KEY` is set.

## 📊 Monitoring Dashboard
https://my-digital-twin-m79j.vercel.app/monitoring

## 🔧 Local Development (Already Working)
Your local version at http://localhost:3000 is working because it uses your `.env.local` file with the API key.

The Vercel deployment just needs the same key added through the Vercel dashboard.
