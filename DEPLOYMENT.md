# Deployment Guide

This guide covers deploying the Athlete Analytics Backend API to Vercel and Render.

## Prerequisites

- GitHub repository with your code
- PostgreSQL database (we recommend [Neon](https://neon.tech) or [Supabase](https://supabase.com) for serverless PostgreSQL)
- Environment variables configured

## Environment Variables

Create these environment variables in your deployment platform:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="production"

# CORS (optional - for specific frontend domains)
CORS_ORIGIN="https://your-frontend-domain.com"
```

---

## Deployment on Vercel

Vercel is excellent for serverless Node.js APIs with automatic scaling.

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Create vercel.json Configuration

Create a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/index.ts": {
      "maxDuration": 30
    }
  }
}
```

### Step 3: Add Build Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "vercel-build": "npm run build && npx prisma generate && npx prisma db push"
  }
}
```

### Step 4: Deploy via GitHub Integration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all required environment variables from the list above
   - Set `NODE_ENV=production`
5. Click "Deploy"

### Step 5: Post-Deployment Setup

After deployment, you need to run database migrations:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Run database migration
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

### Vercel Deployment Notes

- ✅ Automatic HTTPS
- ✅ Serverless functions (cold starts ~1-2s)
- ✅ Automatic deployments on git push
- ✅ Great for APIs with sporadic traffic
- ⚠️ 10-second execution limit on hobby plan
- ⚠️ Cold starts may affect performance

---

## Deployment on Render

Render provides persistent servers ideal for databases and long-running processes.

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

### Step 2: Service Configuration

```yaml
# Render service settings
Name: athlete-analytics-backend
Environment: Node
Build Command: npm install && npm run build && npx prisma generate
Start Command: npm start
```

### Step 3: Environment Variables

Add these in Render's Environment tab:

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=10000
```

### Step 4: Build & Deploy Settings

In your Render service settings:

- **Build Command**: `npm install && npm run build && npx prisma generate`
- **Start Command**: `npm start`
- **Node Version**: `18` (or latest LTS)
- **Auto-Deploy**: `Yes` (deploys on git push)

### Step 5: Database Setup

After deployment, run migrations:

1. Go to Render Dashboard → Your Service → Shell
2. Run:
```bash
npx prisma db push
npx prisma db seed
```

### Render Deployment Notes

- ✅ Persistent servers (no cold starts)
- ✅ Free tier available
- ✅ Automatic HTTPS and custom domains
- ✅ Built-in monitoring and logs
- ✅ Great for databases and WebSocket connections
- ⚠️ Takes longer to deploy than Vercel
- ⚠️ Free tier has 750 hours/month limit

---

## Database Setup for Production

### Option 1: Neon (Recommended for Vercel)

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add as `DATABASE_URL` environment variable

### Option 2: Supabase

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add as `DATABASE_URL` environment variable

### Option 3: Railway PostgreSQL

1. Go to [Railway](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string from Variables tab
4. Add as `DATABASE_URL` environment variable

---

## Testing Your Deployment

### 1. Health Check

Test your deployed API:

```bash
curl https://your-app-url.vercel.app/api/health
# or
curl https://your-app-name.onrender.com/api/health
```

### 2. Authentication Test

```bash
# Register a new user
curl -X POST https://your-app-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "first_name": "Test",
    "last_name": "User",
    "tenant_unique_id": "test_user_001"
  }'

# Login
curl -X POST https://your-app-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@athleteanalytics.com",
    "password": "Admin@1234"
  }'
```

### 3. API Documentation

Visit your Swagger UI:
- `https://your-app-url/api-docs`

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correctly formatted
   - Ensure database is accessible from your deployment platform
   - Check if database allows external connections

2. **Build Failures**
   - Verify all dependencies are in `package.json`
   - Check TypeScript compilation errors
   - Ensure Prisma schema is valid

3. **Environment Variables**
   - Double-check all required variables are set
   - Verify no typos in variable names
   - Ensure sensitive values are properly escaped

4. **Cold Start Issues (Vercel)**
   - Consider upgrading to Pro plan for faster cold starts
   - Implement connection pooling for database

5. **Memory Issues (Render)**
   - Monitor resource usage in Render dashboard
   - Consider upgrading plan if needed

### Logs and Monitoring

**Vercel:**
- View logs in Vercel Dashboard → Your Project → Functions tab
- Real-time logs: `vercel logs --follow`

**Render:**
- View logs in Render Dashboard → Your Service → Logs tab
- Real-time monitoring available in dashboard

---

## Performance Optimization

### For Vercel Deployment

1. **Database Connection Pooling**
   ```typescript
   // Add to prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_URL") // For migrations
   }
   ```

2. **Optimize Bundle Size**
   ```json
   {
     "scripts": {
       "build": "tsc && npm prune --production"
     }
   }
   ```

### For Render Deployment

1. **Health Checks**
   ```typescript
   // Add health check endpoint
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });
   ```

2. **Process Management**
   ```json
   {
     "scripts": {
       "start": "node dist/index.js",
       "start:prod": "NODE_ENV=production node dist/index.js"
     }
   }
   ```

---

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure appropriate origins for production
3. **Rate Limiting**: Enable in production
4. **HTTPS**: Both platforms provide automatic HTTPS
5. **Database Security**: Use connection strings with strong passwords

---

## Next Steps

After successful deployment:

1. Set up monitoring (both platforms provide built-in monitoring)
2. Configure custom domain (if needed)
3. Set up CI/CD workflows
4. Implement logging and error tracking
5. Set up database backups
6. Configure staging environments

For additional support, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)