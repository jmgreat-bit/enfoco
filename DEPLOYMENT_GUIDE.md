# ENFOCO Deployment Guide

## Deploy to Vercel (Direct Upload Method)

### Step 1: Go to Vercel
1. Open your browser and go to [vercel.com](https://vercel.com)
2. Sign up or log in with your email/Google account

### Step 2: Create New Project
1. Click "New Project" or "Add New..." 
2. Select "Browse all templates" or "Import Project"
3. Choose "Upload" or "Drag and drop"

### Step 3: Upload Your Project
1. Drag and drop the entire `enfoco` folder
2. Or click "Browse" and select the `enfoco` folder
3. Wait for upload to complete

### Step 4: Configure Build Settings
Vercel should auto-detect:
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Step 5: Environment Variables
Add these environment variables in Vercel dashboard:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 6: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://your-app-name.vercel.app`

## After Deployment

### Analytics Setup
1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Analytics" tab
4. Enable Vercel Analytics for user tracking

### Supabase Dashboard
1. Go to your Supabase project dashboard
2. Check "Authentication" > "Users" for signup stats
3. Check "Table Editor" for user activity
4. Use "Logs" for real-time activity

## What You'll Get
- Live app URL
- User analytics
- Automatic deployments (if you connect GitHub later)
- Performance monitoring
- User signup tracking

## Next Steps
- Test your live app
- Share the URL with users
- Monitor analytics in Vercel dashboard
- Check user signups in Supabase dashboard
