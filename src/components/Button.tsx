"use client";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  type = "button",
  className,
}: ButtonProps) {
  const baseClasses = "font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-opacity-90",
    secondary: "bg-secondary text-white hover:bg-opacity-90",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  };

  const sizes = {
    sm: "px-sm py-xs text-sm",
    md: "px-md py-sm text-base",
    lg: "px-lg py-md text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
