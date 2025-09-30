# MyBohra Dashboard

A modern, full-stack dashboard application built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Features

- **Authentication**: Google OAuth and email/password login
- **User Management**: Complete CRUD operations for users
- **Modern UI**: Clean, responsive design inspired by Todoist/ClickUp
- **Database Integration**: Supabase backend with automatic schema sync
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS
- **Icons**: Tabler Icons
- **State Management**: React Hooks

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mybohra-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**

   ```bash
   npm run setup:db
   ```

   Copy the generated SQL to your Supabase SQL Editor and run it.

5. **Generate TypeScript types and services**

   ```bash
   npm run entity:sync
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

The application uses Supabase for the backend. To set up the database:

1. **Get your Supabase credentials** from [Supabase Dashboard](https://supabase.com/dashboard)
2. **Run the setup command**: `npm run setup:db`
3. **Copy the SQL** to your Supabase SQL Editor
4. **Run the SQL** to create tables and policies
5. **Sync the schema**: `npm run entity:sync`

## 📁 Project Structure

```
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   └── users/             # User management pages
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   └── users/        # User management components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and configurations
│   │   ├── api/          # API services
│   │   ├── config/       # Configuration files
│   │   └── schema/       # Database schema definitions
│   └── types/            # TypeScript type definitions
├── scripts/               # Database and utility scripts
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run entity:sync` - Sync database schema and generate types
- `npm run entity:test` - Test entity system
- `npm run check:env` - Check environment variables
- `npm run setup:db` - Generate database setup SQL

## 🔐 Authentication

The application supports two authentication methods:

1. **Google OAuth** - Social login with Google
2. **Email/Password** - Traditional email and password authentication

Both methods are integrated with Supabase Auth and provide the same user experience.

## 👥 User Management

The dashboard includes a complete user management system:

- **List Users**: View all users with search and filtering
- **Create Users**: Add new users with role assignment
- **Edit Users**: Update user information and roles
- **Delete Users**: Remove users from the system

## 🎨 UI Components

The application uses a modern design system with:

- **Dashboard Layout**: Header, sidebar, and main content area
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Styling**: Clean, professional appearance
- **Interactive Elements**: Hover effects, transitions, and animations

## 🚀 Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service.

1. **Build the application**: `npm run build`
2. **Deploy to your platform**
3. **Set environment variables** in your hosting platform
4. **Your dashboard is ready!**

## 📝 License

This project is private and proprietary.

## 🤝 Support

For support or questions, please contact the development team.
