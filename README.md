This is a modern dashboard application built with [Next.js](https://nextjs.org) and [Supabase](https://supabase.com) for authentication and backend services.

## Supabase Integration

This project is configured with Supabase for:

- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: User management and auth flows
- **Storage**: File uploads and management
- **API**: Auto-generated REST and GraphQL APIs

### Setup Supabase

1. Follow the detailed setup guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
2. Create a `.env.local` file with your Supabase credentials
3. Set up your database schema and Row Level Security policies

### Usage

```typescript
import { supabase, SupabaseService, authService } from '@lib/api'

// Database operations
const projects = await SupabaseService.select('projects')
const newProject = await SupabaseService.insert('projects', { title: 'New Project' })

// Authentication
await authService.signIn('user@example.com', 'password')
const user = await authService.getCurrentUser()
```

## 🔐 Authentication System

This project includes a complete authentication system with:

- **Beautiful Login Page** (`/login`) with modern UI design
- **Google OAuth Integration** with Supabase
- **Email/Password Authentication**
- **Protected Routes** with automatic redirects
- **Authentication State Management** with React hooks

### Authentication Features

- **Login Page**: Modern, responsive design with gradient backgrounds
- **Google OAuth**: One-click sign-in with Google
- **Email/Password**: Traditional authentication
- **Protected Dashboard**: Secure area for authenticated users
- **Auto-redirect**: Automatic redirects based on auth state
- **Auth Guards**: Route protection components

### Quick Start with Authentication

1. **Set up Supabase** (see `SUPABASE_SETUP.md`)
2. **Configure Google OAuth** (see `GOOGLE_OAUTH_SETUP.md`)
3. **Add environment variables**:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Visit `/login`** to test authentication
5. **Access `/dashboard`** after signing in

### Authentication Components

- `LoginPage` - Beautiful login interface
- `AuthGuard` - Route protection wrapper
- `AuthNav` - Navigation with auth state
- `useAuth` - Authentication React hook

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
