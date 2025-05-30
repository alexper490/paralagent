# Paralagent Setup & Troubleshooting Guide

## 🔧 OpenAI API Key Setup

### Step 1: Create .env.local File

In your project root directory (same level as package.json), create a file named `.env.local`:

```bash
# Windows Command Prompt
echo REACT_APP_OPENAI_API_KEY=your-actual-api-key-here > .env.local

# Or create manually with notepad
notepad .env.local
```

### Step 2: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-`)
6. Paste it in your `.env.local` file

### Step 3: Format Your .env.local File

Your `.env.local` file should look exactly like this:

```env
REACT_APP_OPENAI_API_KEY=sk-your-actual-key-here
```

**Important:**
- No spaces around the `=`
- No quotes around the key
- The key should start with `sk-`
- Save the file in the root directory

### Step 4: Restart the Development Server

After creating/updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

## 🚨 Common Issues & Solutions

### Issue 1: "API key is not configured"
**Solution:** 
- Check if `.env.local` exists in the root directory
- Verify the key starts with `sk-`
- Restart the development server

### Issue 2: "Invalid API key" (401 Error)
**Solutions:**
- Verify your API key is correct
- Check if you have billing set up on OpenAI
- Ensure your API key has the correct permissions

### Issue 3: "Rate limit exceeded" (429 Error)
**Solutions:**
- Wait a few minutes and try again
- Check your OpenAI usage limits
- Upgrade your OpenAI plan if needed

### Issue 4: "Bad request" (400 Error)
**Solutions:**
- The model name might be incorrect
- Check if you have access to GPT-4 models
- Try using `gpt-3.5-turbo` instead

### Issue 5: CORS or Network Errors
**Solutions:**
- Check your internet connection
- Verify firewall/antivirus isn't blocking the request
- Try using a VPN if in a restricted region

## 🔍 Debugging Steps

### Check API Key in Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try generating a document
4. Look for these log messages:
   - "Making API request to OpenAI..."
   - "API Key present: true"
   - "API Key starts with: sk-..."

### Test API Key Manually

You can test your API key with curl:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Check File Structure

Your project should look like this:
```
paralagent/
├── .env.local          ← Your API key file
├── package.json
├── src/
├── public/
└── README.md
```

## 🔄 Alternative Solutions

### Option 1: Use Different Model

If GPT-4 doesn't work, try GPT-3.5:

In `src/Dashboard.js`, change line ~165:
```javascript
model: 'gpt-3.5-turbo',  // Instead of 'gpt-4o-mini'
```

### Option 2: Check OpenAI Account Status

1. Visit [OpenAI Usage](https://platform.openai.com/usage)
2. Verify you have available credits
3. Check if your account is in good standing

### Option 3: Billing Setup

1. Go to [OpenAI Billing](https://platform.openai.com/account/billing)
2. Add a payment method
3. Set up usage limits

## 📞 Getting Help

If you're still having issues:

1. **Check the browser console** for detailed error messages
2. **Verify your .env.local file** exists and has the correct format
3. **Test your API key** using the curl command above
4. **Check OpenAI status** at [status.openai.com](https://status.openai.com)

## 🔐 Security Notes

- Never commit your `.env.local` file to git
- Don't share your API key publicly
- In production, use a backend API to handle OpenAI requests
- Monitor your API usage regularly 