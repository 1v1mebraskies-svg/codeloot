# DNS Troubleshooting for admin.codeloot.codes

## Current Status: ❌ NOT RESOLVING

The DNS record for `admin.codeloot.codes` is currently returning NXDOMAIN (not found).

## Immediate Troubleshooting Steps

### 1. Check Where You Added the Record

DNS records must be added at your **DNS hosting provider**, not necessarily your domain registrar.

**Common DNS Providers:**
- Cloudflare (most common)
- Namecheap
- GoDaddy
- Google Domains
- AWS Route 53
- DigitalOcean

**To find your DNS provider:**
```bash
# Check nameservers
dig NS codeloot.codes
```

### 2. Verify Record Details

The record should be:
```
Type: CNAME
Name: admin
Value: codeloot.codes
TTL: 3600 (or default)
```

**Common Mistakes:**
- ❌ Using A record instead of CNAME
- ❌ Setting value to an IP address
- ❌ Setting name to "admin.codeloot.codes" (should just be "admin")
- ❌ Adding record at wrong domain level

### 3. Check DNS Propagation

DNS changes take 5-30 minutes to propagate, but can take up to 48 hours.

**Check propagation status:**
```bash
# Check from multiple DNS servers
dig admin.codeloot.codes @8.8.8.8
dig admin.codeloot.codes @1.1.1.1
dig admin.codeloot.codes @ns1.cloudflare.com
```

**Online tools:**
- https://dnschecker.org/#A/admin.codeloot.codes
- https://www.whatsmydns.net/

### 4. Cloudflare-Specific Issues

If using Cloudflare:

**Check Proxy Status:**
- The record should be set to **DNS only** (grey cloud), not Proxied (orange cloud)
- Proxied records won't work for direct server access

**Check Zone:**
- Make sure you're in the correct zone (codeloot.codes)
- Some users have multiple zones

**Check SSL/TLS Mode:**
- Set to "Full" or "Full (strict)" for admin subdomain

### 5. Registrar vs DNS Host

Your domain might be registered at one company but hosted at another.

**Example:**
- Domain registered at Namecheap
- DNS hosted at Cloudflare

**You must add the record at the DNS host (Cloudflare), not the registrar (Namecheap).**

### 6. Verify Nameservers

Make sure your domain's nameservers point to your DNS host:

```bash
# Check current nameservers
dig NS codeloot.codes
```

If nameservers don't match your DNS host, update them at your domain registrar.

## Quick Fix Checklist

- [ ] Record added at correct DNS provider (not registrar)
- [ ] Record type is CNAME
- [ ] Record name is "admin" (not "admin.codeloot.codes")
- [ ] Record value is "codeloot.codes"
- [ ] Record is not proxied (if using Cloudflare)
- [ ] Waited at least 15 minutes for propagation
- [ ] Checked with multiple DNS resolvers
- [ ] Nameservers point to correct DNS host

## Alternative: Use A Record Instead

If CNAME isn't working, try an A record pointing to your server's IP:

```
Type: A
Name: admin
Value: YOUR_SERVER_IP_ADDRESS
TTL: 3600
```

To find your server IP:
```bash
# If server is on same machine
curl ifconfig.me

# Or check your hosting provider's dashboard
```

## Test After Changes

After making changes, test resolution:

```bash
# Test locally
dig admin.codeloot.codes

# Test from Google DNS
dig admin.codeloot.codes @8.8.8.8

# Test from Cloudflare DNS
dig admin.codeloot.codes @1.1.1.1
```

When it resolves, you should see:
```
admin.codeloot.codes.  IN  CNAME  codeloot.codes.
```

## Next Steps Once DNS Resolves

1. Configure Nginx/Apache to handle admin.codeloot.codes
2. Set up SSL certificate
3. Test admin panel at https://admin.codeloot.codes/admin/login.html

## Need Help?

Reply with:
1. Which DNS provider you're using
2. Screenshot of your DNS records
3. Output of `dig NS codeloot.codes`
