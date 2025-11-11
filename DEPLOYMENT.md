## Deployment Guide - Millennium Potter Fintech Platform

This guide covers deploying the Millennium Potter platform to production.

## Prerequisites

- ✅ Supabase project set up (see SUPABASE_SETUP.md)
- ✅ Node.js 18+ installed
- ✅ Git repository
- ✅ Vercel or Netlify account (for hosting)

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

Vercel provides excellent performance for React applications with automatic deployments.

#### Step 1: Prepare Your Project

1. Ensure all environment variables are set in `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. Test production build locally:
```bash
npm run build
npm run preview
```

3. Commit your code to Git:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Deploy to Vercel

**Method A: Using Vercel Dashboard**

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment
8. Your app will be live at `https://your-project.vercel.app`

**Method B: Using Vercel CLI**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow prompts and add environment variables when asked

5. Deploy to production:
```bash
vercel --prod
```

### Option 2: Deploy to Netlify

#### Step 1: Prepare Your Project

1. Create `netlify.toml` in project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Test build:
```bash
npm run build
```

#### Step 2: Deploy to Netlify

**Method A: Using Netlify Dashboard**

1. Go to https://app.netlify.com
2. Click **"Add new site"** > **"Import an existing project"**
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

5. Add Environment Variables:
   - Go to **Site settings** > **Environment variables**
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

6. Click **"Deploy site"**
7. Your app will be live at `https://your-site.netlify.app`

**Method B: Using Netlify CLI**

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Initialize:
```bash
netlify init
```

4. Deploy:
```bash
netlify deploy --prod
```

### Option 3: Deploy to Custom Server (VPS)

#### Requirements
- Ubuntu 20.04+ server
- Nginx installed
- Node.js 18+ installed
- Domain name pointed to server

#### Step 1: Build Application

```bash
npm run build
```

#### Step 2: Upload to Server

```bash
scp -r dist/* user@your-server:/var/www/millennium-potter/
```

#### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/millennium-potter`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/millennium-potter;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/millennium-potter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 4: Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment Checklist

### 1. Verify Supabase Connection

- [ ] Test login with admin credentials
- [ ] Check browser console for errors
- [ ] Verify API calls are reaching Supabase

### 2. Test User Roles

- [ ] Login as Admin - verify global access
- [ ] Login as Sub-Admin - verify branch-specific access
- [ ] Login as Agent - verify own data access only

### 3. Test Core Features

- [ ] Customer registration
- [ ] Loan application
- [ ] Loan approval workflow
- [ ] Payment recording
- [ ] Real-time updates

### 4. Performance Optimization

- [ ] Enable Gzip compression
- [ ] Configure CDN (Vercel/Netlify do this automatically)
- [ ] Optimize images
- [ ] Enable caching headers

### 5. Security Checks

- [ ] HTTPS enabled
- [ ] Environment variables not exposed in client
- [ ] RLS policies working correctly
- [ ] CORS configured properly in Supabase

### 6. Monitoring Setup

- [ ] Setup error tracking (Sentry, LogRocket)
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Setup uptime monitoring (UptimeRobot, Pingdom)

## Environment Variables

### Development (.env.local)
```bash
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
```

### Production (.env.production)
```bash
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

## Custom Domain Setup

### Vercel

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (5-30 minutes)

### Netlify

1. Go to Site Settings > Domain management
2. Add custom domain
3. Update DNS records:
   - Type: A
   - Name: @
   - Value: (Netlify's IP)
4. Wait for DNS propagation

## Continuous Deployment

### Automatic Deployments

Both Vercel and Netlify support automatic deployments:

1. **Main branch** → Production
2. **Develop branch** → Preview/Staging
3. **Pull requests** → Preview deployments

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      # Add deployment step for your platform
```

## Rollback Strategy

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "..." > "Promote to Production"

### Netlify
1. Go to Deploys
2. Find previous deployment
3. Click "Publish deploy"

### Manual Rollback
```bash
git revert HEAD
git push origin main
```

## Performance Benchmarks

Target metrics for production:

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 500KB (gzipped)

## Troubleshooting

### Issue: White screen after deployment
**Solution**: Check browser console for errors, verify environment variables

### Issue: API calls failing
**Solution**: 
1. Verify Supabase URL and key
2. Check CORS settings in Supabase
3. Verify RLS policies

### Issue: Slow load times
**Solution**:
1. Enable code splitting
2. Optimize images
3. Use CDN
4. Enable caching

### Issue: Authentication not working
**Solution**:
1. Check Supabase Auth settings
2. Verify redirect URLs in Supabase dashboard
3. Check session persistence

## Maintenance

### Regular Tasks

**Weekly**:
- [ ] Check error logs
- [ ] Review performance metrics
- [ ] Monitor database size

**Monthly**:
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Backup database
- [ ] Test disaster recovery

**Quarterly**:
- [ ] Performance audit
- [ ] Security audit
- [ ] User feedback review
- [ ] Feature planning

## Backup Strategy

### Database Backups

Supabase provides automatic daily backups. For additional safety:

1. Go to Supabase Dashboard > Database > Backups
2. Enable Point-in-Time Recovery (PITR) for production
3. Schedule weekly manual backups

### Code Backups

- Git repository (primary)
- GitHub/GitLab (remote)
- Local backups of production builds

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev

## Production URLs

After deployment, update these:

- **Production URL**: https://millenniumpotter.com
- **Staging URL**: https://staging.millenniumpotter.com
- **Supabase Dashboard**: https://app.supabase.com/project/your-project

---

**Remember**: Always test in staging before deploying to production!
