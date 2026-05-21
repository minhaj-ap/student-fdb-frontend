"use client";

import { useState } from "react";
import { Login, SignIn } from "@/src/lib/auth";
import { Eye, EyeOff } from "lucide-react";
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

  function switchAuthMode(nextMode: "login" | "create") {
    setAuthMode(nextMode);
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (authMode === "create") {
        const result = await SignIn(username, password);
        router.push(result.user.is_staff ? "/admin" : "/dashboard");
        return;
      }
      const result = (await Login(username, password)) as AuthResponse;
      router.push(result.user.is_staff ? "/admin" : "/dashboard");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f4f0] px-6 py-12">
      <section className="w-full max-w-[480px]">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-[2rem] font-bold tracking-tight text-[#111] leading-tight">
            Student
            <span className="block">Feedback Portal</span>
          </h1>
          <p className="mt-3 text-sm text-[#888]">
            {authMode === "create"
              ? "Create your account to continue to the feedback dashboard."
              : "Sign in to continue to your dashboard."}
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[20px] border border-[#e8e6e0] bg-white p-8"
        >
          {/* Auth Switch */}
          <div className="mb-7 grid grid-cols-2 rounded-xl bg-[#f0ede8] p-1">
            <button
              type="button"
              onClick={() => switchAuthMode("login")}
              className={`h-10 rounded-[9px] text-sm font-medium transition-all ${
                authMode === "login"
                  ? "border border-[#e0ddd7] bg-white text-[#111]"
                  : "text-[#999]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchAuthMode("create")}
              className={`h-10 rounded-[9px] text-sm font-medium transition-all ${
                authMode === "create"
                  ? "border border-[#e0ddd7] bg-white text-[#111]"
                  : "text-[#999]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Username */}
          <div className="mb-5">
            <label className="mb-2 block text-[13px] font-medium text-[#555]">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="h-12 w-full rounded-xl border border-[#e0ddd7] bg-[#faf9f7] px-4 text-[15px] text-[#111] outline-none transition-all placeholder:text-[#bbb] focus:border-[#bbb] focus:bg-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#555]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-12 w-full rounded-xl border border-[#e0ddd7] bg-[#faf9f7] px-4 pr-12 text-[15px] text-[#111] outline-none transition-all placeholder:text-[#bbb] focus:border-[#bbb] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#aaa] transition hover:text-[#555]"
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 h-12 w-full rounded-xl bg-[#111] text-[15px] font-semibold text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting
              ? authMode === "create"
                ? "Creating Account..."
                : "Signing In..."
              : authMode === "create"
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#bbb]">
          Secure feedback management system for students and faculty.
        </p>
      </section>
    </main>
  );
}
