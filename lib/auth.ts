import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { APIError } from "better-auth/api";

import { prisma } from "../lib/prisma";

// Get whitelist of allowed emails from environment variable
const ALLOWED_EMAILS = process.env.AUTHORIZED_EMAILS
  ? process.env.AUTHORIZED_EMAILS.split(",").map((email) =>
      email.trim().toLowerCase(),
    )
  : [];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 * 1000, // 5 minutes
    },
  },
  trustedOrigins:
    process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_APP_URL
      ? [process.env.NEXT_PUBLIC_APP_URL]
      : undefined,
  plugins: [
    admin()
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: any, ctx: any) => {
          console.log(`User creation attempt by: ${user.email}`);
          // Check if user's email is in the whitelist before creating user in database
          if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
            console.log(`Unauthorized user creation attempt by: ${user.email}`);
            
            throw new APIError("FORBIDDEN", {
              message: "This email is not authorized to access this application. Please contact the administrator.",
            });
          }
          
          // Return the user data to proceed with creation
          return {
            data: user,
          };
        },
        after: async (user: any) => {
          console.log(`New authorized user created: ${user.email}`);
        },
      },
    },
  },
});
