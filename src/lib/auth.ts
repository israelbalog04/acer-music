import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔍 NextAuth authorize called with:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              church: true
            }
          });

          if (!user) {
            console.log('❌ User not found:', credentials.email);
            throw new Error('EMAIL_NOT_FOUND');
          }

          console.log('✅ User found:', user.email, user.role);

          // Vérifier si l'utilisateur est approuvé par l'admin (sauf SUPER_ADMIN)
          if (!user.isApproved && user.role !== 'SUPER_ADMIN') {
            console.log('❌ User not approved by admin:', credentials.email);
            throw new Error('USER_NOT_APPROVED');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔑 Password check:', isPasswordValid ? 'VALID' : 'INVALID');

          if (!isPasswordValid) {
            console.log('❌ Invalid password for:', credentials.email);
            throw new Error('INVALID_PASSWORD');
          }

          console.log('✅ Auth successful, returning user:', credentials.email);

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            instruments: user.instruments ? JSON.parse(user.instruments) : [],
            avatar: user.avatar,
            churchId: user.churchId,
            churchName: user.church?.name,
            churchCity: user.church?.city,
            isApproved: user.isApproved,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          if (error instanceof Error) {
            if (error.message === 'USER_NOT_APPROVED') {
              throw error;
            } else if (error.message === 'EMAIL_NOT_FOUND') {
              throw error;
            } else if (error.message === 'INVALID_PASSWORD') {
              throw error;
            }
          }
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.instruments = user.instruments;
        token.avatar = user.avatar;
        token.churchId = user.churchId;
        token.churchName = user.churchName;
        token.churchCity = user.churchCity;
        token.isApproved = user.isApproved;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.instruments = token.instruments;
        session.user.avatar = token.avatar;
        session.user.churchId = token.churchId;
        session.user.churchName = token.churchName;
        session.user.churchCity = token.churchCity;
        session.user.isApproved = token.isApproved;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};