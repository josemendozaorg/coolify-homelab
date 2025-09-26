# Coolify API with Cloudflare Access Setup Guide

## 🚨 Issue Detected

Your Coolify instance at `https://coolify.josemendoza.dev` is protected by **Cloudflare Access**, which is intercepting API calls and redirecting them to authentication. This prevents the API client from working directly.

## 📋 Solutions

### Option 1: Configure Cloudflare Access for API Access (Recommended)

1. **Go to Cloudflare Zero Trust Dashboard**
   - Navigate to https://one.dash.cloudflare.com/
   - Go to Access → Applications

2. **Find your Coolify application** (likely `coolify.josemendoza.dev`)

3. **Create a bypass rule for API endpoints:**
   - Edit the application
   - Add a new policy with these settings:
     - **Name**: "API Token Access"
     - **Action**: "Bypass"
     - **Include**:
       - Subdomain: `coolify.josemendoza.dev`
       - Path: `/api/*`
   - This will allow direct API access while keeping the web UI protected

### Option 2: Create Service Authentication

1. **Create a Service Token** in Cloudflare Access:
   - Go to Access → Service Authentication
   - Create a new token
   - Use it in API requests with `CF-Access-Client-Id` and `CF-Access-Client-Secret` headers

2. **Update the API client** to include these headers:
   ```typescript
   headers: {
     'Authorization': `Bearer ${apiToken}`,
     'CF-Access-Client-Id': 'your-service-token-id',
     'CF-Access-Client-Secret': 'your-service-token-secret',
     'Content-Type': 'application/json',
     'Accept': 'application/json'
   }
   ```

### Option 3: Direct Server Access

If you have direct access to the server where Coolify is running:

1. **Use the internal IP/hostname** instead of the public domain
2. **Update your config.ts** with something like:
   ```typescript
   baseUrl: 'http://localhost:8000', // or internal IP
   ```

### Option 4: VPN/Tunnel Access

Set up a VPN or SSH tunnel to access Coolify directly without going through Cloudflare Access.

## 🔧 Implementation for Option 1 (Recommended)

### Step 1: Update Cloudflare Access Policy

1. Login to Cloudflare Zero Trust Dashboard
2. Go to Access → Applications
3. Find your Coolify application
4. Add this policy:

```
Policy Name: API Bypass
Action: Bypass
Include:
  - Hostname: coolify.josemendoza.dev
  - Path: /api/*

Optional - Add IP restriction:
  - Include your homelab IP range for additional security
```

### Step 2: Test the API

After updating the policy, wait 1-2 minutes for propagation, then test:

```bash
curl -H "Authorization: Bearer " \
     https://coolify.josemendoza.dev/api/v1/health
```

### Step 3: Run our test again

```bash
npm run test-connection
```

## 🛡️ Security Considerations

- **Option 1** is most secure - only bypasses protection for API endpoints
- **Option 2** provides granular service access control
- **Option 3** requires network-level security
- **Option 4** adds VPN complexity but maintains full protection

## 🔍 Troubleshooting

### If API still doesn't work after Cloudflare changes:

1. **Check Coolify's internal API endpoint structure**
   - Some Coolify versions use different paths
   - Try `/api/v1/`, `/api/`, or check Coolify docs

2. **Verify API token permissions**
   - Ensure the token has the right scopes
   - Check token expiration

3. **Test with curl first**
   ```bash
   # Test health endpoint
   curl -v -H "Authorization: Bearer YOUR_TOKEN" https://coolify.josemendoza.dev/api/v1/health

   # Test projects endpoint
   curl -v -H "Authorization: Bearer YOUR_TOKEN" https://coolify.josemendoza.dev/api/v1/projects
   ```

## 📞 Need Help?

If you need assistance with any of these options, let me know:
1. Which option you'd prefer to implement
2. What level of access you have (Cloudflare admin, server access, etc.)
3. Any specific security requirements

The API client is ready to work once the authentication issue is resolved! 🚀