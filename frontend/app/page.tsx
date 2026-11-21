
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ListTodo } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "detail" in err.response.data &&
        typeof err.response.data.detail === "string"
          ? err.response.data.detail
          : "Unable to sign in. Please check your credentials and try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-white">
      {/* Branding panel */}
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#101827] p-12 text-white lg:flex">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
            <ListTodo size={25} />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            TaskFlow
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            Team Task & Sprint Tracker
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Bring your team&apos;s work together.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-slate-400">
            Plan projects, organize tasks, and keep everyone moving toward
            shared goals with one simple workspace.
          </p>

          <div className="mt-10 space-y-5">
            {[
              "Keep track of team progress",
              "Organize work by priority",
              "Stay on top of deadlines",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="text-blue-400" size={20} />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          © 2026 TaskFlow. All rights reserved.
        </p>
      </section>

      {/* Login form */}
      <section className="flex min-h-screen w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ListTodo size={23} />
            </div>
            <span className="text-lg font-bold text-slate-900">TaskFlow</span>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold text-blue-600">
              WELCOME BACK
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your credentials to access your team workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-12 text-center text-xs text-slate-400">
            Secure access powered by Team Task & Sprint Tracker
          </p>
        </div>
      </section>
    </main>
  );
}
