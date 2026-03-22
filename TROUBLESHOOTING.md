# Troubleshooting Guide

## Common Issues & Solutions

### Backend Issues

#### 1. Python Module Not Found: `fastapi`, `motor`, etc.
**Symptoms**: `ModuleNotFoundError: No module named 'fastapi'`

**Solutions**:
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt

# Check Python version (3.8+ required)
python --version
```

#### 2. Port 8000 Already in Use
**Symptoms**: `Address already in use` or `Port 8000 is already in use`

**Solutions**:
```bash
# Kill process using port 8000
# macOS/Linux:
lsof -i :8000
kill -9 <PID>

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change the port
uvicorn main:app --port 8001
```

#### 3. MongoDB Connection Error
**Symptoms**: 
```
ConnectionFailure: Could not connect to server
mongoserver.com:27017: [Errno ...]
```

**Solutions**:
```bash
# 1. Check connection string format
# Should be: mongodb+srv://user:pass@cluster.mongodb.net/astrology
MONGODB_URL=mongodb+srv://your_user:your_password@cluster.mongodb.net/astrology

# 2. For MongoDB Atlas - add IP to whitelist
# - Go to MongoDB Atlas > Network Access
# - Add your machine's IP (or 0.0.0.0 for testing)

# 3. Verify credentials
# - Check username/password spelling
# - Special characters need URL encoding (@=%40, :=%3A, etc)

# 4. Test connection
# Add this to main.py temporarily:
# try:
#     await db_client.admin.command('ping')
#     print("✓ MongoDB connected")
# except Exception as e:
#     print(f"✗ MongoDB error: {e}")
```

#### 4. CORS Error in Frontend
**Symptoms**: 
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions**:
```python
# Make sure CORS middleware is enabled in main.py:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For production, change allow_origins to your domain:
allow_origins=["https://yourdomain.com"]
```

#### 5. OTP Not Sending
**Symptoms**: 
```
Email sent but user doesn't receive it
SMS sent but user doesn't receive SMS
```

**Solutions**:

For Email:
```bash
# Check SMTP credentials in .env
SMTP_HOST=smtp.gmail.com
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password  # NOT your regular password!

# If using Gmail:
# 1. Enable 2-Step Verification
# 2. Create App Password (not regular password)
# 3. Use App Password in SENDER_PASSWORD

# Test email sending:
# Check backend console - in demo mode, OTP is logged there
```

For SMS:
```bash
# Check Twilio credentials in .env
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Verify phone number format:
# Should be in E.164 format: +1 followed by country code and number
# Example: +12015550100

# Check Twilio account balance (SMS costs money!)
```

In Demo Mode:
```
# OTPs are logged to console instead of being sent
# Check backend terminal window for output like:
# "[Demo Mode] OTP for user@example.com: 123456"
```

#### 6. Database Collections Not Created
**Symptoms**: 
```
pymongo.errors.OperationFailure: No collection found
```

**Solutions**:
```python
# MongoDB creates collections automatically
# But you can manually create them:

# In MongoDB Atlas UI or mongosh:
use astrology
db.createCollection("users")
db.createCollection("otps")

# Add indexes for performance:
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "phone": 1 })
db.otps.createIndex({ "email": 1 })
db.otps.createIndex({ "phone": 1 })
db.otps.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 })
```

---

### Frontend Issues

#### 1. Node Modules Not Installed
**Symptoms**: 
```
Error: Cannot find module 'next'
```

**Solutions**:
```bash
# Install dependencies
pnpm install
# or
npm install

# Clear and reinstall if corrupted
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. Port 3000 Already in Use
**Symptoms**: 
```
Port 3000 is already in use
```

**Solutions**:
```bash
# Kill process
# macOS/Linux:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
pnpm dev -- -p 3001
```

#### 3. Backend URL Not Found
**Symptoms**: 
```
Failed to fetch http://localhost:8000/api/auth/request-otp
```

