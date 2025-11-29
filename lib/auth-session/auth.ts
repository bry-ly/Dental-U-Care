import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/types/prisma";
import { sendAuthEmail } from "@/lib/email/send-email";

/**
 * Better Auth Configuration
 *
 * Best practices:
 * - Use environment variables for secrets and URLs
 * - Enable secure cookies in production
 * - Use rolling sessions for better UX
 * - Cache sessions to reduce database calls
 */
export const auth = betterAuth({
  // Core configuration
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  // Advanced security settings
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: true, // Works across www and non-www
    },
    defaultCookieAttributes: {
      sameSite: "lax", // CSRF protection while allowing normal navigation
      path: "/",
      // httpOnly is automatically set by Better Auth
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
    },
  },
  // Database adapter
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Email & Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false, // Don't auto sign-in until email verified
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        type: "reset-password",
        to: user.email,
        username: user.name,
        url,
        userEmail: user.email,
      });
    },
  },

  // Email verification
  emailVerification: {
    sendOnSignUp: true,
    autoSendVerificationEmail: true,
    autoSignInAfterVerification: true, // Automatically sign in user after email verification
    sendVerificationEmail: async ({ user, url }) => {
      // Add redirect parameter to verification URL to redirect after verification
      const baseURL =
        process.env.BETTER_AUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
      const redirectUrl = new URL(url);

      // Fetch user from database to get role (user object from callback doesn't include role)
      let userRole = "patient"; // Default role
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        if (dbUser?.role) {
          userRole = dbUser.role;
        }
      } catch (error) {
        console.error(
          "Error fetching user role for verification redirect:",
          error
        );
        // Use default role if fetch fails
      }

      // Determine redirect based on user role
      const redirectPath =
        userRole === "admin"
          ? "/dashboard/admin"
          : userRole === "dentist"
            ? "/dashboard/dentist"
            : "/dashboard/patient";

      redirectUrl.searchParams.set("redirect", `${baseURL}${redirectPath}`);

      await sendAuthEmail({
        type: "verification",
        to: user.email,
        username: user.name,
        url: redirectUrl.toString(),
      });
    },
  },
  // User model configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "patient",
        input: false, // Don't allow direct input
      },
    },
  },

  // Social authentication providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account consent", // Always show account selector
      disableSignUp: false, // We'll check user existence in onAfterSignIn
    },
  },

  // Lifecycle hooks
  onAfterSignUp: async ({ user }: { user: { id: string; role?: string } }) => {
    // Ensure new users have a role
    if (!user.role) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "patient" },
      });
    }
  },

  // Auto sign in after email verification
  onAfterEmailVerification: async ({
    user,
  }: {
    user: { id: string; email: string; emailVerified: boolean };
  }) => {
    // Better Auth automatically creates a session after email verification
    // This hook is called after the email is verified
    // The user should already be signed in at this point
    console.log("Email verified for user:", user.email);
  },

  // Check user existence after social sign-in (for login flow)
  // Note: This runs after sign-in completes, so we need to handle it differently
  onAfterSignIn: async ({
    user,
    provider,
  }: {
    user: { id: string; email: string };
    provider?: string;
  }) => {
    // Only check for Google provider
    if (provider === "google") {
      try {
        // Check if user exists in database by email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // If user doesn't exist, we'll handle this in the callback route
        // by checking and redirecting with error
        if (!existingUser) {
          // Store error in a way that can be checked in callback
          // Better Auth doesn't allow throwing here to prevent sign-in
          // So we'll handle it in a custom callback handler
          console.warn(`User not found for email: ${user.email}`);
        }
      } catch (error) {
        console.error("Error checking user existence:", error);
      }
    }
  },

  // Plugins (nextCookies must be last)
  plugins: [nextCookies()],
});
