import { ReportsPage } from "@/pages/reports";
import { DefaultLayout } from "@/shared/layouts";
import { ProtectedRoute } from "@/features/ui";

const reportRoutes = [
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <DefaultLayout>
          <ReportsPage />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
];

export default reportRoutes;