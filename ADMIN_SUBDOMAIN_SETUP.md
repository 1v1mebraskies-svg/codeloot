# Admin Subdomain Setup Guide

## Overview
Move the CodeLoot admin panel to `admin.codeloot.codes` for a secure, separate CMS interface.

## DNS Configuration

### Step 1: Add DNS Record
In your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.), add a CNAME record:

```
Type: CNAME
Name: admin
Value: codeloot.codes
TTL: 3600 (or default)
Proxy Status: DNS only (not proxied) for direct server access
```

### Step 2: Wait for DNS Propagation
DNS changes typically take 5-30 minutes to propagate globally. You can check with:
```bash
dig admin.codeloot.codes
# or
nslookup admin.codeloot.codes
```

## Server Configuration

### Option A: Nginx (Recommended)
If using Nginx as your web server, add this configuration:

```nginx
server {
    listen 80;
    server_name admin.codeloot.codes;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.codeloot.codes;
    
    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/ssl/certs/admin.codeloot.codes.crt;
    ssl_certificate_key /etc/ssl/private/admin.codeloot.codes.key;
    
    # Proxy to Python CMS server
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option B: Apache
If using Apache, add this virtual host:

```apache
<VirtualHost *:80>
    ServerName admin.codeloot.codes
    Redirect permanent / https://admin.codeloot.codes/
</VirtualHost>

<VirtualHost *:443>
    ServerName admin.codeloot.codes
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/admin.codeloot.codes.crt
    SSLCertificateKeyFile /etc/ssl/private/admin.codeloot.codes.key
    
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

### Option C: Direct Python Server (Development Only)
For development, you can run the server to listen on all interfaces:

```python
# In server.py, change:
server = HTTPServer(('localhost', port), CMSHandler)
# To:
server = HTTPServer(('0.0.0.0', port), CMSHandler)
```

Then configure your DNS to point directly to your server's IP.

## SSL/TLS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d admin.codeloot.codes

# Auto-renewal is configured automatically
```

## Security Considerations

1. **IP Whitelist**: Restrict admin access to specific IPs in Nginx/Apache config
2. **Rate Limiting**: Add rate limiting to prevent brute force attacks
3. **HTTPS Only**: Always use HTTPS for admin panel
4. **Strong Passwords**: The admin panel uses `ADMIN_PASSWORD` and `SENSITIVE_PASSWORD` in admin.js - change these

## Testing

1. **DNS Resolution**: Check that admin.codeloot.codes resolves to your server
2. **HTTP Access**: Test http://admin.codeloot.codes redirects to HTTPS
3. **Admin Login**: Test login at https://admin.codeloot.codes/admin/login.html
4. **CMS Connection**: Verify the admin panel connects to the CMS server

## Current Admin Credentials

From `admin/admin.js`:
- Admin Password: `AdminPass`
- Sensitive Action Password: `Jeff@`

**IMPORTANT**: Change these passwords in production!

## Firewall Configuration

Ensure port 3000 is accessible locally but not exposed publicly:

```bash
# Allow local access only
sudo ufw allow from 127.0.0.1 to any port 3000
# Or block external access to port 3000
sudo ufw deny 3000
```

## Process Management

### Using Systemd (Recommended)

Create `/etc/systemd/system/codeloot-cms.service`:

```ini
[Unit]
Description=CodeLoot CMS Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/codeloot
ExecStart=/usr/bin/python3 /var/www/codeloot/server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable codeloot-cms
sudo systemctl start codeloot-cms
sudo systemctl status codeloot-cms
```

## Verification Checklist

- [ ] DNS CNAME record created for admin.codeloot.codes
- [ ] DNS propagated (check with dig/nslookup)
- [ ] Nginx/Apache configured to proxy to port 3000
- [ ] SSL certificate installed and valid
- [ ] HTTP redirects to HTTPS
- [ ] Admin login works at https://admin.codeloot.codes/admin/login.html
- [ ] CMS connection successful
- [ ] All 21 games visible in admin dashboard
- [ ] Edit/delete functionality works
- [ ] Save & Publish updates live site
- [ ] Firewall configured correctly
- [ ] Service auto-restart configured
- [ ] Admin passwords changed from defaults
