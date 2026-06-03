import Link from "next/link";
import {
  BarChart3,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Real-time dashboards with comprehensive insights into inventory, orders, and revenue.",
  },
  {
    icon: Package,
    title: "Smart Inventory",
    description:
      "Automated stock tracking, unit conversion, and intelligent reorder management.",
  },
  {
    icon: FileText,
    title: "Quotation Engine",
    description:
      "Streamlined quote requests with instant pricing calculations and approvals.",
  },
  {
    icon: ShoppingCart,
    title: "Order Management",
    description:
      "Complete order lifecycle management from request to delivery tracking.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description:
      "Secure multi-tenant architecture with admin, seller, and buyer roles.",
  },
  {
    icon: Zap,
    title: "Enterprise Grade",
    description:
      "Built for scale with secure authentication, PostgreSQL backend, and API-first design.",
  },
];

const benefits = [
  "Real-time inventory sync across all channels",
  "Automated quote-to-order conversion",
  "Multi-user collaboration and approvals",
  "Advanced pricing and unit conversion engine",
  "Comprehensive audit logs and reporting",
  "Mobile-optimized responsive design",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
              <span className="text-white font-bold">CS</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ChemStock Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-300/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            Inventory, Quotations & Orders
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            A modern SaaS platform for chemical businesses. Manage inventory with
            precision, process quotations instantly, and streamline your entire order
            workflow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Enterprise Features
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Everything you need to scale your chemical distribution business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:shadow-lg hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Why Teams Choose ChemStock Pro
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            Built specifically for modern chemical distribution
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Ready to Transform Your Workflow?
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
          Join forward-thinking chemical distributors using ChemStock Pro.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors group"
        >
          Create Free Account
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2026 ChemStock Pro. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

