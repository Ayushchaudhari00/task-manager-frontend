import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Github } from "lucide-react";
import api from "../api/axios";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Single call — backend now returns { token, name, email } directly
      const res = await api.post("/api/auth/register", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({ name: res.data.name, email: res.data.email }));

      onRegister();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === "string" && msg ? msg : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* ── Left: Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-slate-800">TaskFlow</span>
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 mb-3">Create your account</h1>
            <p className="text-slate-500 text-lg">Start managing tasks and collaborate with your team</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Work email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <p className="mt-1.5 text-xs text-slate-500">Using a work email helps find teammates and boost collaboration.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <p className="mt-1.5 text-xs text-slate-500">Must be at least 6 characters long</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                "Sign up"
              )}
            </button>
            {isLoading && (
              <p className="text-xs text-center text-slate-500 mt-2">
                First request may take 30-60 seconds while the server starts...
              </p>
            )}

            <p className="text-xs text-slate-500 text-center">
              By signing up, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-50 to-blue-50 text-slate-500">Or sign up with</span>
            </div>
          </div>

          {/* Social (UI only) */}
          <div className="grid grid-cols-2 gap-4 mb-7">
            <button type="button" className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-slate-700">Google</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Github className="w-5 h-5 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">GitHub</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Log in</Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-10 pt-7 border-t border-slate-200">
            <div className="flex items-center justify-center gap-6">
              {[
                { bg: "bg-green-500", label: "Free forever" },
                { bg: "bg-blue-500", label: "Secure & encrypted" },
                { bg: "bg-purple-500", label: "Setup in 2 mins" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-5 h-5 ${badge.bg} rounded-full flex items-center justify-center`}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Illustration ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-lg w-full">
          {/* Feature cards */}
          <div className="space-y-4 mb-8">
            {[
              { title: "Organize Everything", desc: "Keep all your tasks, projects, and goals in one place", from: "from-emerald-500", to: "to-teal-500", rotate: "-rotate-1" },
              { title: "Collaborate Seamlessly", desc: "Work together with your team in real-time", from: "from-blue-500", to: "to-indigo-500", rotate: "rotate-1" },
              { title: "Track Progress", desc: "Visualize your productivity with insightful analytics", from: "from-purple-500", to: "to-pink-500", rotate: "-rotate-0.5" },
            ].map((card, i) => (
              <div key={i} className={`bg-white/95 rounded-xl p-5 shadow-xl ${card.rotate} hover:rotate-0 transition-transform duration-300`}>
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 bg-gradient-to-br ${card.from} ${card.to} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-0.5">{card.title}</h3>
                    <p className="text-sm text-slate-600">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-3">Join thousands of productive teams</h2>
            <p className="text-emerald-200">Get started for free and experience the power of organized task management.</p>
          </div>
        </div>
      </div>
    </div>
  );
}