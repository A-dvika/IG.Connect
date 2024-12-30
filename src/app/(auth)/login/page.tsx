"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/Auth";
import Link from "next/link";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";

export default function Login() {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      setError("Please fill out all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    const loginResponse = await login(email.toString(), password.toString());
    if (loginResponse.error) {
      setError(loginResponse.error!.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-md p-6 border rounded-lg bg-white shadow-md dark:bg-black">
      <h2 className="text-xl font-bold text-center mb-4">Login to Riverflow</h2>
      <p className="text-sm text-center text-gray-600 dark:text-gray-300">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-500 hover:underline">
          Register here
        </Link>
      </p>

      {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

      <form className="mt-6" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <button
          className="flex items-center px-4 py-2 border rounded w-full mr-2 justify-center"
          disabled={isLoading}
        >
          <IconBrandGoogle className="mr-2" /> Google
        </button>

        <button
          className="flex items-center px-4 py-2 border rounded w-full ml-2 justify-center"
          disabled={isLoading}
        >
          <IconBrandGithub className="mr-2" /> GitHub
        </button>
      </div>
    </div>
  );
}
