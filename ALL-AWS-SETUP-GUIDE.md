# All-AWS Deployment Guide
## Deploy Both Backend + Frontend on AWS

---

## Architecture: Everything on AWS

```
┌─────────────────────────────────────────────────────────┐
│           AWS Region: ap-south-1 (Mumbai)               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────┐             │
│  │      EC2 Instance (t3.small/medium)    │             │
│  │  ┌──────────────────────────────────┐  │             │
│  │  │  Next.js Frontend (Port 3000)    │  │             │
│  │  │  - Served via Nginx              │  │             │
│  │  └──────────────────────────────────┘  │             │
│  │  ┌──────────────────────────────────┐  │             │
│  │  │  MedusaJS Backend (Port 9000)    │  │             │
│  │  │  - API + Admin                   │  │             │
│  │  └──────────────────────────────────┘  │             │
│  │  ┌──────────────────────────────────┐  │             │
│  │  │  Redis (Port 6379)               │  │             │
│  │  └──────────────────────────────────┘  │             │
│  └────────────────────────────────────────┘             │
│               ↓                                          │
│  ┌────────────────────────────────────────┐             │
│  │    RDS PostgreSQL (db.t3.micro)        │             │
│  │    - Main database                     │             │
│  └────────────────────────────────────────┘             │
│               ↓                                          │
│  ┌────────────────────────────────────────┐             │
│  │    S3 Bucket (Images/Files)            │             │
│  └────────────────────────────────────────┘             │
│               ↓                                          │
│  ┌────────────────────────────────────────┐             │
│  │    CloudFront CDN (Optional)           │             │
│  │    - Caches static assets globally     │             │
│  └────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
         ↕
    🌍 Users (Slower for distant users)
```

---

## Cost Breakdown: All-AWS Setup

### **Monthly Costs:**

```
✅ EC2 t3.medium (4GB RAM - needed for both apps):
   $0.042/hour × 720 hours = $30/month

✅ RDS db.t3.micro (Database):
   $0.017/hour × 720 hours = $12/month
   + Storage 20GB: $2.30/month
   = $14.30/month

✅ S3 Storage (50GB):
   $0.023 × 50GB = $1.15/month

✅ Data Transfer OUT (100GB/month):
   First 100GB = FREE

✅ Elastic IP (static IP):
   $3.65/month (if instance runs 24/7)

✅ CloudFront CDN (Optional):
   $2-5/month for small traffic

─────────────────────────────────
TOTAL: ~$48-53/month
```

**VS**

```
🎯 AWS Backend + Vercel Frontend:
   EC2 t3.small: $15/month (less RAM needed)
   RDS: $14/month
   S3: $1/month
   Vercel: FREE
   ─────────────────
   TOTAL: ~$30/month
```

💡 **Vercel setup saves you $18-23/month!**

---

## Setup Instructions: All-AWS

### **Step 1: Launch EC2 Instance**

```
Instance Type: t3.medium (2 vCPU, 4GB RAM)
Storage: 30GB GP3 SSD
Security Group:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
```

### **Step 2: Setup Backend**

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io nodejs npm nginx

# Clone repository
git clone https://github.com/your-repo/e-commerce-coderVai.git
cd e-commerce-coderVai

# Setup Backend
cd demo-clothing-store
npm install
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "medusa-backend" -- start
pm2 save
```

### **Step 3: Setup Frontend**

```bash
# Build frontend
cd ../demo-clothing-store-storefront
npm install

# Update .env.local
cat > .env.local << EOF
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
EOF

# Build for production
npm run build

# Start with PM2
pm2 start npm --name "storefront" -- start
pm2 save
```

### **Step 4: Setup Nginx Reverse Proxy**

```nginx
# /etc/nginx/sites-available/ecommerce
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /store/ {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Admin panel
    location /admin/ {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable and restart
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### **Step 5: Setup Redis**

```bash
# Run Redis in Docker
docker run -d --name redis \
  -p 6379:6379 \
  --restart unless-stopped \
  redis:alpine
```

---

## Pros & Cons: All-AWS

### ✅ **Pros:**
- Everything in one place
- Easier to manage (one server)
- Slightly cheaper upfront ($48 vs split services)
- Good for learning AWS

### ❌ **Cons:**
- **Single point of failure** - if EC2 crashes, everything is down
- **No global CDN** - users far from Mumbai get slow speeds
- **Limited scaling** - can't scale frontend separately from backend
- **More RAM needed** - t3.medium vs t3.small
- **Manual deployments** - no auto-deploy like Vercel
- **More maintenance** - you manage everything

---

## Performance Comparison

### **User in Bangladesh/India:**
```
All-AWS:     Fast (10-50ms)
AWS+Vercel:  Fast (10-50ms)
Winner: TIE ✅
```

### **User in USA:**
```
All-AWS:     Slow (200-500ms page load)
AWS+Vercel:  Fast (50-100ms page load)
Winner: AWS+Vercel ✅
```

### **User in Europe:**
```
All-AWS:     Slow (300-600ms page load)
AWS+Vercel:  Fast (40-80ms page load)
Winner: AWS+Vercel ✅
```

### **Traffic Spike (1000 users at once):**
```
All-AWS:     May crash or slow down
AWS+Vercel:  Handles automatically
Winner: AWS+Vercel ✅
```

---

## When to Use All-AWS:

✅ **Only serving local market** (India/Bangladesh only)
✅ **Learning AWS** (want full control)
✅ **Need custom server config**
✅ **Budget is tight** and traffic is predictable

## When to Use AWS + Vercel:

✅ **Serving global customers**
✅ **Want easy deployments** (git push = deploy)
✅ **Need auto-scaling** for traffic spikes
✅ **Want best performance** worldwide
✅ **Don't want to manage frontend server**

---

## Recommended: Hybrid Approach

```
Development:
  - Local PostgreSQL + Redis (FREE)
  - Local backend + frontend
  - Fast iteration

Staging:
  - AWS EC2 (all-in-one) - $30/month
  - Test everything
  
Production:
  - AWS RDS + EC2 backend
  - Vercel frontend (FREE)
  - Best performance + cost
```



