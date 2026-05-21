"use client";

import { useState } from "react";
import { Login, SignIn } from "@/src/lib/auth";
import { Eye, EyeClosed } from "lucide-react";
import { AuthResponse } from "@/types";
import { useRouter } from "next/navigation";

export default function Home() {
  const [authMode, setAuthMode] = useState<"login" | "create">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (authMode === "create") {
        const result = await SignIn(username, password);
        if (result.user.is_staff) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        return;
      }

      const result = (await Login(username, password)) as AuthResponse;
      if (result.user.is_staff) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to sign in. Please try again.";
      setError(message);
      console.error(
        authMode === "create" ? "Create account failed:" : "Login failed:",
        caughtError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#f4f6f8] px-6 py-12 text-slate-950">
      <section className="w-full max-w-[420px]">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
            Student Feedback
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {authMode === "create" ? "Create account" : "Sign in"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {authMode === "create"
              ? "Create your school account to start submitting feedback."
              : "Access the feedback dashboard with your school account."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 grid grid-cols-2 rounded-md bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setError("");
              }}
              className={`h-9 rounded-[5px] text-sm font-medium transition ${
                authMode === "login"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("create");
                setError("");
              }}
              className={`h-9 rounded-[5px] text-sm font-medium transition ${
                authMode === "create"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Create
            </button>
          </div>

          <label
            htmlFor="username"
            className="block text-sm font-medium text-slate-800"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
            placeholder="Enter username"
          />

          <label
            htmlFor="password"
            className="mt-5 block text-sm font-medium text-slate-800"
          >
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 pr-11 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
              placeholder="Enter password"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
            >
              {showPassword ? <Eye /> : <EyeClosed className="h-5 w-5" />}
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting
              ? authMode === "create"
                ? "Creating..."
                : "Signing in..."
              : authMode === "create"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Feedback tools for faculty, students, and administrators.
        </p>
      </section>
    </main>
  );
}
