# AWS Migration & Deployment Guide

## Overview
Complete guide to migrate your MedusaJS e-commerce store from local/Supabase to AWS.

---

## Phase 1: Setup AWS Infrastructure (Day 1-2)

### Step 1: Create AWS Account & Setup
1. Create AWS account at https://aws.amazon.com
2. Set up billing alerts (recommended: $50/month threshold)
3. Choose region: **ap-south-1 (Mumbai)** - closest to Bangladesh/India
4. Enable MFA for security

### Step 2: Create RDS PostgreSQL Database

**Via AWS Console:**
```
1. Go to RDS → Create Database
2. Choose: PostgreSQL 15.x
3. Templates: Free tier (or Production for better performance)
4. DB Instance: db.t3.micro
5. Master username: postgres
6. Master password: <your-secure-password>
7. Public access: Yes (initially, will restrict later)
8. VPC security group: Create new → allow port 5432 from your IP
9. Database name: medusa
10. Backup retention: 7 days
11. Create Database
```

**Get Connection Details:**
```
Endpoint: your-db-name.xxxx.ap-south-1.rds.amazonaws.com
Port: 5432
Database: medusa
Username: postgres
Password: <your-password>
```

### Step 3: Migrate Data from Supabase to AWS RDS

**Option A: Using pg_dump (Recommended)**

```bash
# 1. Export from Supabase (includes all indexes, data, and schema)
pg_dump "postgresql://postgres.wiiqpqzjazblrwfsshrp:00888246@aws-1-ap-south-1.pooler.supabase.com:6543/postgres" \
  --no-owner --no-acl --clean --if-exists \
  -f supabase_backup.sql

# 2. Verify backup includes your performance indexes
grep -c "idx_product_variant\|idx_inventory\|idx_cart" supabase_backup.sql
# Should show multiple matches

# 3. Import to AWS RDS
psql "postgresql://postgres:<password>@your-db.xxxx.ap-south-1.rds.amazonaws.com:5432/medusa" \
  -f supabase_backup.sql

# 4. Verify indexes were created on AWS RDS
psql "postgresql://postgres:<password>@your-db.xxxx.ap-south-1.rds.amazonaws.com:5432/medusa" \
  -c "SELECT count(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';"
```

**What Gets Migrated:**
- ✅ All tables and data
- ✅ **All performance indexes** (including the ones you just created)
- ✅ Constraints and foreign keys
- ✅ Sequences and auto-increment values
- ✅ Functions and triggers

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login and export
supabase db dump -f supabase_backup.sql

# Import to AWS
psql <aws-connection-string> -f supabase_backup.sql
```

**Post-Migration Verification:**
```sql
-- Verify all performance indexes are present
SELECT 
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
  AND tablename IN (
    'product_variant', 'inventory_item', 'inventory_level',
    'cart', 'cart_line_item', 'order', 'product', 'price'
  )
GROUP BY tablename
ORDER BY tablename;

-- Expected output:
-- product_variant: 5+ indexes
-- cart: 2+ indexes
-- cart_line_item: 2+ indexes
-- inventory_item: 1+ indexes
-- etc.

-- Test index usage on a slow query
EXPLAIN ANALYZE 
SELECT * FROM cart_line_item WHERE cart_id = 'your-cart-id';
-- Should show "Index Scan using idx_cart_line_item_cart"
```

### Step 4: Setup ElastiCache Redis (Optional but Recommended)

**Via AWS Console:**
```
1. Go to ElastiCache → Get Started
2. Choose: Redis
3. Cluster mode: Disabled
4. Node type: cache.t3.micro
5. Number of replicas: 0 (for cost savings)
6. Security group: Allow port 6379 from your backend
7. Create
```

**Alternative: Run Redis on same EC2 as backend (cheaper)**
```bash
# On your EC2 instance
docker run -d --name redis \
  -p 6379:6379 \
  --restart unless-stopped \
  redis:alpine
```

### Step 5: Setup S3 Bucket for File Storage

```bash
# Create S3 bucket
aws s3 mb s3://your-medusa-store-files --region ap-south-1

# Set public access policy (for product images)
aws s3api put-bucket-policy \
  --bucket your-medusa-store-files \
  --policy file://s3-policy.json
```

**s3-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-medusa-store-files/public/*"
    }
  ]
}
```

### Step 6: Setup CloudFront CDN (Optional)

```
1. Go to CloudFront → Create Distribution
2. Origin domain: your-s3-bucket.s3.amazonaws.com
3. Origin access: Public
4. Viewer protocol policy: Redirect HTTP to HTTPS
5. Price class: Use Only North America, Europe, and Asia
6. Create Distribution
```

---

## Phase 2: Deploy Backend to AWS (Day 3-4)

### Option A: EC2 (More Control, Cheaper)

**1. Launch EC2 Instance:**
```
AMI: Ubuntu 22.04 LTS
Instance type: t3.small (or t3.micro for testing)
Storage: 20GB GP3
Security Group: 
  - SSH (22) from your IP
  - HTTP (80) from anywhere
  - HTTPS (443) from anywhere
  - Custom TCP (9000) from anywhere (backend API)
Key pair: Create new or use existing
```

**2. Connect & Setup:**
```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/your-repo/e-commerce-coderVai.git
cd e-commerce-coderVai/demo-clothing-store

# Install dependencies
npm install

# Setup environment variables
nano .env
```

