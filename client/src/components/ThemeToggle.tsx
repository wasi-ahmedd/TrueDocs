import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, CloudRain, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("navy");
        else if (theme === "navy") setTheme("cosmic");
        else setTheme("light");
    };

    const getIcon = () => {
        switch (theme) {
            case "light": return <Sun className="h-5 w-5" />;
            case "dark": return <Moon className="h-5 w-5" />;
            case "navy": return <CloudRain className="h-5 w-5" />;
            case "cosmic": return <Sparkles className="h-5 w-5" />;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background/50 backdrop-blur-sm border-border hover:scale-110 transition-transform shadow-lg"
                onClick={cycleTheme}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={theme}
                        initial={{ y: -20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        {getIcon()}
                    </motion.div>
                </AnimatePresence>
            </Button>
        </div>
    );
}
