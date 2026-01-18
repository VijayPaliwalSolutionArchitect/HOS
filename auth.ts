/**
 * NextAuth v5 Configuration
 * 
 * Multi-tenant authentication with:
 * - Credentials provider (email/password)
 * - Google OAuth provider
 * - Prisma adapter for session management
 * - JWT strategy with role & tenantId claims
 */

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }

        // Find user by email
        const user = await prisma.user.findFirst({
          where: { 
            email: credentials.email as string,
            isActive: true,
            deletedAt: null,
          },
          include: { tenant: true },
        })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        // Check if tenant is active
        if (!user.tenant.isActive) {
          throw new Error("Account suspended. Please contact support.")
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          throw new Error("Invalid email or password")
        }

        // Update last active timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        })

        // Return user data for JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          tenantId: user.tenantId,
        }
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user has a tenant
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: user.email },
          include: { tenant: true },
        })

        // If user doesn't exist, create in default tenant
        // In production, you'd have a proper tenant assignment flow
        if (!existingUser) {
          const defaultTenant = await prisma.tenant.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
          })

          if (!defaultTenant) {
            return false // No tenant available
          }

          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              tenantId: defaultTenant.id,
              role: "STUDENT",
              emailVerified: new Date(),
            },
          })
        }
      }

      return true
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tenantId = user.tenantId
      }
      
      // Handle session updates (e.g., profile changes)
      if (trigger === "update" && session) {
        token.name = session.name
        token.email = session.email
        token.image = session.image
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
  
  events: {
    async signIn({ user }) {
      // Log sign in event
      if (user.id && user.tenantId) {
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            action: "LOGIN",
            entity: "User",
            entityId: user.id,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        })
      }
    },
  },
})
