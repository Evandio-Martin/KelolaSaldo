import PropTypes from "prop-types";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors
      icons={{
        success: <CircleCheckIcon size={20} />,
        info: <InfoIcon size={20} />,
        warning: <TriangleAlertIcon size={20} />,
        error: <OctagonXIcon size={20} />,
        loading: <Loader2Icon size={20} />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
        style: {
          background: "#fff",
          color: "#333",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
      }}
      {...props}
    />
  );
};

Toaster.propTypes = {
  position: PropTypes.string,
  expand: PropTypes.bool,
  richColors: PropTypes.bool,
};

export { Toaster };
