"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight, Eye, EyeOff, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  role: "SELLER" | "USER";
};

const roleOptions = [
  {
    value: "USER" as const,
    label: "Buyer",
    icon: ShoppingBag,
    description: "Browse products and place orders",
  },
  {
    value: "SELLER" as const,
    label: "Seller",
    icon: Store,
    description: "Manage inventory and fulfill orders",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RegisterFormValues["role"]>("USER");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "USER" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setServerError(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, role: selectedRole }),
    });

    if (!response.ok) {
      try {
        const body = await response.json();
        setServerError(body.error || "Unable to register");
      } catch {
        setServerError("Unable to register. Please try again.");
      }
      setIsLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200/50 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
              <span className="text-white font-bold">CS</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ChemStock Pro
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-8 sm:p-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Create Your Account
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Get started with ChemStock Pro in minutes
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  className={cn(
                    "w-full h-11 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-colors",
                    errors.name
                      ? "border-red-500 dark:border-red-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
                  )}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "w-full h-11 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-colors",
                    errors.email
                      ? "border-red-500 dark:border-red-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
                  )}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "w-full h-11 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-colors",
                      errors.password
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
                    )}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedRole(option.value)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all text-left",
                          selectedRole === option.value
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {option.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" value={selectedRole} {...register("role")} />
              </div>

              {/* Error Alert */}
              {serverError && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {serverError}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? "Creating account..." : "Create Account"}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              {/* Terms */}
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                By creating an account, you agree to our Terms of Service
              </p>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

