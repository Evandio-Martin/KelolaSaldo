import { TransactionsPage } from "@/pages/transactions";
import { DefaultLayout } from "@/shared/layouts";
import { ProtectedRoute } from "@/features/ui";

const transactionRoutes = [
  {
    path: "/transactions",
    element: (
      <ProtectedRoute>
        <DefaultLayout>
          <TransactionsPage />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
];

export default transactionRoutes;