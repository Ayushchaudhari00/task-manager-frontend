import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Github } from "lucide-react";
import api from "../api/axios";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Backend returns a PLAIN STRING token, not a JSON object.
      // axios will put that string directly into res.data.
      const res = await api.post("/api/auth/login", { email, password });
      const token = res.data; // this is the raw JWT string

      localStorage.setItem("token", token);
      // We only get the token back from login, so store the email we typed
      localStorage.setItem("user", JSON.stringify({ email }));

      onLogin(); // tells App.jsx to flip isAuthenticated → true
    } catch (err) {
      // Spring Boot throws RuntimeException("Invalid credentials")
      // which comes back as a plain string in res.data
      const msg = err.response?.data;
      setError(typeof msg === "string" && msg ? msg : "Invalid email or password");
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
            <h1 className="text-4xl font-semibold text-slate-900 mb-3">Log in to your account</h1>
            <p className="text-slate-500 text-lg">Manage your tasks and collaborate with your team</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Work email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <p className="mt-1.5 text-xs text-slate-500">Using a work email helps find teammates and boost collaboration.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                "Log in"
              )}
            </button>
            {isLoading && (
              <p className="text-xs text-center text-slate-500 mt-2">
                First login may take 30-60 seconds while the server wakes up...
              </p>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-50 to-blue-50 text-slate-500">Or continue with</span>
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
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-600">
              Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">Sign up</Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-10 pt-7 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center mb-3">Trusted by teams at</p>
            <div className="flex items-center justify-center gap-8 opacity-35">
              <span className="text-xl font-bold text-slate-400">ACME</span>
              <span className="text-xl font-bold text-slate-400">TECH</span>
              <span className="text-xl font-bold text-slate-400">CORP</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Illustration ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-lg w-full">
          {/* Mock board */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              <div>
                <div className="h-3 w-28 bg-slate-200 rounded"></div>
                <div className="h-2 w-20 bg-slate-100 rounded mt-1.5"></div>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { color: "green", w: "w-36" },
                { color: "blue", w: "w-32" },
                { color: "slate", w: "w-28" },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 bg-${item.color}-50 rounded-lg border-l-4 border-${item.color}-500`}>
                  <div className={`w-4 h-4 bg-${item.color}-400 rounded`}></div>
                  <div className="flex-1">
                    <div className={`h-2.5 ${item.w} bg-${item.color}-200 rounded`}></div>
                  </div>
                  <div className={`w-7 h-7 bg-${item.color}-400 rounded-full`}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-3">Where your tasks and team come together</h2>
            <p className="text-blue-200">Collaborate seamlessly, track progress effortlessly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}