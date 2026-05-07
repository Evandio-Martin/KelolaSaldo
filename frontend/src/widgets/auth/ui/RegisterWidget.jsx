import { RegisterForm } from "@/features/auth";
import { useLanguage } from "@/shared/hooks";
import { Seo } from "@/shared/ui/Seo";
import { Link } from "react-router";
import { AuthShell } from "./AuthShell";

export const RegisterWidget = () => {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const copy = isEnglish
    ? {
        seoTitle: "Create Account",
        seoDescription:
          "Create a KelolaSaldo account to start tracking income, expenses, and monthly budgets.",
        eyebrow: "Create account",
        title: "Create a new account",
        description:
          "Create an account to start managing balances, budgets, and monthly financial reports.",
        footerLead: "Already have an account?",
        footerLink: "Sign in",
      }
    : {
        seoTitle: "Daftar",
        seoDescription:
          "Buat akun KelolaSaldo untuk mulai mencatat pemasukan, pengeluaran, dan anggaran bulanan.",
        eyebrow: "Daftar",
        title: "Buat akun baru",
        description:
          "Buat akun untuk mulai mengelola saldo, menyusun anggaran, dan meninjau laporan keuangan bulanan Anda.",
        footerLead: "Sudah punya akun?",
        footerLink: "Masuk",
      };

  return (
    <>
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        canonical="/register"
        noIndex
      />
      <AuthShell
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        footer={
          <p>
            {copy.footerLead}{" "}
            <Link to="/login" className="font-semibold text-fuchsia-700 dark:text-fuchsia-300">
              {copy.footerLink}
            </Link>
          </p>
        }
      >
        <RegisterForm />
      </AuthShell>
    </>
  );
};
