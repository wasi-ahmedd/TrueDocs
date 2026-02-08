import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "navy" | "cosmic";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("theme") as Theme) || "light";
        }
        return "light";
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove all theme classes first
        root.classList.remove("light", "dark", "theme-navy", "theme-cosmic");

        if (theme === "light") {
            // Just remove everything
        } else {
            root.classList.add("dark"); // All non-light themes are dark-based
            if (theme !== "dark") {
                root.classList.add(`theme-${theme}`);
            }
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    return { theme, setTheme };
}
