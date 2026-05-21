# FormPilot

Modern SaaS form builder platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

Create forms, collect responses, manage submissions, and analyze form activity through a clean modern dashboard.

---

## Live Demo

https://form-pilot-omega.vercel.app/

---

# Preview

## Dashboard
- Workspace overview
- Form analytics
- Response tracking
- Completion statistics
- Recent submissions

## Features
- Authentication system
- Form creation
- Form management
- Response collection
- Dashboard analytics
- Responsive UI
- Protected routes
- Modern SaaS design

---

# Tech Stack

| Technology | Usage |
|---|---|
| Next.js 14 | Full-stack framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Prisma | ORM |
| PostgreSQL | Database |
| NextAuth/Auth.js | Authentication |
| Vercel | Deployment |
| Lucide React | Icons |

---

# Features

## Authentication
- Secure login/signup
- Session handling
- Protected dashboard routes

## Dashboard
- Workspace analytics
- Form statistics
- Recent responses
- Activity overview

## Form Management
- Create forms
- Edit forms
- Delete forms
- Manage responses

## Responses
- Collect user submissions
- View recent responses
- Track completion rates

## UI/UX
- Modern SaaS dashboard
- Dark mode interface
- Responsive layout
- Clean card system
- Sidebar navigation

---

# Folder Structure

```bash
app/
components/
lib/
prisma/
public/
types/
```

---

# Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/KavyaManoj123/FormPilot.git
```

---

## 2. Navigate Into Project

```bash
cd FormPilot
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Setup Environment Variables

Create `.env` file:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

## 5. Prisma Setup

```bash
npx prisma generate
npx prisma db push
```

---

## 6. Run Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# Production Build

```bash
npm run build
```

---

# Deployment

Deployed using Vercel.

## Deploy Steps

1. Push code to GitHub
2. Import repository into Vercel
3. Add environment variables
4. Deploy

---

# Current Modules

- Dashboard
- Authentication
- Form listing
- Response analytics
- Sidebar navigation
- Workspace overview

---

# Upcoming Features

- Drag-and-drop form builder
- Public form sharing
- AI-generated forms
- CSV export
- Stripe subscriptions
- Team collaboration
- Charts & analytics
- Email notifications

---

# Screenshots

## Dashboard UI

(Add your screenshots here)

---

# Learnings From This Project

- Full-stack application architecture
- Type-safe API handling
- Prisma database modeling
- Authentication flow
- SaaS dashboard design
- Deployment workflow
- Production environment handling

---

# Author

Kavya Manoj

GitHub:
https://github.com/KavyaManoj123

---

# License

MIT License
