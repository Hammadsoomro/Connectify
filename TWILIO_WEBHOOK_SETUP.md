# Twilio Webhook Setup Guide

## SMS Receiving Issue Fix

Your SMS messages are being sent but not received because Twilio needs to know where to send incoming messages.

### Steps to Fix:

1. **Go to Twilio Console**: https://console.twilio.com/
2. **Navigate to Phone Numbers**: Go to "Phone Numbers" > "Manage" > "Active numbers"
3. **For each of your phone numbers** (+19032705603, +16138017161, +15878573620):
   - Click on the phone number
   - Scroll down to "Messaging" section
   - Set the webhook URL to: `https://connectlify.netlify.app/api/twilio/webhook`
   - Set HTTP method to: `POST`
   - Click "Save"

### Webhook URL for your app:

```
https://connectlify.netlify.app/api/twilio/webhook
```

### What this does:

- When someone sends an SMS to your Twilio numbers, Twilio will send the message data to your webhook
- Your app will receive it and save it to the database
- The message will appear in your conversations

### Updated Credentials:

- **Account SID**: ACa19a1c169dc473fe2ba11051dd0c1ecd ✅
- **Auth Token**: 7fbf78b51deeef2851eb936e53c28316 ✅ (Updated)

### Recent Fixes Applied:

1. ✅ **Real Twilio Balance**: Now shows actual balance from Twilio API instead of demo $42.50
2. ✅ **Multi-Country Numbers**: Buy Numbers page now shows numbers from US, Canada, UK, Australia, Germany, France
3. ✅ **Loading States**: Fixed app hanging by adding proper loading states and error handling
4. ✅ **Error Handling**: Better error messages when Twilio API fails

### Test the fixes:

1. Update webhook URLs in Twilio Console (above)
2. Send a test SMS to one of your numbers
3. Check if it appears in your Conversations page
4. Verify Twilio balance shows correctly in navbar
5. Check Buy Numbers page shows numbers from different countries

### If still having issues:

- Check Netlify function logs for any errors
- Verify webhook URL is accessible: https://connectlify.netlify.app/api/twilio/webhook
- Make sure environment variables are set correctly in Netlify
