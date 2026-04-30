// Production Deployment Configuration
// Provides utilities and configurations for production deployment

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  databaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  jwtSecret: string;
  corsOrigins: string[];
  rateLimiting: {
    enabled: boolean;
    redisUrl?: string;
    inMemoryFallback: boolean;
  };
  monitoring: {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    externalService?: {
      url: string;
      apiKey: string;
    };
  };
  security: {
    csrfProtection: boolean;
    helmetEnabled: boolean;
    compressionEnabled: boolean;
    sessionTimeout: number; // minutes
  };
  performance: {
    cachingEnabled: boolean;
    compressionEnabled: boolean;
    bundleOptimization: boolean;
  };
  storage: {
    bucketName: string;
    maxFileSize: number; // bytes
    allowedTypes: string[];
  };
}

export class DeploymentManager {
  private config: DeploymentConfig;
  private isProduction: boolean;

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.isProduction = config.environment === 'production';
  }

  // Validate deployment configuration
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!this.config.databaseUrl) {
      errors.push('Database URL is required');
    }

    if (!this.config.supabaseUrl) {
      errors.push('Supabase URL is required');
    }

    if (!this.config.supabaseAnonKey) {
      errors.push('Supabase anonymous key is required');
    }

    if (!this.config.supabaseServiceKey) {
      errors.push('Supabase service key is required');
    }

    if (!this.config.jwtSecret || this.config.jwtSecret.length < 32) {
      errors.push('JWT secret must be at least 32 characters');
    }

    if (!this.config.corsOrigins || this.config.corsOrigins.length === 0) {
      errors.push('CORS origins must be specified');
    }

    // Check production-specific requirements
    if (this.isProduction) {
      if (this.config.jwtSecret.length < 64) {
        errors.push('Production JWT secret should be at least 64 characters');
      }

      if (!this.config.monitoring.enabled) {
        errors.push('Production monitoring must be enabled');
      }

      if (!this.config.security.csrfProtection) {
        errors.push('Production CSRF protection must be enabled');
      }

      if (!this.config.security.helmetEnabled) {
        errors.push('Production security headers must be enabled');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Generate environment variables
  generateEnvironmentVariables(): Record<string, string> {
    return {
      NODE_ENV: this.config.environment,
      DATABASE_URL: this.config.databaseUrl,
      NEXT_PUBLIC_SUPABASE_URL: this.config.supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: this.config.supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY: this.config.supabaseServiceKey,
      JWT_SECRET: this.config.jwtSecret,
      ALLOWED_ORIGINS: this.config.corsOrigins.join(','),
      RATE_LIMITING_ENABLED: this.config.rateLimiting.enabled.toString(),
      RATE_LIMITING_REDIS_URL: this.config.rateLimiting.redisUrl || '',
      MONITORING_ENABLED: this.config.monitoring.enabled.toString(),
      LOG_LEVEL: this.config.monitoring.logLevel,
      CSRF_PROTECTION_ENABLED: this.config.security.csrfProtection.toString(),
      HELMET_ENABLED: this.config.security.helmetEnabled.toString(),
      COMPRESSION_ENABLED: this.config.security.compressionEnabled.toString(),
      SESSION_TIMEOUT: this.config.security.sessionTimeout.toString(),
      CACHING_ENABLED: this.config.performance.cachingEnabled.toString(),
      COMPRESSION_ENABLED: this.config.performance.compressionEnabled.toString(),
      BUNDLE_OPTIMIZATION: this.config.performance.bundleOptimization.toString(),
      STORAGE_BUCKET_NAME: this.config.storage.bucketName,
      MAX_FILE_SIZE: this.config.storage.maxFileSize.toString(),
      ALLOWED_FILE_TYPES: this.config.storage.allowedTypes.join(',')
    };
  }

  // Generate deployment scripts
  generateDeploymentScripts(): {
    build: string;
    deploy: string;
    rollback: string;
    healthCheck: string;
  } {
    return {
      build: `
# Build Script
#!/bin/bash
set -e

echo "🔨 Building RoktoKorobi for ${this.config.environment}..."

# Install dependencies
npm ci --only=production

# Run tests
npm run test

# Build application
npm run build

# Optimize bundle
npm run optimize

echo "✅ Build completed successfully!"
      `.trim(),

      deploy: `
# Deploy Script
#!/bin/bash
set -e

echo "🚀 Deploying RoktoKorobi to ${this.config.environment}..."

# Backup current version
if [ "${this.config.environment}" = "production" ]; then
  echo "📦 Creating backup..."
  npm run backup
fi

# Deploy new version
echo "📤 Deploying files..."
rsync -avz --delete dist/ /var/www/roktokorobi/

# Run database migrations
echo "🗃️ Running database migrations..."
npm run migrate

# Clear caches
echo "🧹 Clearing caches..."
npm run clear-cache

# Restart services
echo "🔄 Restarting services..."
systemctl restart nginx
systemctl restart roktokorobi

# Health check
echo "🏥 Running health check..."
npm run health-check

echo "✅ Deployment completed successfully!"
      `.trim(),

      rollback: `
# Rollback Script
#!/bin/bash
set -e

echo "🔄 Rolling back RoktoKorobi deployment..."

# Restore backup
echo "📦 Restoring backup..."
npm run restore-backup

# Rollback database
echo "🗃️ Rolling back database..."
npm run rollback

# Restart services
echo "🔄 Restarting services..."
systemctl restart nginx
systemctl restart roktokorobi

echo "✅ Rollback completed successfully!"
      `.trim(),

      healthCheck: `# Health Check Script
#!/bin/bash
set -e

echo "🏥 Checking RoktoKorobi health..."

# Check if application is running
if ! curl -f http://localhost:3000/api/health-simple > /dev/null 2>&1; then
  echo "❌ Application is not responding"
  exit 1
fi

# Check database connection
if ! npm run db-check > /dev/null 2>&1; then
  echo "❌ Database connection failed"
  exit 1
fi

# Check critical endpoints
ENDPOINTS="/api/health-simple /api/auth/login /api/auth/register /api/upload"

for endpoint in $ENDPOINTS; do
  if ! curl -f http://localhost:3000$endpoint > /dev/null 2>&1; then
    echo "❌ Endpoint $endpoint is not responding"
    exit 1
  fi
done

echo "✅ All health checks passed!"`.trim()
    };
  }

  // Generate Docker configuration
  generateDockerConfig(): string {
    return `
# Dockerfile for RoktoKorobi
FROM node:18-alpine AS base

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S roktokorobi -u 1001

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Copy built application
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules

# Set permissions
RUN chown -R roktokorobi:nodejs /app
USER roktokorobi

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/api/health-simple || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# Labels
LABEL maintainer="RoktoKorobi Team"
LABEL version="1.0.0"
LABEL description="Blood Donation Management System"
      `.trim();
  }

  // Generate Nginx configuration
  generateNginxConfig(): string {
    return `
# Nginx Configuration for RoktoKorobi
server {
    listen 80;
    listen [::]:80;
    server_name ${this.isProduction ? 'roktokorobi.com' : 'localhost'};
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=limit:10m rate=10r/s;
    
    # File upload size
    client_max_body_size 10M;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=limit burst=20 nodelay;
    }
    
    # Static assets
    location /_next/static/ {
        alias /app/_next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}

# HTTPS configuration (production only)
${this.isProduction ? `
server {
    listen 443 ssl http2;
    server_name roktokorobi.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/roktokorobi.com.crt;
    ssl_certificate_key /etc/ssl/private/roktokorobi.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}
` : ''}
      `.trim();
  }

  // Generate monitoring configuration
  generateMonitoringConfig(): string {
    return `
# Monitoring Configuration for RoktoKorobi

# Prometheus Configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'roktokorobi'
    static_configs:
      - targets: ['localhost:3000/metrics']
    metrics_path: '/metrics'
    scrape_interval: 5s

# Grafana Dashboard Configuration
api_version: 1

datasources:
  - name: RoktoKorobi
    type: prometheus
    access: proxy
    url: http://localhost:9090
    is_default: true

# Alerting Rules
groups:
  - name: roktokorobi.rules
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status="500"}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighMemoryUsage
        expr: nodejs_memory_usage_bytes / nodejs_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      - alert: DatabaseConnectionFailed
        expr: up{job="roktokorobi-db"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"
          description: "Database has been down for more than 1 minute"
      `.trim();
  }

  // Get current configuration
  getConfiguration(): DeploymentConfig {
    return this.config;
  }

  // Update configuration
  updateConfiguration(updates: Partial<DeploymentConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Production deployment utilities
export class ProductionDeployer {
  private deploymentManager: DeploymentManager;

  constructor(config: DeploymentConfig) {
    this.deploymentManager = new DeploymentManager(config);
  }

  // Perform production deployment
  async deploy(): Promise<{ success: boolean; message: string; rollbackAvailable: boolean }> {
    try {
      // Validate configuration
      const validation = this.deploymentManager.validateConfiguration();
      if (!validation.valid) {
        return {
          success: false,
          message: `Configuration validation failed: ${validation.errors.join(', ')}`,
          rollbackAvailable: false
        };
      }

      // Create backup
      console.log('📦 Creating backup...');
      const backupSuccess = await this.createBackup();
      if (!backupSuccess) {
        return {
          success: false,
          message: 'Backup creation failed',
          rollbackAvailable: false
        };
      }

      // Deploy application
      console.log('🚀 Deploying application...');
      const deploySuccess = await this.deployApplication();
      if (!deploySuccess) {
        return {
          success: false,
          message: 'Application deployment failed',
          rollbackAvailable: true
        };
      }

      // Run health checks
      console.log('🏥 Running health checks...');
      const healthSuccess = await this.runHealthChecks();
      if (!healthSuccess) {
        return {
          success: false,
          message: 'Health checks failed',
          rollbackAvailable: true
        };
      }

      return {
        success: true,
        message: 'Deployment completed successfully',
        rollbackAvailable: true
      };
    } catch (error) {
      return {
        success: false,
        message: `Deployment failed: ${error.message}`,
        rollbackAvailable: true
      };
    }
  }

  // Create backup
  private async createBackup(): Promise<boolean> {
    // Implementation would depend on your backup strategy
    return true;
  }

  // Deploy application
  private async deployApplication(): Promise<boolean> {
    // Implementation would depend on your deployment strategy
    return true;
  }

  // Run health checks
  private async runHealthChecks(): Promise<boolean> {
    // Implementation would check all critical endpoints
    return true;
  }

  // Rollback deployment
  async rollback(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Rolling back deployment...');
      
      // Implementation would restore from backup
      const rollbackSuccess = await this.restoreBackup();
      if (!rollbackSuccess) {
        return {
          success: false,
          message: 'Rollback failed'
        };
      }

      return {
        success: true,
        message: 'Rollback completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Rollback failed: ${error.message}`
      };
    }
  }

  // Restore backup
  private async restoreBackup(): Promise<boolean> {
    // Implementation would restore from backup
    return true;
  }
}

// Export singleton instances
export const deploymentManager = new DeploymentManager({
  environment: process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || '',
  corsOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  rateLimiting: {
    enabled: process.env.RATE_LIMITING_ENABLED === 'true',
    redisUrl: process.env.RATE_LIMITING_REDIS_URL,
    inMemoryFallback: true
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    externalService: process.env.MONITORING_SERVICE_URL ? {
      url: process.env.MONITORING_SERVICE_URL,
      apiKey: process.env.MONITORING_SERVICE_API_KEY || ''
    } : undefined
  },
  security: {
    csrfProtection: process.env.CSRF_PROTECTION_ENABLED !== 'false',
    helmetEnabled: process.env.HELMET_ENABLED !== 'false',
    compressionEnabled: process.env.COMPRESSION_ENABLED !== 'false',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '30')
  },
  performance: {
    cachingEnabled: process.env.CACHING_ENABLED !== 'false',
    compressionEnabled: process.env.COMPRESSION_ENABLED !== 'false',
    bundleOptimization: process.env.BUNDLE_OPTIMIZATION !== 'false'
  },
  storage: {
    bucketName: process.env.STORAGE_BUCKET_NAME || 'roktokorobi-chitro',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',')
  }
});

export const productionDeployer = new ProductionDeployer(deploymentManager.getConfiguration());
