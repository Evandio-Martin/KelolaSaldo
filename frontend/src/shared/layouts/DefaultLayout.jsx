import { useEffect } from "react";
import PropTypes from "prop-types";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  Sun,
  Moon,
  Languages,
  LogOut,
  Home,
  PiggyBank,
  BarChart3,
  ReceiptText,
} from "lucide-react";
import { useAuthStore } from "@/entities/auth";
import { useLanguage, useTheme } from "@/shared/hooks";

export const DefaultLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isDark = theme === "dark";
  const isEnglish = language === "en";

  const copy = isEnglish
    ? {
        appLabel: "Finance App",
        appDescription: "Daily balance tracking in one dashboard.",
        navigationItems: [
          { to: "/", label: "Overview", icon: Home, end: true },
          { to: "/transactions", label: "Transactions", icon: ReceiptText },
          { to: "/budgets", label: "Budgets", icon: PiggyBank },
          { to: "/reports", label: "Reports", icon: BarChart3 },
        ],
        languageLabel: "Language",
        lightMode: "Light mode",
        darkMode: "Dark mode",
        themeTitle: "Switch theme",
        logout: "Logout",
      }
    : {
        appLabel: "Aplikasi Keuangan",
        appDescription: "Catatan saldo harian dalam satu dashboard.",
        navigationItems: [
          { to: "/", label: "Ringkasan", icon: Home, end: true },
          { to: "/transactions", label: "Transaksi", icon: ReceiptText },
          { to: "/budgets", label: "Anggaran", icon: PiggyBank },
          { to: "/reports", label: "Laporan", icon: BarChart3 },
        ],
        languageLabel: "Bahasa",
        lightMode: "Mode terang",
        darkMode: "Mode gelap",
        themeTitle: "Ganti tema",
        logout: "Keluar",
      };

  const roleLabel =
    user?.role === "USER" && !isEnglish ? "Pengguna" : user?.role || "";

  return (
    <div
      className={`overflow-x-clip bg-[#fbf7ff] text-neutral-900 dark:bg-[#130d1d] dark:text-neutral-100 lg:flex lg:min-h-screen`}
    >
      <aside
        className={`relative z-20 flex w-full flex-col justify-between border-b border-fuchsia-100 bg-white/90 p-4 backdrop-blur dark:border-white/10 dark:bg-[#191124]/90 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:self-start lg:overflow-y-auto lg:border-r lg:border-b-0`}
      >
        <div>
          <div className="mb-4">
            <p className="text-xs font-semibold tracking-[0.3em] text-violet-600 uppercase dark:text-violet-300">
              {copy.appLabel}
            </p>
            <h2 className="mt-1 text-xl font-bold">KelolaSaldo</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {copy.appDescription}
            </p>
          </div>
          <nav>
            <ul className="space-y-1">
              {copy.navigationItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-violet-50 font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-200"
                          : "hover:bg-neutral-100 dark:hover:bg-white/5"
                      }`
                    }
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <hr className="my-4 border-neutral-200 dark:border-neutral-700" />
          {user && (
            <div className="space-y-1">
              <p className="font-semibold">{user.name}</p>
              <p className="text-neutral-600 dark:text-neutral-400">
                @{user.username}
              </p>
              <p className="text-xs text-neutral-500">{roleLabel}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-3 dark:border-fuchsia-400/20 dark:bg-fuchsia-500/10">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-fuchsia-800 dark:text-fuchsia-100">
              <Languages size={16} />
              <span>{copy.languageLabel}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  language === "id"
                    ? "bg-violet-600 text-white"
                    : "bg-white text-neutral-700 hover:bg-violet-100 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-violet-500/15"
                }`}
              >
                Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  language === "en"
                    ? "bg-violet-600 text-white"
                    : "bg-white text-neutral-700 hover:bg-violet-100 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-violet-500/15"
                }`}
              >
                English
              </button>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            title={copy.themeTitle}
            className="flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 font-semibold text-violet-800 transition-colors hover:bg-violet-100 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-100 dark:hover:bg-violet-500/15"
          >
            {isDark ? (
              <>
                <Sun size={18} />
                <span>{copy.lightMode}</span>
              </>
            ) : (
              <>
                <Moon size={18} />
                <span>{copy.darkMode}</span>
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500 bg-red-50 px-3 py-2 font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
          >
            <LogOut size={18} />
            <span>{copy.logout}</span>
          </button>
        </div>
      </aside>
      <main className="relative z-0 min-w-0 flex-1 overflow-x-hidden bg-[#fbf7ff] p-4 dark:bg-[#130d1d]">
        {children}
      </main>
    </div>
  );
};

DefaultLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
