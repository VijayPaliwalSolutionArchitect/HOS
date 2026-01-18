# NextAuth v5 Authentication Guide

## Overview

This application uses NextAuth v5 (beta) for authentication with support for:
- Credentials (email/password)
- Google OAuth
- Session management with Prisma adapter
- JWT strategy with role and tenant claims

## Installation

```bash
npm install next-auth@beta @auth/prisma-adapter
```

## Configuration

### 1. Environment Variables

Add to `.env`:

```env
AUTH_SECRET="your-secret-key-here-min-32-chars"
AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate AUTH_SECRET:
```bash
openssl rand -base64 32
```

### 2. Create `auth.ts` at Project Root

```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { tenant: true },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tenantId = user.tenantId
      }
      
      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name
        token.email = session.email
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
      }
      return session
    },
  },
  
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
```

### 3. Create API Route Handler

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

### 4. Update TypeScript Types

Create `types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      tenantId: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    tenantId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    tenantId: string
  }
}
```

### 5. Create Middleware

Create `middleware.ts` at project root:

```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes
  const publicRoutes = ["/", "/login", "/register"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Require authentication
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Role-based access control
  const role = session.user.role

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Manager routes
  if (pathname.startsWith("/manager")) {
    if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

## Usage

### Server Components

```typescript
import { auth } from "@/auth"

export default async function Page() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return <div>Welcome {session.user.name}</div>
}
```

### Client Components

```typescript
"use client"

import { useSession } from "next-auth/react"

export default function Profile() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Not signed in</div>
  }

  return <div>Signed in as {session.user.email}</div>
}
```

### Sign In

```typescript
"use client"

import { signIn } from "next-auth/react"

export default function LoginForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      callbackUrl: "/dashboard",
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### Sign Out

```typescript
"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })}>
      Sign Out
    </button>
  )
}
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
6. Copy Client ID and Client Secret to `.env`

## Common Issues

### Issue: Session not persisting
**Solution**: Ensure `AUTH_SECRET` is set and consistent across restarts

### Issue: Callback URL mismatch
**Solution**: Check that `AUTH_URL` matches your deployment URL

### Issue: TypeScript errors on session.user
**Solution**: Ensure `next-auth.d.ts` types are properly configured

### Issue: Middleware redirect loop
**Solution**: Add API routes and static files to matcher exclusions

## Security Best Practices

1. **Always hash passwords**: Use bcrypt with salt rounds ≥ 10
2. **Secure AUTH_SECRET**: Generate strong random string
3. **HTTPS in production**: Always use HTTPS for OAuth callbacks
4. **Rate limiting**: Implement rate limiting on auth endpoints
5. **Session expiry**: Configure appropriate session max age
6. **CSRF protection**: NextAuth handles this automatically
7. **SQL injection**: Use Prisma parameterized queries

## Advanced Configuration

### Custom Session Duration

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  // ...
})
```

### Custom Sign In Page

```typescript
pages: {
  signIn: "/auth/login",
  signOut: "/auth/signout",
  error: "/auth/error",
  verifyRequest: "/auth/verify-request",
  newUser: "/auth/new-user",
}
```

### Email Verification

Add email provider and configure SMTP settings for email verification workflow.

## Migration from Mock Auth

If migrating from the mock auth system:

1. Install NextAuth dependencies
2. Create `auth.ts` configuration
3. Update all `getSession()` calls to use NextAuth
4. Replace localStorage-based auth with NextAuth hooks
5. Update middleware to use NextAuth middleware
6. Test all auth flows thoroughly

## Resources

- [NextAuth v5 Docs](https://authjs.dev/)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [OAuth Providers](https://authjs.dev/reference/providers/)
