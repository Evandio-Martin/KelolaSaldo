import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./provider/routes";
import { AuthInitializer } from "./provider/AuthInitializer";
import { Analytics } from "./provider/Analytics";
import { Toaster } from "@/shared/ui/sonner";
import { LanguageProvider, ThemeProvider } from "@/shared/hooks";

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Analytics />
          <AuthInitializer>
            <RouterProvider router={router} />
            <Toaster richColors visibleToasts={1} />
          </AuthInitializer>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
