# My SecureChat

Domain-based enterprise messaging platform

## Project Structure

```
my-securechat/
├── frontend/          # Next.js frontend
├── backend/           # Express.js backend
├── docs/              # Documentation
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20+
- Git
- PostgreSQL (via Supabase)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tsrcnc/my-securechat.git
cd my-securechat
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Setup environment variables (see `.env.example` files)

4. Run development servers:
```bash
# Frontend (in frontend/)
npm run dev

# Backend (in backend/)
npm run dev
```

## Features

- ✅ Domain-based authentication
- ✅ Real-time messaging
- ✅ Group chats
- ✅ File sharing
- ✅ Subscription management

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** PostgreSQL (Supabase), Redis
- **Storage:** Cloudflare R2
- **Payment:** Razorpay

## License

Proprietary - © 2025 TSR CNC

## Contact

- Website: https://tsrcnc.com
- Email: seetharaman@tsrcnc.com
