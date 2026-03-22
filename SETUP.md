# Astrology Web App - Setup Guide

## Project Structure

```
project/
├── app/                    # Next.js frontend (JavaScript)
│   ├── page.tsx           # Login & Register page
│   ├── dob-selection/     # Date of birth selection page
│   ├── prediction/        # Prediction display page
│   ├── context/           # React context for auth
│   └── globals.css        # Global styles with cosmic theme
└── backend/               # FastAPI backend (Python)
    ├── main.py           # Main FastAPI application
    ├── models.py         # Pydantic data models
    ├── utils.py          # Utility functions
    ├── routes/
    │   ├── auth.py       # Authentication endpoints
    │   └── predictions.py # Prediction endpoints
    ├── requirements.txt  # Python dependencies
    └── .env.example      # Environment variables template
```

## Setup Instructions

### 1. Backend Setup (Python + FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# - MongoDB Atlas connection string
# - Email (SMTP) configuration
# - Twilio configuration (SMS)
```

### 2. Start the Backend

```bash
cd backend
python main.py

# Or with uvicorn:
uvicorn main:app --reload --port 8000
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup (Next.js + JavaScript)

```bash
# In the root project directory
cp .env.local.example .env.local

# Edit .env.local if needed (backend URL defaults to localhost:8000)
```

### 4. Install Frontend Dependencies

```bash
# pnpm (recommended)
pnpm install

# or npm
npm install
```

### 5. Start the Frontend

```bash
pnpm dev
# or
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features

### Authentication Flow
1. **OTP Request** - User enters email or phone number
2. **OTP Verification** - User receives OTP (logged to console in demo mode)
3. **Auto User Creation** - User account created automatically on first login
4. **Session Management** - User ID stored in localStorage

### Date of Birth Selection
- Calendar picker to select DOB
- Date validation (must be in the past)
- Zodiac sign calculation

### Prediction Display
- Zodiac sign with emoji symbol
- Personalized prediction text
- Lucky color (with color preview)
- Lucky number
- Zodiac compatibility information

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend (.env)
```
# MongoDB
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/astrology

# Email (Optional - Demo mode logs OTP to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password

# Twilio SMS (Optional - Demo mode logs OTP to console)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Backend
BACKEND_URL=http://localhost:8000
```

## MongoDB Setup

### Using MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `MONGODB_URL` in `.env`

### Using Local MongoDB
```bash
# Install MongoDB locally
# Update MONGODB_URL in .env:
MONGODB_URL=mongodb://localhost:27017/astrology
```

## OTP Configuration

### Demo Mode (Default)
OTPs are logged to the backend console. No external service needed.

### Email Configuration (Optional)
Requires Gmail or other SMTP service:
1. Enable 2FA on Gmail
2. Create an App Password
3. Set `SENDER_EMAIL` and `SENDER_PASSWORD` in `.env`

### SMS Configuration (Optional)
Requires Twilio account:
1. Create a Twilio account at https://www.twilio.com
2. Get Account SID, Auth Token, and Phone Number
3. Set Twilio credentials in `.env`

## API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP for email or phone
- `POST /api/auth/verify-otp` - Verify OTP and create/login user
- `GET /api/auth/user/{user_id}` - Get user details

### Predictions
- `POST /api/predictions/submit-dob/{user_id}` - Submit DOB and get prediction
- `GET /api/predictions/get-prediction/{user_id}` - Get stored prediction

## Example API Usage

### Request OTP
```bash
curl -X POST http://localhost:8000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'
```

### Submit DOB
```bash
curl -X POST http://localhost:8000/api/predictions/submit-dob/user_id \
  -H "Content-Type: application/json" \
  -d '{"dob": "1995-05-15"}'
```

## Troubleshooting

### Backend not connecting to MongoDB
- Check MongoDB URL in `.env`
- Ensure IP whitelist includes your machine (for MongoDB Atlas)
- Check database name matches your MongoDB setup

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_BACKEND_URL` is correct
- CORS is enabled in FastAPI backend

### OTP not sending
- In demo mode, check backend console for OTP logs
- For email: Check SMTP credentials
- For SMS: Check Twilio credentials

## Building for Production

### Frontend
```bash
npm run build
npm run start
```

### Backend
```bash
# Set environment to production
export NODE_ENV=production

# Run with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Technologies Used

### Frontend
- Next.js 16 (JavaScript/TypeScript)
- React 19
- Tailwind CSS 4
- Shadcn/UI Components
- React Hook Form
- Zod (validation)
- Date-fns (date utilities)

### Backend
- FastAPI (Python)
- MongoDB with Motor (async)
- Pydantic (data validation)
- Twilio (SMS)
- aiosmtplib (Email)
- Python-jose (JWT)
- Passlib (Password hashing)

## Support

For issues or questions:
1. Check the logs in both terminal windows
2. Verify environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check network connectivity between frontend and backend

Enjoy discovering your cosmic destiny! ✨
