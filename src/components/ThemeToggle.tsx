import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center relative"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90 text-primary" />
      <Moon className="absolute h-4 w-4 transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0 text-primary" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
