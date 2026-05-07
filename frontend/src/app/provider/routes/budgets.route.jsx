import { BudgetsPage } from "@/pages/budgets";
import { DefaultLayout } from "@/shared/layouts";
import { ProtectedRoute } from "@/features/ui";

const budgetRoutes = [
  {
    path: "/budgets",
    element: (
      <ProtectedRoute>
        <DefaultLayout>
          <BudgetsPage />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
];

export default budgetRoutes;