# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Generated secure secret (32+ chars)
- [ ] `NEXTAUTH_URL` - Production URL (https://yourdomain.com)
- [ ] `OPENAI_API_KEY` - AI API key
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL

### Optional Variables
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth (if using)
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth (if using)
- [ ] `RESEND_API_KEY` - Email service (if using)

### Database
- [ ] PostgreSQL server is running
- [ ] Database created
- [ ] User has proper permissions
- [ ] `prisma migrate deploy` executed
- [ ] Database seeded (if needed)

### Build
- [ ] `yarn build` completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All tests pass

## Server Setup

### System
- [ ] Ubuntu 22.04 LTS or similar
- [ ] Node.js 18+ installed
- [ ] Yarn installed globally
- [ ] PM2 installed globally
- [ ] Git installed

### Web Server
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Reverse proxy configured
- [ ] Gzip compression enabled
- [ ] Static file caching configured

### Security
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Fail2ban installed
- [ ] Unattended upgrades enabled

## Post-Deployment

### Verification
- [ ] Homepage loads correctly
- [ ] Login/Register works
- [ ] Quiz flow works
- [ ] Admin dashboard accessible
- [ ] Dark mode works
- [ ] Mobile responsive

### Monitoring
- [ ] PM2 logs working
- [ ] Error tracking set up (Sentry)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring

### Backup
- [ ] Database backup scheduled
- [ ] Application backup configured
- [ ] Backup restoration tested

## Quick Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs ielts-mcq

# Restart application
pm2 restart ielts-mcq

# Check Nginx status
sudo systemctl status nginx

# Renew SSL certificate
sudo certbot renew --dry-run

# Database backup
pg_dump -U postgres ielts_mcq > backup_$(date +%Y%m%d).sql
```
