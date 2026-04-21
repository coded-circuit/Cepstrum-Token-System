# CEPSTRUM Farewell 2026 - Digital Dining Pass System

A modern, secure digital token system designed for event management and guest authentication at the CEPSTRUM-EEE Farewell Party 2026. This application replaces traditional paper-based dining passes with a dynamic QR code verification system.

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black)
![React](https://img.shields.io/badge/React-19.2.4-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use Cases](#use-cases)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [User Flows](#user-flows)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

The CEPSTRUM Dining Pass System is a full-stack web application that streamlines the guest check-in process for farewell events. It provides:

- **Guests**: A beautiful, mobile-first digital pass with dynamic QR codes
- **Scanner Operators**: A professional scanning interface with real-time verification
- **Administrators**: A secure dashboard for managing guests and monitoring attendance

The system handles 200+ guests with automatic duplicate prevention, meal preference tracking, and live statistics.

---

## ✨ Features

### Guest Portal

- 🔐 Triple-factor identity verification (Roll Number + Email + Date of Birth)
- 🎫 Dynamic QR codes that refresh every 20 seconds
- 🎉 Automatic celebration screen after successful check-in
- 📱 Fully responsive mobile-first design
- 🎈 Animated party-themed UI with floating balloons

### Scanner Interface

- 📷 Real-time QR code scanning using device camera
- 🟢 Instant verification with guest profile display
- 🍽️ Integrated meal preference selection (Veg/Non-Veg)
- 🔄 Auto-resume scanning after each verification
- 📊 Color-coded status indicators (Success/Already Dined/Unauthorized)

### Admin Dashboard

- 🔒 JWT-protected authentication with bcrypt password hashing
- 📈 Real-time attendance statistics
- 🔍 Advanced guest search (Name, Branch, Roll Number, Email)
- ✏️ Manual guest creation and status override
- 🗑️ Guest management capabilities
- 📊 Meal preference tracking (Veg/Non-Veg counts)

---

## 💡 Use Cases

### Primary Use Case: Event Dining Management

**Scenario**: A college farewell party with 200+ attendees

**Problem**:

- Long queues at dining entrance
- Paper passes can be copied or shared
- No real-time attendance tracking
- Difficulty managing meal preferences
- Duplicate entries and fraud

**Solution**:

1. Pre-register all guests in the database
2. Each guest receives a unique link to their digital pass
3. Dynamic QR codes prevent screenshot sharing (20s refresh)
4. Scanner operators verify guests in <2 seconds
5. Automatic duplicate prevention
6. Real-time admin dashboard monitors attendance

### Secondary Use Cases

- **Corporate Events**: Employee check-in at company gatherings
- **Conference Management**: Attendee verification at sessions
- **Wedding Receptions**: Guest authentication and meal tracking
- **Membership Events**: Exclusive club entry management

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 16.2.4** - React framework with App Router
- **React 19.2.4** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **html5-qrcode** - Camera-based QR scanning
- **qrcode.react** - QR code generation
- **crypto-js** - HMAC signature generation

### Backend

- **Next.js API Routes** - Serverless functions
- **MongoDB 9.5.0 (Mongoose)** - Database and ODM
- **MongoDB Atlas** - Cloud database hosting
- **bcryptjs** - Password hashing
- **jose** - JWT token generation and verification

### Security

- **JWT Authentication** - Admin session management
- **HMAC-SHA256** - QR code signature verification
- **Time-based Validation** - 30-second QR expiry
- **Middleware Protection** - Route-level access control

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                           │
├──────────────┬──────────────────┬───────────────────────────┤
│  Guest Portal│  Scanner Interface│   Admin Dashboard         │
│  /pass       │  /scanner         │   /admin                  │
│              │                   │                           │
│  • QR Display│  • Camera Scan    │   • Statistics            │
│  • Identity  │  • Verification   │   • Guest Management      │
│    Verify    │  • Food Select    │   • Search & Override     │
└──────┬───────┴────────┬──────────┴───────────┬───────────────┘
       │                │                       │
       └────────────────┼───────────────────────┘
                        │
                   API Routes
                        │
       ┌────────────────┼───────────────────────┐
       │                │                       │
  ┌────▼────┐    ┌─────▼─────┐    ┌────────────▼────┐
  │ /api/   │    │ /api/     │    │ /api/           │
  │ guest   │    │ verify    │    │ admin           │
  │         │    │           │    │                 │
  │ • Verify│    │ • QR      │    │ • Stats         │
  │   Identity│  │   Verify  │    │ • Search        │
  │ • Get   │    │ • Food    │    │ • Create        │
  │   Details│  │   Update  │    │ • Update/Delete │
  └────┬────┘    └─────┬─────┘    └────────┬────────┘
       │               │                    │
       └───────────────┼────────────────────┘
                       │
                 ┌─────▼──────┐
                 │  MongoDB    │
                 │  Atlas      │
                 │             │
                 │ • Guests    │
                 │ • Admins    │
                 └─────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cepstrum-dining
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ADMIN_PASSCODE=your-admin-backup-passcode
   ```

4. **Create admin user**

   ```bash
   npm run create-admin
   ```

   Default credentials:
   - Username: `admin`
   - Password: `cepstrum2026`

   ⚠️ **Change the password after first login!**

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
cepstrum-dining/
├── app/
│   ├── admin/
│   │   ├── login/page.js          # Admin login page
│   │   └── page.js                 # Admin dashboard
│   ├── api/
│   │   ├── admin/
│   │   │   ├── guests/route.js     # Guest CRUD operations
│   │   │   ├── guests/[id]/route.js # Individual guest management
│   │   │   ├── logout/route.js     # Admin logout
│   │   │   ├── stats/route.js      # Dashboard statistics
│   │   │   └── bulk-add/route.js   # Bulk guest import
│   │   ├── auth/login/route.js     # Admin authentication
│   │   ├── guest/
│   │   │   ├── verify-identity/route.js # Guest verification
│   │   │   ├── [id]/route.js       # Guest details
│   │   │   └── update-food/route.js # Meal preference update
│   │   └── verify/route.js         # QR code verification
│   ├── pass/
│   │   ├── page.js                 # Guest identity verification
│   │   └── [id]/page.js            # QR code display page
│   ├── scanner/page.js             # QR scanner interface
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── lib/
│   └── mongodb.js                  # Database connection
├── models/
│   ├── Admin.js                    # Admin schema
│   └── Guest.js                    # Guest schema
├── scripts/
│   └── create-admin.js             # Admin user creation script
├── middleware.js                   # Route protection middleware
├── .env                           # Environment variables (not in git)
├── package.json
└── README.md
```

---

## 🔒 Security Features

### 1. Dynamic QR Codes

- Refresh every 20 seconds
- 30-second validity window
- HMAC-SHA256 signature prevents tampering
- Timestamp validation prevents screenshot replay

### 2. Guest Authentication

- Triple-factor verification (Roll + Email + DOB)
- Unique secret key per guest
- One-time use enforcement (`isDined` flag)

### 3. Admin Protection

- JWT-based session management
- Bcrypt password hashing (10 rounds)
- HTTP-only cookies prevent XSS
- Middleware protects all admin routes
- 12-hour token expiry

### 4. Database Security

- MongoDB Atlas with IP whitelisting
- Connection string in environment variables
- Indexed fields for query performance
- Lean queries to reduce memory usage

---

## 🔄 User Flows

### Guest Journey

```
1. Receive unique link → /pass
2. Enter credentials (Roll + Email + DOB)
3. System verifies identity
4. Redirected to /pass/[id]
5. View dynamic QR code (20s refresh)
6. Show QR to scanner operator
7. Automatic redirect to celebration screen
8. See confirmation with meal preference
```

### Scanner Operator Journey

```
1. Open /scanner
2. Camera activates automatically
3. Scan guest QR code
4. System verifies in <2 seconds
5. Display results:
   - First time: Show profile + food selector
   - Already dined: Show orange warning
   - Invalid: Show red error
6. Auto-resume for next scan
```

### Admin Journey

```
1. Login at /admin/login
2. Access dashboard at /admin
3. View real-time statistics
4. Search guests by name/branch/roll/email
5. Override attendance status if needed
6. Create new guests manually
7. Monitor Veg/Non-Veg counts
8. Logout via "Terminate Session"
```

---

## 📡 API Documentation

### Guest APIs

#### `POST /api/guest/verify-identity`

Verify guest identity before showing QR code

```json
Request: { rollNumber, email, dateOfBirth }
Response: { success, guestId, name, branch, year, isDined }
```

#### `GET /api/guest/[id]`

Fetch guest details for QR generation

```json
Response: { success, guest: { _id, name, secretKey, isDined, ... } }
```

#### `POST /api/guest/update-food`

Update meal preference after scan

```json
Request: { guestId, foodPreference: 'veg' | 'non-veg' }
Response: { success, message, guest }
```

#### `POST /api/verify`

Verify QR code signature and mark attendance

```json
Request: { id, timestamp, signature }
Response: { success, message, requiresFoodSelection, guest }
```

### Admin APIs

#### `POST /api/auth/login`

Admin authentication

```json
Request: { username, password }
Response: Sets admin_token cookie
```

#### `GET /api/admin/stats`

Dashboard statistics

```json
Response: { success, stats: { total, dined, pending, vegCount, nonVegCount } }
```

#### `GET /api/admin/guests?search=query`

Search guests

```json
Response: { guests: [...] }
```

#### `POST /api/admin/guests`

Create new guest

```json
Request: { name, branch, year, rollNumber, email, dateOfBirth }
Response: { success, message, guest }
```

#### `PUT /api/admin/guests/[id]`

Update guest status

```json
Request: { isDined: boolean }
Response: { success, message, guest }
```

#### `DELETE /api/admin/guests/[id]`

Delete guest

```json
Response: { success, message }
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

```env
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<generate-a-strong-random-string>
ADMIN_PASSCODE=<strong-backup-passcode>
NODE_ENV=production
```

### Database Setup

1. Create MongoDB Atlas cluster
2. Whitelist Vercel IP addresses (or 0.0.0.0/0 for all IPs)
3. Create database user with read/write permissions
4. Get connection string and add to environment variables

### Performance Considerations

- MongoDB connection pooling is enabled
- API routes are serverless (auto-scale)
- Static assets are CDN-cached
- Consider adding rate limiting for production

---

## 🚧 Future Enhancements

### Planned Features

- [ ] Bulk CSV import for guest registration
- [ ] Email notifications with QR code links
- [ ] Real-time WebSocket updates for scanner
- [ ] Export attendance data to Excel/CSV
- [ ] Multi-event support
- [ ] SMS-based verification fallback
- [ ] Offline mode for scanner
- [ ] Analytics dashboard with charts
- [ ] Photo verification at check-in
- [ ] Mobile app version (React Native)

### Performance Improvements

- [ ] Redis caching for frequently accessed data
- [ ] CDN for static assets
- [ ] Image optimization for guest photos
- [ ] Database query optimization
- [ ] Rate limiting on API endpoints

---

## 📊 Data Model

### Guest Schema

```javascript
{
  name: String (required),
  branch: String (required),
  year: String (required),
  rollNumber: String (required, unique, indexed),
  email: String (required, unique, indexed),
  dateOfBirth: Date (required),
  secretKey: String (required), // Cryptographic key for QR signing
  isDined: Boolean (default: false, indexed),
  foodPreference: String (enum: ['veg', 'non-veg', null]),
  scannedAt: Date
}
```

### Admin Schema

```javascript
{
  username: String (required, unique),
  password: String (required) // Bcrypt hashed
}
```

---

## 🤝 Contributing

This is a private project for CEPSTRUM-EEE. For questions or support, contact the development team.

---

## 📄 License

Private project - All rights reserved.

---

## 📞 Support

For technical issues or questions:

- Check the [Issues](link-to-issues) page
- Contact the CEPSTRUM technical team

---

## 🎉 Acknowledgments

- **CEPSTRUM-EEE** for the opportunity to build this system
- **Next.js Team** for the amazing framework
- **MongoDB** for reliable cloud database hosting
- **Open Source Community** for the libraries and tools used

---

**Built with ❤️ for CEPSTRUM Farewell 2026**
