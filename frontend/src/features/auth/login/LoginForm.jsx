import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/entities/auth";
import { useLanguage } from "@/shared/hooks";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoadingAction, error, clearError } = useAuthStore();
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const copy = isEnglish
    ? {
        username: "Username",
        usernamePlaceholder: "Enter your username",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        loading: "Signing in...",
        submit: "Sign in",
      }
    : {
        username: "Username",
        usernamePlaceholder: "Masukkan username Anda",
        password: "Kata sandi",
        passwordPlaceholder: "Masukkan kata sandi Anda",
        loading: "Sedang masuk...",
        submit: "Masuk",
      };

  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/");
    } catch {
      // error is handled in store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {copy.username}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
          placeholder={copy.usernamePlaceholder}
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm transition-all outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {copy.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder={copy.passwordPlaceholder}
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm transition-all outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

      {error && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoadingAction}
        className="w-full rounded-2xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
      >
        {isLoadingAction ? copy.loading : copy.submit}
      </button>
    </form>
  );
};

export default LoginForm;