**Solutions**:
```bash
# 1. Make sure backend is running
# Check terminal - should see "✓ Connected to MongoDB"

# 2. Check .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# 3. Test URL in browser
# Visit http://localhost:8000/docs
# Should see FastAPI Swagger UI

# 4. Check CORS headers
# Look for Access-Control-Allow-Origin in response headers
```

#### 4. localStorage Errors
**Symptoms**: 
```
QuotaExceededError: localStorage is full
```

**Solutions**:
```javascript
// Clear localStorage
localStorage.clear()

// Or remove specific items
localStorage.removeItem('userId')
localStorage.removeItem('prediction')

// Check localStorage size
Object.keys(localStorage).forEach(key => {
  console.log(`${key}: ${localStorage[key].length} bytes`)
})
```

#### 5. Calendar Not Appearing
**Symptoms**: 
```
Calendar component not showing
TypeError: Calendar is not defined
```

**Solutions**:
```bash
# Make sure components are imported correctly in page.tsx
import { Calendar } from '@/components/ui/calendar'

# Check that component exists
ls -la app/components/ui/calendar.tsx

# Rebuild if needed
pnpm build
```

#### 6. Styles Not Applying
**Symptoms**: 
```
Components look plain/no colors
```

**Solutions**:
```bash
# Check Tailwind CSS is processing
# app/globals.css should be imported in layout.tsx

# Rebuild CSS
rm -rf .next
pnpm dev

# Clear browser cache
# Ctrl+Shift+Delete or Cmd+Shift+Delete

# Check color variables in globals.css
# Cosmic theme should have dark backgrounds
```

#### 7. OTP Input Not Working
**Symptoms**: 
```
Can't type in OTP field
OTP field won't accept numbers
```

**Solutions**:
```tsx
// Make sure input is set correctly
<Input
  type="text"  // Should be text, not number for formatting
  placeholder="Enter 6-digit OTP"
  value={otp}
  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
  maxLength={6}
  className="text-center text-2xl tracking-widest"
/>

// Make sure maxLength is set to 6
```

---

### Networking Issues

#### 1. Fetch Fails with Network Error
**Symptoms**: 
```
Failed to fetch (ERR_FAILED)
Error: ECONNREFUSED 127.0.0.1:8000
```

**Solutions**:
```bash
# 1. Check if backend is running
# Terminal should show: "Uvicorn running on http://0.0.0.0:8000"

# 2. Verify localhost vs 127.0.0.1
# Both should work, but use localhost in URLs

# 3. Check firewall
# Make sure ports 3000 and 8000 are not blocked

# 4. Test connection
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

#### 2. HTTPS/Mixed Content Error
**Symptoms**: 
```
Mixed Content: blocked loading http://localhost from https://...
```

**Solutions**:
```bash
# For development, use http for both frontend and backend
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# For production, use https for both
# NEXT_PUBLIC_BACKEND_URL=https://api.example.com

# Ensure both use same protocol
```

---

### Data Issues

#### 1. User Can't Login (Invalid OTP)
**Symptoms**: 
```
"Invalid OTP" error after entering correct OTP
```

**Solutions**:
```bash
# 1. Check OTP hasn't expired (10 minute timeout)
# Get new OTP

# 2. Verify exact OTP from console
# Copy-paste exact number, don't retype

# 3. Check email/phone matches
# Must use same email/phone for request and verify

# 4. Debug in database
# Check otps collection to verify OTP is stored
```

#### 2. User Data Not Saving
**Symptoms**: 
```
User logged in but data doesn't persist
```

**Solutions**:
```bash
# 1. Check localStorage is enabled in browser
# Some private/incognito mode disables it

# 2. Verify userId is being stored
# Open DevTools > Application > localStorage
# Should have userId key

# 3. Check MongoDB user document exists
# Query MongoDB for created users

# 4. Check update query in backend
# Make sure user update is awaited
```

#### 3. Prediction Always Shows Same Data
**Symptoms**: 
```
Different zodiac signs showing same prediction
```

**Solutions**:
```bash
# Check zodiac calculation in utils.py
# Verify date ranges are correct

