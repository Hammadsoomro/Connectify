# Netlify Deployment Guide

## 🚀 Deploy to Netlify

### 1. Environment Variables

You need to set these environment variables in Netlify:

**Required for Backend/API:**

```
TWILIO_SID=ACa19a1c169dc473fe2ba11051dd0c1ecd
TWILIO_AUTH_TOKEN=1d2a06654b07036cdbca45f0e1ed3feb
DB_URL=mongodb+srv://Hammad:Soomro@connectify.fvitf7a.mongodb.net/?retryWrites=true&w=majority&appName=Connectify
JWT_SECRET=yourverysecretkey
NODE_ENV=production
PORT=8080
```

**Optional for Stripe Payment:**

```
STRIPE_SECRET_KEY=sk_test_51234567890abcdef...
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef...
```

### 2. Deployment Steps

#### Option A: Automatic Deployment (Recommended)

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**

   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your repository
   - Build settings should be automatically detected from `netlify.toml`

3. **Set Environment Variables:**
   - In Netlify dashboard → Site Settings → Environment Variables
   - Add all the environment variables listed above

#### Option B: Manual Deployment

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder to deploy

### 3. Post-Deployment Configuration

#### Update Twilio Webhook URL

After deployment, update your Twilio phone numbers with the new webhook URL:

1. Go to **Twilio Console** → **Phone Numbers** → **Active Numbers**
2. For each number (+19032705603, +16138017161, +15878573620):
   - Click the number
   - In **Messaging** section, set:
     - **Webhook URL:** `https://your-netlify-app.netlify.app/api/twilio/webhook`
     - **HTTP Method:** `POST`
   - Save configuration

#### Custom Domain (Optional)

1. In Netlify dashboard → Domain settings
2. Add your custom domain
3. Update Twilio webhook URLs to use your custom domain

### 4. Environment Variables Setup in Netlify

In your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add these variables:

| Variable                      | Value                                | Notes                            |
| ----------------------------- | ------------------------------------ | -------------------------------- |
| `TWILIO_SID`                  | `ACa19a1c169dc473fe2ba11051dd0c1ecd` | Your Twilio Account SID          |
| `TWILIO_AUTH_TOKEN`           | `1d2a06654b07036cdbca45f0e1ed3feb`   | Your Twilio Auth Token           |
| `DB_URL`                      | `mongodb+srv://Hammad:...`           | Your MongoDB connection string   |
| `JWT_SECRET`                  | `yourverysecretkey`                  | Change to a secure random string |
| `NODE_ENV`                    | `production`                         | Set to production mode           |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...`                        | For Stripe payments (optional)   |

### 5. Build Configuration

The app is configured with:

- **Build command:** `npm run build`
- **Publish directory:** `dist/spa`
- **Functions directory:** `netlify/functions`

### 6. Features Available After Deployment

✅ **Working Features:**

- User authentication (login/signup)
- SMS messaging with your 3 phone numbers
- Phone number purchasing
- Wallet management (demo mode)
- Real-time conversations
- Twilio integration
- Inbound SMS via webhooks

⚠️ **Manual Configuration Needed:**

- Twilio webhook URLs (update after deployment)
- Stripe configuration (if using real payments)

### 7. Testing Deployment

After deployment:

1. **Test login/signup** - Create a new account
2. **Test SMS sending** - Send a message to a contact
3. **Test inbound SMS** - Send SMS to your numbers from external phone
4. **Test wallet** - Add demo funds and make purchases
5. **Test phone purchase** - Buy a new number (if wallet has funds)

### 8. Troubleshooting

**Common Issues:**

- **Environment variables not working:** Check they're set in Netlify dashboard
- **Database connection fails:** Verify MongoDB connection string
- **SMS not working:** Check Twilio credentials and webhook URLs
- **Build failures:** Check Node.js version (should be 18+)

**Logs:**

- Check Netlify function logs in dashboard → Functions
- Check browser console for frontend errors

---

## 🔗 Quick Deploy

1. **Set environment variables in Netlify**
2. **Deploy:** `git push` or drag `dist` folder
3. **Update Twilio webhooks** with new URL
4. **Test all features**

Your app will be live at: `https://your-app-name.netlify.app`
