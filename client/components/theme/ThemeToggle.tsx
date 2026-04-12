"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
 const { theme, setTheme, resolvedTheme } = useTheme();
 const current = (theme === "system" ? resolvedTheme : theme) ?? "light";

 const toggleTheme = () => {
 setTheme(current === "dark" ? "light" : "dark");
 };

 return (
 <Button
 type="button"
 variant="ghost"
 size="icon"
 aria-label="Toggle theme"
 onClick={toggleTheme}
 >
 {current === "dark" ? <Sun className="text-primary fill-primary/20" /> : <Moon />}
 </Button>
 );
}
