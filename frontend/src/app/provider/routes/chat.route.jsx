import { ChatPage } from "@/pages/chat";
import { DefaultLayout } from "@/shared/layouts";
import { ProtectedRoute } from "@/features/ui";

const chatRoutes = [
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <DefaultLayout>
          <ChatPage />
        </DefaultLayout>
      </ProtectedRoute>
    ),
  },
];

export default chatRoutes;
