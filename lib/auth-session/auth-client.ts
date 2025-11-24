import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import {
  organizationClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import type { auth } from "@/lib/auth-session/auth";

/**
 * Better Auth Client Configuration
 *
 * Best practices:
 * - Don't set baseURL (use relative paths for same-origin cookies)
 * - Always include credentials
 * - Handle errors gracefully
 * - Use plugins as needed
 */
export const authClient = createAuthClient({
  // Use relative paths for same-origin requests
  // baseURL is only needed if auth API is on different domain

  fetchOptions: {
    credentials: "include", // Include cookies in all requests
    onError: async (context) => {
      const { response, error } = context;

      // Rate limiting
      if (response?.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        toast.error(
          `Too many requests. Please try again in ${retryAfter} seconds.`
        );
        return;
      }

      // Network errors
      if (!response) {
        toast.error("Network error. Please check your connection.");
        return;
      }

      // Other errors
      console.error("Auth error:", error);
    },
  },

  // Plugins
  plugins: [
    organizationClient(),
    inferAdditionalFields<typeof auth>(),
    stripeClient({
      subscription: true,
    }),
  ],
});
/**
 * Export commonly used hooks and methods
 */
export const { useSession, signIn, signOut, signUp } = authClient;

/**
 * Resend verification email
 * @param email - User's email address
 */
export const resendVerificationEmail = async (email: string) => {
  const res = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error("Failed to resend verification email.");
  }
  return res.json();
};
/**
 * Sign in with email and password
 * @param email - User's email address
 * @param password - User's password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const data = await authClient.signIn.email(
    {
      email,
      password,
    },
    {
      onError: (ctx) => {
        // Handle the error
        if (ctx.error.status === 403) {
          throw new Error("Please verify your email address");
        }
        throw new Error(ctx.error.message);
      },
    }
  );
  return data;
};

/**
 * Sign in with Google using OAuth
 * This will redirect the user to Google's consent screen
 */
export const signInWithGoogle = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });
  return data;
};

/**
 * Sign in with Google using ID Token
 * Useful when you already have the Google ID Token from client-side
 * @param token - Google ID Token
 * @param accessToken - Google Access Token (optional)
 */
export const signInWithGoogleIdToken = async (
  token: string,
  accessToken?: string
) => {
  const data = await authClient.signIn.social({
    provider: "google",
    idToken: {
      token,
      accessToken,
    },
  });
  return data;
};

/**
 * Request additional Google scopes (e.g., Google Drive, Gmail)
 * @param scopes - Array of Google API scopes to request
 */
export const requestAdditionalGoogleScopes = async (scopes: string[]) => {
  await authClient.linkSocial({
    provider: "google",
    scopes,
  });
};
