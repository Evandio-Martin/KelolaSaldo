import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { GuestRoute } from "@/features/ui";

const authRoutes = [
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
];

export default authRoutes;
