import { HomePage } from "@/pages/home";
import { DefaultLayout } from "@/shared/layouts";
import { ProtectedRoute } from "@/features/ui";

const homeRoutes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DefaultLayout>
          <HomePage />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
];

export default homeRoutes;
