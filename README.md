# Frames of Wonder

A beautiful photo-sharing application where Arena and Amelie can upload and share moments captured with their point-and-shoot cameras. Built with love by Vlad.

## About

Frames of Wonder is a private photo gallery application designed for kids to explore photography and share the beauty they discover in the world. Each photo is a moment of wonder, captured through their eyes.

## Features

- 🔐 **Secure Authentication** - Email-based whitelist authentication with Google Sign-In
- 📸 **Image Upload** - Easy drag-and-drop image uploads with Cloudinary integration
- 🖼️ **Beautiful Gallery** - Masonry-style responsive gallery to showcase photos
- 👤 **Personalized Experience** - Custom greetings for each user
- 📱 **Mobile Responsive** - Optimized experience on all devices with drawer navigation
- 🎨 **Elegant Design** - Serif fonts and gradient accents for a premium feel

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started) - React framework with App Router
- [HeroUI v2](https://heroui.com/) - Beautiful React component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [Better Auth](https://www.better-auth.com/) - Modern authentication library
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Cloudinary](https://cloudinary.com/) - Image hosting and optimization
- [Supabase](https://supabase.com/) - PostgreSQL database
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and database
- A Cloudinary account
- Google OAuth credentials

### Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in your environment variables:

```env
# Database
DATABASE_URL="your-supabase-connection-string"
DIRECT_URL="your-supabase-direct-url"

# Auth
BETTER_AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Authorized Emails (comma-separated)
AUTHORIZED_EMAILS="email1@example.com,email2@example.com"
```

### Installation

Install dependencies:

```bash
npm install
```

Setup the database:

```bash
npx prisma db push
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

```bash
# Push schema changes to database
npx prisma db push

# Open Prisma Studio to view/edit data
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

## Deployment

This application is optimized for deployment on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy

Make sure to set up your database and configure all required environment variables before deploying.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).
