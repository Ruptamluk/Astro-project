# Quick Start Guide - Astrology Web App

## What You Just Built

A full-stack astrology application with:
- **Frontend**: Next.js with OTP-based authentication, calendar DOB picker, and personalized predictions
- **Backend**: FastAPI with MongoDB integration, OTP management, and zodiac predictions
- **Features**: Email/Phone login, OTP verification, zodiac sign calculation, lucky number/color, compatibility info

## Running the App (5 Minutes)

### Terminal 1: Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

Backend runs on: `http://localhost:8000`

### Terminal 2: Start Frontend

```bash
pnpm install
pnpm dev
```

Frontend runs on: `http://localhost:3000`

## How to Use (Demo Mode)

1. **Open** http://localhost:3000
2. **Login/Register**: Enter any email or phone number
3. **OTP**: Check the backend console for the generated OTP (it's logged there in demo mode)
4. **Verify**: Enter the OTP from console
5. **Select DOB**: Pick your date of birth from the calendar
6. **See Prediction**: Get your zodiac sign, prediction, lucky number, lucky color, and compatibility

## Example Demo Flow

```
Email: john@example.com
OTP: (check backend console - will show: "OTP for john@example.com: 123456")
Enter: 123456
Select: May 15, 1995
Get: Leo zodiac with full prediction
```

## Key Files

### Frontend
- `app/page.tsx` - Login & Register UI with OTP flow
- `app/dob-selection/page.tsx` - Calendar picker and date submission
- `app/prediction/page.tsx` - Prediction display with zodiac info
- `app/globals.css` - Dark cosmic theme with purple/pink colors

### Backend
- `backend/main.py` - FastAPI app and CORS setup
- `backend/routes/auth.py` - OTP request/verify, user management
- `backend/routes/predictions.py` - DOB submission, prediction calculation
- `backend/utils.py` - Zodiac calculation, OTP generation, dummy predictions

## Next Steps

### To Use Real Email/SMS

1. **Email Setup**
   - Get Gmail app password (enable 2FA first)
   - Update `backend/.env`:
     ```
     SMTP_HOST=smtp.gmail.com
     SENDER_EMAIL=your-email@gmail.com
     SENDER_PASSWORD=your-app-password
     ```

2. **SMS Setup (Twilio)**
   - Create account at https://twilio.com
   - Get Account SID, Auth Token, Phone Number
   - Update `backend/.env`:
     ```
     TWILIO_ACCOUNT_SID=xxx
     TWILIO_AUTH_TOKEN=xxx
     TWILIO_PHONE_NUMBER=+1xxx
     ```

### To Use Real MongoDB

1. **Create MongoDB Atlas Cluster** at https://mongodb.com/cloud/atlas
2. **Get Connection String**
3. **Update `backend/.env`**:
   ```
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/astrology
   ```

## API Examples

### Request OTP
```bash
curl -X POST http://localhost:8000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Verify OTP (Returns user ID)
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'
```

### Get Prediction
```bash
curl -X GET http://localhost:8000/api/predictions/get-prediction/user_id_here
```

## Zodiac Signs & Predictions

The app includes predictions for all 12 zodiac signs:
- Aries, Taurus, Gemini, Cancer, Leo, Virgo
- Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces

Each includes:
- Personalized prediction text
- Lucky color (with visual preview)
- Lucky number
- Compatible zodiac signs

## Browser Features Used

- localStorage for session management (user ID storage)
- Calendar component from shadcn/ui
- Form validation with React Hook Form
- Toast notifications with sonner
- Async/await for API calls
- Modern CSS with Tailwind + design tokens

## Customization Ideas

1. **Add More Predictions** - Edit `backend/utils.py` zodiac_predictions dict
2. **Change Colors** - Update color variables in `app/globals.css`
3. **Add Birth Time** - Extend DOB to include time for more detailed predictions
4. **Store History** - Save previous predictions to database
5. **Add Horoscope** - Create daily/weekly horoscope based on zodiac
6. **Share Predictions** - Add social sharing buttons
7. **Astrology Charts** - Display natal chart visualization

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend not starting | `pip install -r requirements.txt` and check Python version (3.8+) |
| Frontend won't connect | Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local` |
| MongoDB error | Verify connection string and IP whitelist (if using Atlas) |
| OTP not showing | Check backend terminal - it's logged in demo mode |
| Port already in use | Change port: `python main.py` → uvicorn port or `npm run dev -- -p 3001` |

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| UI Components | Shadcn/UI, Lucide Icons |
| State | localStorage, React Context |
| Backend | FastAPI, Python 3.8+ |
| Database | MongoDB with Motor (async) |
| Validation | Pydantic, Zod |
| Communications | Email (SMTP), SMS (Twilio), HTTP (REST) |

## Files Created

**Frontend** (9 files)
- app/page.tsx - Login/Register
- app/dob-selection/page.tsx - DOB Selection  
- app/prediction/page.tsx - Predictions
- app/context/AuthContext.tsx - Auth state
- app/globals.css - Cosmic theme
- .env.local.example - Frontend env
- SETUP.md - Detailed setup
- QUICKSTART.md - This file

**Backend** (8 files)
- backend/main.py - FastAPI server
- backend/models.py - Data models
- backend/utils.py - Utilities
- backend/routes/auth.py - Auth API
- backend/routes/predictions.py - Prediction API
- backend/requirements.txt - Dependencies
- backend/.env.example - Backend env

## Support Resources

- FastAPI Docs: http://localhost:8000/docs
- Next.js Docs: https://nextjs.org
- MongoDB Docs: https://docs.mongodb.com
- Shadcn/UI: https://ui.shadcn.com

Happy building! May the stars guide you forward. ✨
