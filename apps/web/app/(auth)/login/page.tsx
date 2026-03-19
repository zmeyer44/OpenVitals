"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/client";
import { LogoWordmark } from "@/assets/app/images/logo";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn.email({ email, password });
      if (error) {
        toast.error(error.message ?? "Invalid email or password");
        return;
      }
      router.push("/home");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    await signIn.social({ provider: "google", callbackURL: "/home" });
  }

  return (
    <div className="w-full max-w-[380px] animate-fade-in">
      {/* Mobile logo */}
      <LogoWordmark className="mb-8 lg:hidden" />

      <h1 className="text-[26px] font-medium tracking-[-0.025em] text-neutral-900 font-display">
        Welcome back
      </h1>
      <p className="mt-2 text-[14px] text-neutral-500 font-body">
        Log in to access your health records.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-neutral-700 font-body"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-neutral-700 font-body"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-[14px] font-medium text-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
          style={{ background: "linear-gradient(135deg, #3162FF, #2750D9)" }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[12px] text-neutral-400 font-mono">
            or
          </span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 text-[14px] font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-[0.98] font-body"
      >
        Continue with Google
      </button>

      <p className="mt-8 text-center text-[13px] text-neutral-500 font-body">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-accent-600 hover:text-accent-700 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
