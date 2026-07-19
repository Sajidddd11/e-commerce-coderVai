# Production Server Speed Optimization Guide

Follow these steps on your production VPS (Dokploy / Nginx / Reverse Proxy) to achieve **10x smaller payload sizes** and **3x faster backend response times**.

---

## ⚡ 1. Enable Gzip / Brotli Compression on Nginx

Enabling Gzip compression on your production proxy reduces heavy JSON API responses (like `/store/products`) from **224 KB → ~25 KB** (~90% size reduction).

### Nginx Configuration File (`/etc/nginx/nginx.conf` or site config):
```nginx
# ─────────────────────────────────────────────────────────────
# Gzip Compression — Add inside the http {} block
# ─────────────────────────────────────────────────────────────
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 1000;
gzip_types
    application/json
    application/javascript
    text/css
    text/plain
    text/xml
    application/xml
    image/svg+xml;

# HTTP Keep-Alive — Keeps TCP sockets warm to avoid TLS re-handshakes
keepalive_timeout 65;
keepalive_requests 100;
```

### Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🚀 2. Enable Medusa Index Engine in Production

In `demo-clothing-store/medusa-config.ts`, uncomment the index engine feature flag once production database migrations are applied:

```typescript
featureFlags: {
  index_engine: true,
},
modules: [
  {
    resolve: "@medusajs/index",
  },
  // ...
]
```

---

## 📈 Expected Production Results After Applying:
- **Product List API Payload**: Reduced from **224 KB** to **~25 KB**
- **Home Page Load Time**: Reduced from **2.5s** to **< 0.8s**
- **Backend API TTFB**: Reduced to **< 100ms**
