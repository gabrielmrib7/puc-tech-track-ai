import React from "react";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger" | "success";
}

export function SubmitButton({
  children,
  isLoading = false,
  loadingText = "Salvando...",
  disabled,
  className = "",
  variant = "primary",
  ...props
}: SubmitButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

  const variantStyles = {
    primary: "bg-[#004ac6] text-white hover:bg-[#003ea8] shadow-sm",
    secondary: "border border-[#c3c6d7] bg-white text-[#131b2e] hover:bg-[#f2f3ff]",
    danger: "bg-[#ba1a1a] text-white hover:bg-[#93000a] shadow-sm",
    success: "bg-[#16a34a] text-white hover:bg-[#15803d] shadow-sm",
  };

  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

