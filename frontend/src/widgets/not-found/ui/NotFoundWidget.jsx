import { Link } from "react-router";
import { useLanguage } from "@/shared/hooks";
import { Seo } from "@/shared/ui/Seo";

export const NotFoundWidget = () => {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const copy = isEnglish
    ? {
        title: "Page Not Found",
        description: "The page you are looking for is not available in KelolaSaldo.",
        body: "The page you are trying to open is unavailable or has been moved.",
        back: "Back to overview",
      }
    : {
        title: "Halaman tidak ditemukan",
        description: "Halaman yang Anda cari tidak tersedia di KelolaSaldo.",
        body: "Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.",
        back: "Kembali ke ringkasan",
      };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4 text-center">
      <Seo
        title={copy.title}
        description={copy.description}
        noIndex
      />
      <p className="text-6xl font-bold text-violet-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-neutral-800">
        {copy.title}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        {copy.body}
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-violet-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        {copy.back}
      </Link>
    </div>
  );
};
