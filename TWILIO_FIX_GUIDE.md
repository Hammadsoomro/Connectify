# Twilio Balance Error & SMS Receiving Fix

## Issues to Fix:

1. **Twilio Balance showing "Error"** - Authentication issue
2. **SMS not being received** - Webhook URL not set correctly

## Step 1: Update Environment Variables

### Netlify Environment Variables:

Go to Netlify Dashboard → Your Site → Site settings → Environment variables

**Add/Update these variables:**

```
TWILIO_SID=ACa19a1c169dc473fe2ba11051dd0c1ecd
TWILIO_AUTH_TOKEN=7fbf78b51deeef2851eb936e53c28316
BASE_URL=https://connectlify.netlify.app
```

## Step 2: Test Twilio Connection

After updating environment variables, test the connection:

**Visit this URL in your browser:**

```
https://connectlify.netlify.app/api/debug/twilio
```

This will show:

- ✅ If credentials are working
- ✅ Your actual Twilio balance
- ✅ Your phone numbers
- ❌ Any authentication errors

## Step 3: Fix SMS Receiving

### Option A: Automatic Webhook Update

```
POST https://connectlify.netlify.app/api/debug/update-webhooks
Content-Type: application/json
Authorization: Bearer YOUR_AUTH_TOKEN

{
  "webhookUrl": "https://connectlify.netlify.app/api/twilio/webhook"
}
```

### Option B: Manual Twilio Console Setup

1. Go to https://console.twilio.com/
2. Navigate to "Phone Numbers" → "Manage" → "Active numbers"
3. For each phone number (+19032705603, +16138017161, +15878573620):
   - Click the phone number
   - In "Messaging" section:
   - Set "A message comes in" webhook to: `https://connectlify.netlify.app/api/twilio/webhook`
   - Set HTTP method to: `POST`
   - Click "Save"

## Step 4: Test Webhook

**Test if webhook is working:**

```
https://connectlify.netlify.app/api/debug/webhook
```

Should return: `{"success": true, "message": "Webhook endpoint is working"}`

## Step 5: Test SMS Flow

1. Send SMS TO one of your numbers from your personal phone
2. Check if it appears in Conversations page
3. Send SMS FROM your app to your personal phone
4. Verify both directions work

## Common Issues:

### Balance Shows "Error":

- Check environment variables are set correctly
- Ensure no extra spaces in AUTH_TOKEN
- Redeploy site after updating env vars

### SMS Not Received:

- Webhook URL must be exactly: `https://connectlify.netlify.app/api/twilio/webhook`
- Check Twilio Console → Phone Numbers → Each number's webhook URL
- Ensure webhook responds with 200 status

### Still Not Working:

1. Check Netlify function logs for errors
2. Verify credentials at: https://connectlify.netlify.app/api/debug/twilio
3. Test webhook at: https://connectlify.netlify.app/api/debug/webhook

## After Fixes:

- ✅ Twilio balance should show actual amount (e.g., "$15.37")
- ✅ SMS sent TO your numbers should appear in Conversations
- ✅ SMS sent FROM your app should be delivered
- ✅ No more "Error" in balance display
