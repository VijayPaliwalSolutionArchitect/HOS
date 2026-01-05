/**
 * PM2 Ecosystem Configuration
 * 
 * Use this file for production deployment with PM2
 * 
 * Commands:
 *   pm2 start ecosystem.config.js
 *   pm2 stop ielts-mcq
 *   pm2 restart ielts-mcq
 *   pm2 logs ielts-mcq
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      // Application name
      name: 'ielts-mcq',
      
      // Start script
      script: 'node_modules/.bin/next',
      args: 'start',
      
      // Working directory
      cwd: '/var/www/ielts-mcq-app',
      
      // Cluster mode for load balancing
      instances: 'max', // or specific number like 2
      exec_mode: 'cluster',
      
      // Auto-restart on crash
      autorestart: true,
      
      // Watch for file changes (disable in production)
      watch: false,
      
      // Max memory before restart
      max_memory_restart: '1G',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Production environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Development environment
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/pm2/ielts-mcq-error.log',
      out_file: '/var/log/pm2/ielts-mcq-out.log',
      combine_logs: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
