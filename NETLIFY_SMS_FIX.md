# 🚨 Fix SMS on Netlify - Critical Issues

## Problem: SMS not working on Netlify deployment

## ✅ Step-by-Step Fix Guide

### 1. **Set Environment Variables in Netlify**

Go to your Netlify dashboard → **Site Settings** → **Environment Variables**

Add these **EXACT** variables:

```
TWILIO_SID=ACa19a1c169dc473fe2ba11051dd0c1ecd
TWILIO_AUTH_TOKEN=7687160b0c02e0526f1296c7f4c7b2c4
DB_URL=mongodb+srv://Hammad:Soomro@connectify.fvitf7a.mongodb.net/?retryWrites=true&w=majority&appName=Connectify
JWT_SECRET=your-super-secure-jwt-secret-for-production
NODE_ENV=production
```

**❗ IMPORTANT:** After adding variables, **REDEPLOY** your site.

---

### 2. **Update Twilio Webhook URLs**

**Your Netlify app URL:** `https://your-app-name.netlify.app`

For **EACH** phone number (+19032705603, +16138017161, +15878573620):

1. Go to [Twilio Console](https://console.twilio.com)
2. **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on your phone number
4. In **Messaging** section:
   - **Webhook URL:** `https://your-app-name.netlify.app/api/twilio/webhook`
   - **HTTP Method:** `POST`
5. **Save Configuration**

---

### 3. **Debug SMS Sending Issues**

**Check Netlify Function Logs:**

1. Netlify Dashboard → **Functions** tab
2. Click on **api** function
3. Check logs for errors

**Common Error Solutions:**

#### Error: "Twilio credentials not configured"

```bash
# In Netlify Environment Variables, ensure:
TWILIO_SID=ACa19a1c169dc473fe2ba11051dd0c1ecd
TWILIO_AUTH_TOKEN=7687160b0c02e0526f1296c7f4c7b2c4
```

#### Error: "Database connection failed"

```bash
# In Netlify Environment Variables, ensure:
DB_URL=mongodb+srv://Hammad:Soomro@connectify.fvitf7a.mongodb.net/?retryWrites=true&w=majority&appName=Connectify
```

#### Error: "Phone number not found"

```bash
# Your phone numbers might not be in the database
# Run this to re-seed them (see step 4)
```

---

### 4. **Re-seed Your Data (If Needed)**

If your phone numbers or wallet aren't working, create these API calls:

**Test if your API is working:**

```javascript
// In browser console on your Netlify app:
fetch("/api/ping")
  .then((r) => r.json())
  .then(console.log);
```

**Check your phone numbers:**

```javascript
// In browser console (after logging in):
fetch("/api/phone-numbers", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
})
  .then((r) => r.json())
  .then(console.log);
```

---

### 5. **Test SMS Functionality**

#### Test 1: Send SMS

1. Login to your app
2. Go to Conversations
3. Select a contact
4. Send a message
5. Check browser console for errors

#### Test 2: Receive SMS

1. Send SMS to one of your numbers: +19032705603
2. Check if it appears in conversations
3. If not, check Netlify function logs

---

### 6. **Quick Troubleshooting Commands**

**For Browser Console (F12):**

```javascript
// Check if you're logged in
localStorage.getItem("authToken");

// Test API connection
fetch("/api/ping")
  .then((r) => r.text())
  .then(console.log);

// Check phone numbers
fetch("/api/phone-numbers", {
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
})
  .then((r) => r.json())
  .then(console.log);

// Check wallet
fetch("/api/wallet", {
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
})
  .then((r) => r.json())
  .then(console.log);
```

---

### 7. **Exact Webhook URLs for Your Numbers**

Replace `your-app-name` with your actual Netlify app name:

**For +19032705603:**

- Webhook: `https://your-app-name.netlify.app/api/twilio/webhook`

**For +16138017161:**

- Webhook: `https://your-app-name.netlify.app/api/twilio/webhook`

**For +15878573620:**

- Webhook: `https://your-app-name.netlify.app/api/twilio/webhook`

---

### 8. **If Still Not Working**

**Check these in order:**

1. ✅ Environment variables set in Netlify
2. ✅ Site redeployed after setting variables
3. ✅ Twilio webhook URLs updated
4. ✅ Phone numbers exist in database
5. ✅ Wallet has balance
6. ✅ Netlify function logs show no errors

**Get help by sharing:**

- Your Netlify app URL
- Screenshot of environment variables (hide sensitive values)
- Netlify function logs
- Browser console errors

---

## 🔧 Quick Fix Commands

**If you can access your deployed app:**

1. Open browser console (F12)
2. Run these commands to diagnose:

```javascript
// Check API
fetch("/api/ping");

// Check auth
console.log("Token:", localStorage.getItem("authToken"));

// Test SMS endpoint
fetch("/api/sms/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
  body: JSON.stringify({
    contactId: "test",
    content: "test message",
    fromNumber: "+19032705603",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

## 🚨 URGENT STEPS:

1. **Set environment variables in Netlify**
2. **Redeploy your site**
3. **Update Twilio webhooks**
4. **Test SMS sending**

Your SMS should work after these steps!
