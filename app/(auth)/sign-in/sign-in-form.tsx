"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-session/auth-client";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showVerifyNotice, setShowVerifyNotice] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function togglePassword(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setShowPassword((s) => !s);
  }

  async function handleSubmit(data: SignInInput) {
    setIsLoading(true);

    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: async (ctx) => {
            // User data is available in ctx.data
            const user = ctx.data?.user;
            const role = user?.role;

            setIsRedirecting(true);
            setShowVerifyNotice(false);

            // Determine target based on role
            const target =
              role === "admin"
                ? "/dashboard/admin"
                : role === "dentist"
                  ? "/dashboard/dentist"
                  : role === "patient" || role === "user" // Handle legacy "user" role
                    ? "/dashboard/patient"
                    : "/dashboard"; // Fallback to dashboard dispatcher

            const description =
              role === "admin"
                ? "Redirecting to admin panel..."
                : role === "dentist"
                  ? "Redirecting to dentist portal..."
                  : role === "patient" || role === "user"
                    ? "Redirecting to patient portal..."
                    : "Welcome back!";

            toast.success("Login successful!", { description });

            // Small delay to ensure cookie is set before redirect
            // This is critical for production where cookie propagation takes time
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Use window.location.href for full page reload
            window.location.href = target;
          },
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              setShowVerifyNotice(true);
              toast.error("Please verify your email address", {
                description: "Check your inbox for the verification link.",
              });
            } else {
              setShowVerifyNotice(false);
              setErrorMessage(
                ctx.error.message || "Invalid email or password."
              );
              setShowErrorDialog(true);
            }
            setIsLoading(false);
          },
        }
      );
    } catch {
      toast.error("An unexpected error occurred", {
        description: "Please try again later.",
      });
      setIsLoading(false);
    }
  }

  async function handleResendVerification(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    setResendLoading(true);
    setResendSuccess(false);
    const email = form.getValues("email");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendSuccess(true);
        toast.success("Verification email sent!", {
          description: "Check your inbox for the verification link.",
        });
      } else {
        toast.error("Failed to resend verification email.");
      }
    } catch {
      toast.error("Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  }

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check for error in URL params (from OAuth callback)
  useEffect(() => {
    const checkUserAndHandleErrors = async () => {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const message = params.get("message");
      const check = params.get("check");

      // If we need to check user existence after Google OAuth
      if (check === "google") {
        try {
          const response = await fetch("/api/auth/check-user-exists");
          const data = await response.json();

          if (!data.exists) {
            // User doesn't exist
            setErrorMessage(
              data.message ||
                "No account found with this email address. Please sign up first or use a different email."
            );
            setShowErrorDialog(true);
            // Clean up URL
            window.history.replaceState({}, "", window.location.pathname);
          } else {
            // User exists, redirect to dashboard
            const role = data.user?.role || "patient";
            const target =
              role === "admin"
                ? "/dashboard/admin"
                : role === "dentist"
                  ? "/dashboard/dentist"
                  : "/dashboard/patient"; // Default to patient for "patient" or "user" or undefined

            setIsRedirecting(true);
            window.location.href = target;
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
          setErrorMessage("An error occurred. Please try again.");
          setShowErrorDialog(true);
          window.history.replaceState({}, "", window.location.pathname);
        }
        return;
      }

      // Handle direct error parameters
      if (error) {
        if (
          error === "USER_NOT_FOUND" ||
          error.includes("user") ||
          error.includes("email")
        ) {
          setErrorMessage(
            message ||
              "No account found with this email address. Please sign up first or use a different email."
          );
          setShowErrorDialog(true);
          // Clean up URL
          window.history.replaceState({}, "", window.location.pathname);
        } else {
          // Handle other OAuth errors
          setErrorMessage(
            message ||
              "An error occurred during Google sign-in. Please try again."
          );
          setShowErrorDialog(true);
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
    };

    checkUserAndHandleErrors();
  }, []);

  async function handleGoogleSignIn() {
    try {
      setIsGoogleLoading(true);

      // Google OAuth redirects to Google, then back to /api/auth/callback/google
      // Better Auth handles the callback and creates/updates the session
      // After callback, we'll check if user exists before allowing access
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/sign-in?check=google", // Redirect to sign-in to check user
        errorCallbackURL: "/sign-in?error=OAUTH_ERROR",
      });

      // This will cause a redirect, so code after this won't execute
    } catch (error) {
      console.error("Google sign-in failed:", error);
      toast.error("Google sign-in failed", {
        description: "Please try again.",
      });
      setIsGoogleLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup>
          {showVerifyNotice && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded p-3 text-center mb-2">
              <div className="mb-2">
                Your email is not verified. Please check your inbox for the
                verification link.
              </div>
              <button
                type="button"
                className="underline text-sm text-blue-700 disabled:opacity-60"
                onClick={handleResendVerification}
                disabled={resendLoading || resendSuccess}
              >
                {resendLoading
                  ? "Resending..."
                  : resendSuccess
                    ? "Verification Sent!"
                    : "Resend Verification Email"}
              </button>
            </div>
          )}
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to login to your account
            </p>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <Field>
                <FormLabel asChild>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g m@gmail.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <Field>
                <div className="flex items-center">
                  <FormLabel asChild>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </FormLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <FormControl>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <button
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={togglePassword}
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 text-sm opacity-70 hover:opacity-100"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.97 9.97 0 012.175-5.875M6.343 6.343A9.97 9.97 0 0112 5c5.523 0 10 4.477 10 10 0 1.042-.161 2.045-.463 2.998M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <FormMessage />
              </Field>
            )}
          />
          <Field>
            <Button type="submit" disabled={isLoading || isGoogleLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  {"Logging in..."}
                </>
              ) : (
                "Login"
              )}
            </Button>
          </Field>
          <FieldSeparator>Or continue with</FieldSeparator>
          <Field>
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  {"Signing in..."}
                </>
              ) : (
                <>
                  <svg
                    width="800px"
                    height="800px"
                    viewBox="-3 0 262 262"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                    className="size-4 mr-2"
                  >
                    <path
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                      fill="#4285F4"
                    />
                    <path
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                      fill="#34A853"
                    />
                    <path
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                      fill="#FBBC05"
                    />
                    <path
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                      fill="#EB4335"
                    />
                  </svg>
                  Login with Google
                </>
              )}
            </Button>
            <FieldDescription className="text-center">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>

      {/* Error Dialog for Google Login */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Account Not Found
            </DialogTitle>
            <DialogDescription className="pt-2">
              {errorMessage ||
                "No account found with this email address. Please sign up first or use a different email."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowErrorDialog(false)}>
              Close
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redirecting Spinner Overlay */}
      {isRedirecting && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <Spinner variant="pinwheel" className="size-10 text-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
            Redirecting to dashboard...
          </p>
        </div>
      )}
    </Form>
  );
}
