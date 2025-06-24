# Acute Algo Frontend

This is the frontend application for Acute Algo, built with Next.js and TypeScript.

## Environment Configuration

For proper local and production authentication, create a `.env.local` file in the frontend directory:

```bash
# Frontend Environment Variables (.env.local)

# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Frontend Site URL (used for OAuth callbacks)
# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production example:
# NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

**Important Notes:**
- Variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser
- `NEXT_PUBLIC_SITE_URL` is crucial for OAuth callback URL generation
- For production, set `NEXT_PUBLIC_SITE_URL` to your actual domain

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication Flow

The application uses GitHub OAuth for authentication:

1. User clicks "Login with GitHub"
2. System generates callback URL using `NEXT_PUBLIC_SITE_URL` or `window.location.origin`
3. User is redirected to GitHub OAuth
4. GitHub redirects back to `/auth/callback` with authorization code
5. Frontend exchanges code for user session via backend API

## Debugging Authentication

Use the built-in debug utilities:

```javascript
// In browser console
import { authDebug } from '@/lib/auth-debug';
authDebug.debugAuthFlow(); // Complete auth flow debug
authDebug.checkEnvironment(); // Check environment variables
authDebug.checkTokenStatus(); // Check stored tokens
```

## Build

To build for production:

```bash
npm run build
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
