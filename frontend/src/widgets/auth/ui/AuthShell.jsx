import { useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router";
import { Languages, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { useLanguage } from "@/shared/hooks";

export const AuthShell = ({
  eyebrow,
  title,
  description,
  cardNote,
  footer,
  children,
}) => {
  const { language, setLanguage } = useLanguage();
  const { pathname } = useLocation();
  const isEnglish = language === "en";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const copy = isEnglish
    ? {
        badge: "Personal finance tracker",
        headline:
          "Track balances, tidy spending, and review monthly progress with less noise.",
        description:
          "The sign in and registration screens stay intentionally simple so you can evaluate the MVP flow without oversized promo panels.",
        featureCards: [
          {
            title: "Tidy daily records",
            description: "Capture important transactions without a crowded interface.",
          },
          {
            title: "Clear monthly budgets",
            description: "Monitor category spending limits in a compact view.",
          },
          {
            title: "Ready for review",
            description: "Sign in quickly to judge the MVP flow, data, and layout.",
          },
        ],
        demoMode: "Local demo mode remains available for quick testing.",
        workspace: "Personal finance workspace",
        workspaceDescription: "A simple money-tracking workspace for fast product review.",
        languageLabel: "Language",
      }
    : {
        badge: "Aplikasi pencatat keuangan",
        headline:
          "Catat saldo, rapikan pengeluaran, dan cek progres bulanan dengan lebih tenang.",
        description:
          "Tampilan masuk dan daftar dibuat lebih sederhana supaya Anda bisa langsung menilai alur MVP tanpa panel promosi yang berlebihan.",
        featureCards: [
          {
            title: "Catatan harian rapi",
            description: "Simpan transaksi penting tanpa perlu layar yang ramai.",
          },
          {
            title: "Anggaran bulanan jelas",
            description: "Pantau batas pengeluaran per kategori dengan tampilan ringkas.",
          },
          {
            title: "Siap untuk demo",
            description: "Masuk cepat untuk menilai alur, data, dan struktur MVP lokal Anda.",
          },
        ],
        demoMode: "Mode demo lokal tetap tersedia untuk pengujian cepat.",
        workspace: "Ruang kerja keuangan pribadi",
        workspaceDescription: "Ruang kerja keuangan pribadi berbahasa Indonesia",
        languageLabel: "Bahasa",
      };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.18),_transparent_30%)] bg-[#faf7ff] text-neutral-950 dark:bg-[#120c19] dark:text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[28px] border border-white/70 bg-white/78 p-6 shadow-[0_25px_80px_-50px_rgba(88,28,135,0.45)] backdrop-blur dark:border-white/10 dark:bg-white/6 sm:p-8">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-4 py-2 text-sm font-semibold text-fuchsia-700 dark:border-fuchsia-400/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-200">
              <Wallet size={16} />
              KelolaSaldo
            </div>

            <div className="mt-8 space-y-4">
              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-violet-700 uppercase dark:bg-violet-500/15 dark:text-violet-200">
                {copy.badge}
              </span>
              <h2 className="max-w-lg text-3xl font-bold tracking-tight sm:text-4xl">
                {copy.headline}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                {copy.description}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {copy.featureCards.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-fuchsia-100 bg-white/85 px-4 py-4 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {feature.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-950">
              <ShieldCheck size={16} />
              {copy.demoMode}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-[0_28px_90px_-48px_rgba(88,28,135,0.5)] backdrop-blur dark:border-white/10 dark:bg-[#161021]/92 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/20">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                    KelolaSaldo
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {copy.workspaceDescription}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-fuchsia-200 bg-fuchsia-50 p-2 text-sm shadow-sm dark:border-fuchsia-400/20 dark:bg-fuchsia-500/10">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-fuchsia-700 shadow-sm dark:bg-white/10 dark:text-fuchsia-100">
                  <Languages size={16} />
                </span>
                <span className="text-xs font-semibold tracking-[0.2em] text-fuchsia-700 uppercase dark:text-fuchsia-200">
                  {copy.languageLabel}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("id")}
                    aria-pressed={language === "id"}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      language === "id"
                        ? "bg-violet-600 text-white"
                        : "bg-white text-neutral-700 hover:bg-violet-100 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-violet-500/15"
                    }`}
                  >
                    ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    aria-pressed={language === "en"}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      language === "en"
                        ? "bg-violet-600 text-white"
                        : "bg-white text-neutral-700 hover:bg-violet-100 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-violet-500/15"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <span className="inline-flex rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-fuchsia-700 uppercase dark:bg-fuchsia-500/15 dark:text-fuchsia-200">
                {eyebrow}
              </span>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
              <p className="max-w-lg text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                {description}
              </p>
            </div>

            {cardNote && (
              <div className="mt-6 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-900 dark:border-fuchsia-400/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-100">
                {cardNote}
              </div>
            )}

            <div className="mt-8">{children}</div>

            <div className="mt-8 border-t border-neutral-200 pt-5 text-sm text-neutral-600 dark:border-white/10 dark:text-neutral-300">
              {footer}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

AuthShell.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  cardNote: PropTypes.node,
  footer: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};