# Test with different months:
# Aries: 3/21 - 4/19
# Taurus: 4/20 - 5/20
# Gemini: 5/21 - 6/20
# (etc)

# Debug in backend:
# Add print statement to show calculated sign
# print(f"[v0] Calculated zodiac: {zodiac_sign}")
```

---

### Performance Issues

#### 1. App Loads Slowly
**Symptoms**: 
```
First page load takes > 5 seconds
```

**Solutions**:
```bash
# Check network tab in DevTools
# Identify slow requests

# Frontend optimization:
pnpm build  # Build for production speed

# Backend optimization:
# Make sure MongoDB indexes exist
# Check API response times with console.log
```

#### 2. Backend Slow After First Request
**Symptoms**: 
```
First OTP request fast, second request slow
```

**Solutions**:
```python
# This is often MongoDB warm-up
# First connection is slower
# Subsequent requests should be fast

# Check for blocking operations:
# All db operations should use await
# No time.sleep() in async functions
```

---

### Browser Compatibility

#### 1. Works in Chrome but not Firefox
**Symptoms**: 
```
Features work in Chrome, broken in Firefox
```

**Solutions**:
Check for:
- localStorage availability
- CSS variable support (use fallbacks)
- Async/await support
- Fetch API support

#### 2. Mobile doesn't display correctly
**Symptoms**: 
```
Layout broken on mobile devices
```

**Solutions**:
```tsx
// Check responsive classes in Tailwind
<div className="flex flex-col md:flex-row">  // Mobile first
<div className="w-full md:w-1/2">            // Full on mobile

// Test in DevTools mobile view
// Make sure touch targets are >= 44px
```

---

### Production Issues

#### 1. Environment Variables Not Loaded
**Symptoms**: 
```
MONGODB_URL is undefined
```

**Solutions**:
```bash
# Make sure .env file is in root of backend directory
# Check variable names match exactly

# Vercel/Netlify: Add to project settings
# Railway/Heroku: Set via CLI or dashboard

# Restart app after adding env vars
```

#### 2. SSL Certificate Error
**Symptoms**: 
```
SSL: CERTIFICATE_VERIFY_FAILED
```

**Solutions**:
```bash
# For local development with self-signed cert:
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

# For production:
# Use trusted SSL cert from Let's Encrypt (free)
# Configure in reverse proxy (Nginx, etc)
```

---

## Debug Checklist

When something doesn't work:

- [ ] Check terminal output for errors
- [ ] Look at browser DevTools (Network, Console tabs)
- [ ] Verify all services are running (both frontend and backend)
- [ ] Check .env files have correct values
- [ ] Test API directly with curl
- [ ] Clear browser cache/localStorage
- [ ] Restart both frontend and backend servers
- [ ] Check MongoDB connection in Atlas
- [ ] Verify port numbers (3000 and 8000)
- [ ] Look for typos in variable names
- [ ] Check file permissions and ownership
- [ ] Verify Python/Node version requirements
- [ ] Test with different browser
- [ ] Try incognito/private mode
- [ ] Check internet connectivity

## Getting Help

### Backend Debugging
```python
# Add debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Log function calls
print("[v0] OTP Request:", email or phone)
print("[v0] Generated OTP:", otp)
print("[v0] Database update result:", result)
```

### Frontend Debugging
```javascript
// Log API calls
console.log("[v0] Requesting OTP for:", email)
console.log("[v0] API Response:", data)
console.log("[v0] localStorage items:", localStorage)

// Check network requests
// DevTools > Network tab > filter by "auth"
```

### Database Debugging
```javascript
// MongoDB Compass or Atlas UI
db.users.findOne({ email: "user@example.com" })
db.otps.find().sort({ created_at: -1 }).limit(5)
```

---

**Still stuck?** Try:
1. Reading error message carefully (usually tells you the problem)
2. Checking the corresponding section in this guide
3. Running services one at a time to isolate issue
4. Checking logs in all three places (frontend, backend, database)
5. Searching error message online with your technology names

Good luck! 🌟
