import { createBrowserRouter } from "react-router";
import { NotFoundPage } from "@/pages/not-found";
import authRoutes from "./auth.route";
import homeRoutes from "./home.route";
import chatRoutes from "./chat.route";
import transactionRoutes from "./transactions.route";
import budgetRoutes from "./budgets.route";
import reportRoutes from "./reports.route";

export const router = createBrowserRouter([
  ...authRoutes,
  ...homeRoutes,
  ...chatRoutes,
  ...transactionRoutes,
  ...budgetRoutes,
  ...reportRoutes,
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
