import { Toaster as HotToaster } from "react-hot-toast"
import { CheckCircle, AlertCircle, Loader } from "lucide-react"

const Toaster = () => {
  return (
    <>
      <HotToaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            color: "#f1f5f9",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "12px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
            padding: "16px 20px",
            fontSize: "14px",
            fontWeight: "500",
            backdropFilter: "blur(10px)",
          },
          success: {
            duration: 3000,
            style: {
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
              padding: "16px 20px",
              fontSize: "14px",
              fontWeight: "600",
              backdropFilter: "blur(10px)",
            },
            icon: <CheckCircle className="w-5 h-5" />,
          },
          error: {
            duration: 5000,
            style: {
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
              padding: "16px 20px",
              fontSize: "14px",
              fontWeight: "600",
              backdropFilter: "blur(10px)",
            },
            icon: <AlertCircle className="w-5 h-5" />,
          },
          loading: {
            style: {
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
              padding: "16px 20px",
              fontSize: "14px",
              fontWeight: "600",
              backdropFilter: "blur(10px)",
            },
            icon: <Loader className="w-5 h-5 animate-spin" />,
          },
        }}
      />
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }

        [role="status"] {
          animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        [role="status"].removed {
          animation: slideOut 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        [role="status"] > div {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </>
  )
}

export default Toaster
