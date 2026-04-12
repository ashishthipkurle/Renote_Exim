"use client";

import * as React from "react";
import { Button, type ButtonProps } from "./button";
import LoadingSpinner from "./LoadingSpinner";
import { cn } from "@/lib/utils";

interface ButtonWithLoadingProps extends ButtonProps {
 isLoading?: boolean;
 loadingText?: string;
 onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

const ButtonWithLoading = React.forwardRef<
 HTMLButtonElement,
 ButtonWithLoadingProps
>(
 (
 {
 isLoading = false,
 loadingText,
 disabled,
 children,
 className,
 onClick,
 ...props
 },
 ref
 ) => {
 const [internalLoading, setInternalLoading] = React.useState(false);
 const loading = isLoading || internalLoading;

 const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
 if (loading) return;

 try {
 setInternalLoading(true);
 const result = onClick?.(e);

 if (result instanceof Promise) {
 await result;
 }
 } finally {
 setInternalLoading(false);
 }
 };

 return (
 <Button
 ref={ref}
 disabled={disabled || loading}
 onClick={handleClick}
 className={cn(
 "relative transition-all duration-200",
 loading && "pointer-events-none opacity-90",
 className
 )}
 {...props}
 >
 {loading ? (
 <div className="flex items-center gap-2">
 <LoadingSpinner size="sm" />
 <span>{loadingText || "Loading..."}</span>
 </div>
 ) : (
 children
 )}
 </Button>
 );
 }
);

ButtonWithLoading.displayName = "ButtonWithLoading";

export { ButtonWithLoading };
