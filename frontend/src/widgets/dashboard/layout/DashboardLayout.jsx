import PropTypes from "prop-types";
import { useAuthStore } from "@/entities/auth";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-64 flex-col border-r border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-6 py-5">
          <h2 className="text-lg font-bold text-indigo-600">Admin Panel</h2>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
          <a
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
          >
            Dashboard
          </a>
          <a
            href="/users"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
          >
            Users
          </a>
        </nav>
        <div className="border-t border-neutral-100 px-4 py-4">
          {user && (
            <div className="mb-3 flex items-center gap-3">
              {user.image && (
                <img
                  src={user.image}
                  alt={user.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-neutral-800">
                  {user.firstName} {user.lastName}
                </span>
                <span className="truncate text-xs text-neutral-400">
                  @{user.username}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold! text-sky-800! transition hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminLayout;
