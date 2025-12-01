# My SecureChat - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- Git installed
- PostgreSQL database (or Supabase account)

---

## 📥 Clone Repository

### Office Laptop Setup:
```bash
cd "path/to/your/projects"
git clone https://github.com/tsrcnc/my-securechat.git
cd my-securechat
```

### Home Laptop Setup:
```bash
cd "path/to/your/projects"
git clone https://github.com/tsrcnc/my-securechat.git
cd my-securechat
```

---

## 🔧 Installation

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Install Backend Dependencies
```bash
cd ../backend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Setup
```bash
cd backend
copy .env.example .env
```

Edit `.env` file with your credentials:
- Database URL (Supabase or local PostgreSQL)
- JWT secrets
- Razorpay keys (later)
- Other API keys

---

## 🗄️ Database Setup

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

---

## 🏃 Running the Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:5000

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

---

## 🔄 Daily Workflow (Office ↔ Home)

### 🏢 End of Day (Office):
```bash
git add .
git commit -m "Today's work completed"
git push
```

### 🏠 Start of Day (Home):
```bash
git pull
```

### 🏠 End of Day (Home):
```bash
git add .
git commit -m "Evening work done"
git push
```

### 🏢 Next Morning (Office):
```bash
git pull
```

---

## 📁 Project Structure

```
my-securechat/
├── frontend/              # Next.js app
│   ├── app/              # Pages and layouts
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── package.json
├── backend/              # Express.js API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── models/       # Data models
│   │   └── middleware/   # Middleware
│   ├── prisma/           # Database schema
│   └── package.json
├── docs/                 # Documentation
└── README.md
```

---

## 🆘 Common Issues

### Issue: Git not found
**Solution:** Restart terminal after Git installation

### Issue: npm not working
**Solution:** Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Issue: Port already in use
**Solution:** 
- Frontend: Change port in `package.json` dev script
- Backend: Change PORT in `.env` file

---

## 📞 Need Help?

Contact: seetharaman@tsrcnc.com