**3. Update .env for AWS:**
```env
# Database (AWS RDS)
DATABASE_URL=postgresql://postgres:<password>@your-db.xxxx.ap-south-1.rds.amazonaws.com:5432/medusa
DATABASE_EXTRA={"ssl":{"rejectUnauthorized":false},"pool":{"min":2,"max":10}}

# Redis (ElastiCache or local)
REDIS_URL=redis://your-redis.cache.amazonaws.com:6379
# OR if using local Redis:
REDIS_URL=redis://localhost:6379

# S3 Storage
S3_FILE_URL=https://your-bucket.s3.ap-south-1.amazonaws.com
S3_ACCESS_KEY_ID=<your-aws-access-key>
S3_SECRET_ACCESS_KEY=<your-aws-secret-key>
S3_REGION=ap-south-1
S3_BUCKET=your-medusa-store-files
S3_ENDPOINT=https://s3.ap-south-1.amazonaws.com

# Backend URL (your EC2 public IP or domain)
MEDUSA_BACKEND_URL=http://your-ec2-ip:9000
STORE_CORS=http://your-storefront-url,https://your-domain.com
ADMIN_CORS=http://localhost:9000,https://admin.your-domain.com

# Keep existing payment configs
SSL_STORE_ID=abc69247e9c70580
SSL_STORE_PASSWORD=abc69247e9c70580@ssl
# ... etc
```

**4. Build & Start:**
```bash
# Build
npm run build

# Start with PM2 (auto-restart on crash)
pm2 start npm --name "medusa-backend" -- start
pm2 save
pm2 startup

# View logs
pm2 logs medusa-backend
```

**5. Setup Nginx (Reverse Proxy):**
```bash
# Install Nginx
sudo apt install nginx -y

# Configure
sudo nano /etc/nginx/sites-available/medusa
```

**nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/medusa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option B: AWS ECS Fargate (Fully Managed, Easier Scaling)

**1. Create Dockerfile (if not exists):**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 9000

CMD ["npm", "start"]
```

**2. Push to ECR:**
```bash
# Create ECR repository
aws ecr create-repository --repository-name medusa-backend --region ap-south-1

# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.ap-south-1.amazonaws.com

# Build & push
docker build -t medusa-backend .
docker tag medusa-backend:latest <your-account-id>.dkr.ecr.ap-south-1.amazonaws.com/medusa-backend:latest
docker push <your-account-id>.dkr.ecr.ap-south-1.amazonaws.com/medusa-backend:latest
```

**3. Create ECS Cluster & Service:**
```
1. Go to ECS → Create Cluster
2. Cluster name: medusa-production
3. Infrastructure: AWS Fargate
4. Create

5. Create Task Definition:
   - Family: medusa-backend-task
   - Launch type: Fargate
   - CPU: 0.5 vCPU
   - Memory: 1 GB
   - Container:
     - Image: <your-ecr-image-url>
     - Port: 9000
     - Environment variables: Add all from .env
   
6. Create Service:
   - Launch type: Fargate
   - Task definition: medusa-backend-task
   - Service name: medusa-backend-service
   - Number of tasks: 1 (or 2 for HA)
   - Load balancer: Create Application Load Balancer
   - Target group: Port 9000
   - Health check: /health
```

---

## Phase 3: Deploy Storefront (Day 5)

### Option A: Vercel (Easiest, Free/Cheap)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd demo-clothing-store-storefront
vercel

# Set environment variables in Vercel dashboard:
MEDUSA_BACKEND_URL=https://api.your-domain.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<your-key>
```

### Option B: AWS Amplify

```
1. Go to AWS Amplify → New App → Host web app
2. Connect GitHub repository
3. Select branch: main
4. Build settings: Auto-detected (Next.js)
5. Environment variables: Add from .env.local
6. Deploy
```

---

## Phase 4: Production Optimizations

### 1. Database Connection Pooling
Already configured in DATABASE_EXTRA!

### 2. Enable Query Caching
```typescript
// medusa-config.ts
modules: [
  {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: process.env.REDIS_URL,
      ttl: 30, // 30 seconds cache
    },
  },
]
```

### 3. Setup Monitoring
```bash
# Install CloudWatch agent on EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure monitoring
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

### 4. Setup Backups
```bash
# Automated RDS snapshots (already enabled by default)
# Manual backup script:
aws rds create-db-snapshot \
  --db-instance-identifier your-db-instance \
  --db-snapshot-identifier backup-$(date +%Y%m%d-%H%M%S)
```

### 5. Security Hardening
```bash
# Restrict RDS security group to only backend IP
# Enable AWS WAF for DDoS protection
# Setup CloudTrail for audit logging
# Enable GuardDuty for threat detection
```

---

## Expected Performance After Migration

| Operation | Current (Supabase) | After AWS | Improvement |
|-----------|-------------------|-----------|-------------|
| Cart Add Item | 3,800ms | 200-500ms | **8-19x faster** |
| Product List | 2,800ms | 300-600ms | **5-9x faster** |
| Checkout | 5,400ms | 400-800ms | **7-13x faster** |
| Simple Query | 90ms | 5-15ms | **6-18x faster** |

---

## Cost Optimization Tips

1. **Use Reserved Instances** for RDS & EC2 (40-60% savings)
2. **Auto-scaling** for ECS/EC2 during low traffic
3. **S3 Lifecycle Policies** - move old files to cheaper storage
4. **CloudFront** reduces S3 data transfer costs
5. **Spot Instances** for non-critical tasks
6. **Delete unused snapshots** and EBS volumes

---

## Rollback Plan

If something goes wrong:
1. Keep Supabase running during migration
2. Switch DATABASE_URL back to Supabase in emergency
3. Have manual database backup before migration
4. Test thoroughly in staging environment first

---

## Need Help?

- AWS Support: https://console.aws.amazon.com/support
- MedusaJS Discord: https://discord.gg/medusajs
- Documentation: https://docs.medusajs.com/deployment


