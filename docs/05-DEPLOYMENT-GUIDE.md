# Deployment Guide

## Overview

This guide covers deploying the Multi-Tenant EdTech SaaS platform to production environments.

## Deployment Options

### 1. Vercel (Recommended for Next.js)
### 2. VPS (Ubuntu 22.04)
### 3. Docker
### 4. AWS/GCP/Azure

---

## Option 1: Vercel Deployment (Easiest)

### Prerequisites
- GitHub account with repository
- Vercel account
- PostgreSQL database (Neon, Supabase, or Railway)
- Redis instance (Upstash or Redis Cloud)

### Steps

1. **Prepare Database**
```bash
# Use Neon, Supabase, or Railway
# Get connection string: postgresql://user:pass@host:5432/db
```

2. **Prepare Redis**
```bash
# Use Upstash Redis
# Get connection string: redis://user:pass@host:port
```

3. **Push to GitHub**
```bash
git push origin main
```

4. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Configure environment variables (see below)
- Deploy!

5. **Set Environment Variables**
```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://your-app.vercel.app"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXT_PUBLIC_AI_ENABLED="true"
```

6. **Run Migrations**
```bash
npx prisma db push
npx prisma db seed
```

### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

## Option 2: VPS Deployment (Ubuntu 22.04)

### Server Requirements
- Ubuntu 22.04 LTS
- 2+ GB RAM
- 2+ CPU cores
- 20+ GB disk space
- Static IP address
- Domain name

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Create deploy user
sudo adduser deploy
sudo usermod -aG sudo deploy
su - deploy

# Set up firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Install Dependencies

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Redis
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2
sudo npm install -g pm2
```

### 3. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE edtech_saas;
CREATE USER edtech_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE edtech_saas TO edtech_user;
\q

# Update pg_hba.conf for local access
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: local   all   edtech_user   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 4. Configure Redis

```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Set password
requirepass your_redis_password

# Bind to localhost
bind 127.0.0.1

# Restart Redis
sudo systemctl restart redis-server
```

### 5. Deploy Application

```bash
# Clone repository
cd /home/deploy
git clone https://github.com/your-org/your-repo.git edtech-app
cd edtech-app

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
nano .env
```

`.env` contents:
```env
DATABASE_URL="postgresql://edtech_user:password@localhost:5432/edtech_saas"
REDIS_URL="redis://:your_redis_password@localhost:6379"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_AI_ENABLED="true"
NODE_ENV="production"
```

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed database
npm run db:seed

# Build application
npm run build

# Start with PM2
pm2 start npm --name "edtech-app" -- start
pm2 save
pm2 startup
```

### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/edtech-app
```

```nginx
upstream nextjs {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be added by Certbot)
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    
    # Client max body size
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://nextjs;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /static {
        proxy_pass http://nextjs;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/edtech-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl status certbot.timer
```

### 8. Set Up Monitoring

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs edtech-app
pm2 monit
```

---

## Option 3: Docker Deployment

### Docker Setup

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/edtech
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: edtech
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass your_redis_password
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

Deploy:
```bash
docker-compose up -d
docker-compose exec app npx prisma db push
docker-compose exec app npm run db:seed
```

---

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled
- [ ] Firewall configured
- [ ] Strong passwords set
- [ ] Auth secret generated securely
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Redis password set
- [ ] Rate limiting enabled

### Performance
- [ ] Gzip compression enabled
- [ ] Static files cached
- [ ] Database indexes created
- [ ] Redis cache working
- [ ] CDN configured (optional)

### Monitoring
- [ ] Application logs accessible
- [ ] Error tracking enabled
- [ ] Uptime monitoring set up
- [ ] Database backups configured
- [ ] Disk space monitoring

### Testing
- [ ] All pages load correctly
- [ ] Authentication working
- [ ] Database connections stable
- [ ] Redis cache functioning
- [ ] AI generation working
- [ ] File uploads working

---

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump -U edtech_user edtech_saas > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

Add to crontab:
```bash
crontab -e
# Daily at 2 AM
0 2 * * * /home/deploy/scripts/backup.sh
```

### Application Backups

```bash
# Backup uploaded files
rsync -av /home/deploy/edtech-app/public/uploads /backups/
```

---

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs edtech-app
# Check port
sudo netstat -tlnp | grep 3000
# Restart
pm2 restart edtech-app
```

### Database connection issues
```bash
# Test connection
psql -U edtech_user -d edtech_saas -h localhost
# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Redis connection issues
```bash
# Test connection
redis-cli -a your_redis_password ping
# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew
# Test renewal
sudo certbot renew --dry-run
```

---

## Scaling Strategies

### Vertical Scaling
1. Upgrade server resources (CPU, RAM)
2. Optimize database queries
3. Increase Redis memory
4. Enable caching layers

### Horizontal Scaling
1. Load balancer (Nginx, HAProxy)
2. Multiple app instances
3. Database read replicas
4. Redis cluster
5. CDN for static assets

---

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review security patches
- Monitor disk space
- Check error logs
- Review performance metrics
- Test backups quarterly

### Update Process
```bash
cd /home/deploy/edtech-app
git pull origin main
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run build
pm2 restart edtech-app
```

---

## Support

For deployment issues, consult:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Vercel Documentation](https://vercel.com/docs)
