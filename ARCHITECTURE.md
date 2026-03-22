# Astrology App - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
├──────────────────────┬──────────────────────┬──────────────────┤
│   Login/Register     │  DOB Selection       │   Predictions    │
│   Page (page.tsx)    │  Page (dob-selection)│   Page (predict) │
│                      │                      │                  │
│  - Email/Phone input │  - Calendar picker   │  - Zodiac sign   │
│  - OTP verification  │  - Date validation   │  - Lucky color   │
│  - Auto signup       │  - Submit to backend │  - Lucky number  │
└──────────────────────┴──────────────────────┴──────────────────┘
                              ↓ ↑
                    localStorage (User ID)
                              ↓ ↑
            NEXT.JS FRONTEND (http://localhost:3000)
                              ↓ ↑
                         HTTP Fetch API
                     (CORS enabled, JSON)
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                            │
├─────────────────┬────────────────────────┬─────────────────────┤
│  AUTH ROUTES    │  PREDICTION ROUTES     │   UTILITIES         │
│                 │                        │                     │
│ - request-otp   │ - submit-dob           │ - OTP generation    │
│ - verify-otp    │ - get-prediction       │ - Zodiac calc       │
│ - user/{id}     │                        │ - Email/SMS sending │
│                 │                        │ - Predictions data  │
└─────────────────┴────────────────────────┴─────────────────────┘
                              ↓ ↑
                      PYDANTIC VALIDATION
                    (Models, Error Handling)
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                       MONGODB ATLAS                             │
├──────────────────────────┬─────────────────────────────────────┤
│  USERS COLLECTION        │  OTPS COLLECTION                    │
│                          │                                     │
│ - _id                    │ - _id                               │
│ - email                  │ - email / phone                     │
│ - phone                  │ - otp (6 digits)                    │
│ - dob                    │ - created_at                        │
│ - zodiac_sign            │ - expires_at (10 min)              │
│ - created_at             │ - verified (boolean)                │
└──────────────────────────┴─────────────────────────────────────┘
```

## User Authentication Flow

```
START
  │
  ├─→ User enters email/phone on login page
  │
  ├─→ REQUEST OTP
  │     ├─ Frontend POST /api/auth/request-otp
  │     ├─ Backend generates 6-digit OTP
  │     ├─ Stores in MongoDB otps collection
  │     ├─ Sends via Email/SMS (or logs to console in demo)
  │     └─ Returns otp_id to frontend
  │
  ├─→ User receives OTP (check console in demo mode)
  │
  ├─→ User enters OTP
  │
  ├─→ VERIFY OTP
  │     ├─ Frontend POST /api/auth/verify-otp
  │     ├─ Backend looks up OTP record
  │     ├─ Checks expiry (10 min)
  │     ├─ Matches entered OTP
  │     ├─ Marks OTP as verified
  │     ├─ Looks up or creates user
  │     └─ Returns user object with ID
  │
  ├─→ Frontend stores user ID in localStorage
  │
  ├─→ Frontend redirects to DOB Selection page
  │
END
```

## Date of Birth & Prediction Flow

```
START (User logged in, has userId)
  │
  ├─→ User navigates to DOB Selection page
  │
  ├─→ User picks date from calendar
  │
  ├─→ User clicks "Reveal My Prediction"
  │
  ├─→ SUBMIT DOB
  │     ├─ Frontend POST /api/predictions/submit-dob/{userId}
  │     ├─ Backend validates date (must be in past)
  │     ├─ Calculates zodiac sign from month/day
  │     ├─ Updates user record in MongoDB
  │     │   └─ Sets dob and zodiac_sign fields
  │     ├─ Looks up prediction data for zodiac sign
  │     │   ├─ Prediction text
  │     │   ├─ Lucky color
  │     │   ├─ Lucky number
  │     │   └─ Compatible signs
  │     └─ Returns full prediction object
  │
  ├─→ Frontend stores prediction in localStorage
  │
  ├─→ Frontend redirects to Prediction Display page
  │
  ├─→ Display shows:
  │     ├─ Zodiac symbol and name
  │     ├─ Personalized prediction
  │     ├─ Lucky color with preview
  │     ├─ Lucky number
  │     └─ Compatible zodiac signs
  │
  ├─→ User can:
  │     ├─ Logout (clears localStorage)
  │     └─ Select another date (goes back to calendar)
  │
END
```

## Zodiac Sign Calculation

```
INPUT: Birth Date (month, day)

PROCESS:
  ├─ Aries (3/21 - 4/19)
  ├─ Taurus (4/20 - 5/20)
  ├─ Gemini (5/21 - 6/20)
  ├─ Cancer (6/21 - 7/22)
  ├─ Leo (7/23 - 8/22)
  ├─ Virgo (8/23 - 9/22)
  ├─ Libra (9/23 - 10/22)
  ├─ Scorpio (10/23 - 11/21)
  ├─ Sagittarius (11/22 - 12/21)
  ├─ Capricorn (12/22 - 1/19)
  ├─ Aquarius (1/20 - 2/18)
  └─ Pisces (2/19 - 3/20)

OUTPUT: Zodiac Sign + Prediction Data
  ├─ Zodiac sign name
  ├─ Prediction text
  ├─ Lucky color
  ├─ Lucky number
  └─ Zodiac compatibility
```

## OTP System Lifecycle

```
GENERATION (frontend → backend)
  ├─ User requests OTP
  └─ Backend: Math.random() → 6-digit number

STORAGE (backend → MongoDB)
  ├─ Create OTP record with:
  │   ├─ email/phone (identifier)
  │   ├─ otp value
  │   ├─ created_at (current time)
  │   ├─ expires_at (current time + 10 min)
  │   └─ verified (false)
  └─ Store in otps collection

DELIVERY (backend → user)
  ├─ Email: Send via SMTP
  ├─ SMS: Send via Twilio
  └─ Demo: Log to console

VERIFICATION (user → backend → MongoDB)
  ├─ User enters OTP
  ├─ Backend finds most recent OTP for contact
  ├─ Checks if not expired (now <= expires_at)
  ├─ Checks if OTP matches
  ├─ Updates verified flag to true
  ├─ Looks up or creates user
  └─ Returns user object

CLEANUP (automatic)
  ├─ Old OTPs expire after 10 minutes
  ├─ Database query filters out expired OTPs
  └─ (Can add TTL index for auto-deletion)
```

## Data Models

### User Document
```javascript
{
  _id: ObjectId,
  email: "user@example.com",  // optional
  phone: "+1234567890",        // optional
  dob: "1995-05-15",           // optional, set after prediction
  zodiac_sign: "Taurus",       // optional, calculated from dob
  created_at: DateTime
}
```

### OTP Document
```javascript
{
  _id: ObjectId,
  email: "user@example.com",  // optional
  phone: "+1234567890",        // optional
  otp: "123456",              // 6 digits
  created_at: DateTime,       // when OTP was generated
  expires_at: DateTime,       // created_at + 10 minutes
  verified: false             // becomes true after verification
}
```

## API Flow Diagram

```
FRONTEND (Next.js)              BACKEND (FastAPI)           DATABASE (MongoDB)
═════════════════               ═════════════════           ═════════════════

[Login/Register Page]
        │
        ├─ POST /auth/request-otp ──→ Generate OTP ──→ Save to DB
        │                                │
        │                         Show OTP (console)
        │
        │ [User enters OTP]
        │
        ├─ POST /auth/verify-otp ──→ Validate OTP ──→ Fetch from DB
        │                                │
        │                         Find/Create User ──→ Save/Update DB
        │
        ├─ localStorage.setItem(userId)
        │
        │ Navigate to DOB page
        │
        │ [User selects date & submits]
        │
        ├─ POST /predictions/submit-dob ──→ Calculate Zodiac ──→ Update User
        │                                      │
        │                                Get Prediction Data
        │
        └─ Navigate to Prediction page
              (display cached data from localStorage)
```

## Component Hierarchy

```
<RootLayout>
  ├─ <AuthProvider>  (Context wrapper)
  │   ├─ <AuthPage>  (/ - Login/Register)
  │   │   ├─ <Tabs>
  │   │   │   ├─ Login Tab
  │   │   │   │   ├─ Email/Phone Toggle
  │   │   │   │   ├─ OTP Request Form
  │   │   │   │   └─ OTP Verify Form
  │   │   │   └─ Register Tab
  │   │   │       └─ (Same as Login)
  │   │   └─ Cosmic Background Effects
  │   │
  │   ├─ <DOBSelectionPage>  (/dob-selection)
  │   │   ├─ <Popover>
  │   │   │   └─ <Calendar>
  │   │   ├─ Selected Date Display
  │   │   └─ Submit Button
  │   │
  │   └─ <PredictionPage>  (/prediction)
  │       ├─ Zodiac Sign Header
  │       ├─ Prediction Card
  │       ├─ Lucky Attributes Grid
  │       │   ├─ Lucky Color
  │       │   └─ Lucky Number
  │       ├─ Compatibility Section
  │       └─ Action Buttons
  │
  └─ <Analytics>
```

## Error Handling Flow

```
User Action (e.g., request OTP)
        │
        ├─ Validation Error?
        │   ├─ YES → Toast Error + Stay on page
        │   └─ NO → Continue
        │
        ├─ API Error?
        │   ├─ YES → Toast Error + Log to console
        │   └─ NO → Continue
        │
        ├─ Network Error?
        │   ├─ YES → Toast Error + Retry option
        │   └─ NO → Continue
        │
        └─ Success → Navigate/Update UI
```

## State Management

```
LOCAL STORAGE (Persistent)
├─ userId: String (user._id from MongoDB)
└─ prediction: JSON object (cached prediction data)

COMPONENT STATE (React hooks)
├─ page.tsx
│   ├─ email, phone (form inputs)
│   ├─ loading (API loading state)
│   ├─ step (request vs verify)
│   └─ contactMethod (email vs phone)
│
├─ dob-selection/page.tsx
│   ├─ date (selected DOB)
│   └─ loading (API loading state)
│
└─ prediction/page.tsx
    ├─ prediction (from localStorage)
    └─ loading (data load state)

CONTEXT (React Context - not heavily used)
├─ AuthContext
│   ├─ user (User object)
│   ├─ isLoggedIn (boolean)
│   ├─ setUser (function)
│   └─ logout (function)
```

## Security Layers

```
Frontend
├─ Input validation (email format, phone pattern)
├─ OTP input masked/formatted
├─ localStorage for session (no sensitive data)
└─ HTTPS in production

Backend
├─ Pydantic validation (all inputs)
├─ Email/phone format validation
├─ OTP expiry checking
├─ CORS restrictions
├─ MongoDB credentials in env vars
└─ Async operations (no blocking)

Database
├─ Indexed queries (fast lookups)
├─ User credentials stored (will add hashing)
├─ OTP auto-expire (10 min TTL)
└─ Connection credentials from env vars
```

## Performance Considerations

```
Frontend Optimization
├─ Cached prediction in localStorage
├─ Prevent unnecessary re-renders (useCallback, useMemo)
├─ CSS variables for efficient theming
├─ Code splitting (page routes)
└─ Optimized images

Backend Optimization
├─ Async/await prevents blocking
├─ MongoDB indexes on email/phone
├─ Most recent OTP query optimized
├─ Cached predictions dictionary
└─ Stateless design (scalable)

Database Optimization
├─ Indexes on email field
├─ Indexes on phone field
├─ TTL index on expires_at (optional)
└─ Proper field types (string, datetime)
```

## Deployment Architecture

```
Production Setup

┌─────────────────────────────────────────────────────────┐
│                        CDN (Vercel)                     │
│              (Frontend - static assets)                 │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   Next.js Server (Vercel)              │
│            (Frontend with API routes optional)          │
└─────────────────────────────────────────────────────────┘
                              ↓
                         HTTPS / REST
                              ↓
┌─────────────────────────────────────────────────────────┐
│               FastAPI Server (Railway/Heroku)           │
│                    (Python Backend)                     │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   MongoDB Atlas (Cloud)                 │
│                    (Database - Managed)                 │
└─────────────────────────────────────────────────────────┘

External Services (Optional)
├─ Gmail/SMTP → Email OTP delivery
├─ Twilio → SMS OTP delivery
└─ Monitoring (Sentry/DataDog)
```

---

This architecture is designed to be:
- **Scalable**: Async backend, cloud database
- **Secure**: Input validation, env var config, CORS
- **Maintainable**: Clean separation, clear flow
- **Performant**: Caching, indexing, async operations
- **User-Friendly**: Intuitive UI, helpful feedback
