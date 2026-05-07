import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/entities/auth";
import { useLanguage } from "@/shared/hooks";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, isLoadingAction, error, clearError } = useAuthStore();
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const copy = isEnglish
    ? {
        name: "Full name",
        namePlaceholder: "Enter your full name",
        username: "Username",
        usernamePlaceholder: "Choose a username",
        nickname: "Nickname",
        nicknamePlaceholder: "Choose a nickname",
        password: "Password",
        passwordPlaceholder: "Choose a password",
        loading: "Creating account...",
        submit: "Create account",
      }
    : {
        name: "Nama lengkap",
        namePlaceholder: "Masukkan nama lengkap Anda",
        username: "Username",
        usernamePlaceholder: "Pilih username",
        nickname: "Nama panggilan",
        nicknamePlaceholder: "Pilih nama panggilan",
        password: "Kata sandi",
        passwordPlaceholder: "Pilih kata sandi",
        loading: "Sedang membuat akun...",
        submit: "Buat akun",
      };

  const [form, setForm] = useState({
    name: "",
    username: "",
    nickname: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/login");
    } catch {
      // error is handled in store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {copy.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          placeholder={copy.namePlaceholder}
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm transition-all outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

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
          htmlFor="nickname"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {copy.nickname}
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          value={form.nickname}
          onChange={handleChange}
          required
          placeholder={copy.nicknamePlaceholder}
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

export default RegisterForm;
