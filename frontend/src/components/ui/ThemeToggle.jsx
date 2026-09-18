import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={
                darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            title={
                darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            className="
        relative
        w-12
        h-12
        rounded-full
        flex
        items-center
        justify-center
        border
        border-slate-200
        dark:border-slate-700
        bg-white
        dark:bg-slate-800
        text-slate-700
        dark:text-yellow-300
        shadow-sm
        hover:shadow-md
        hover:scale-105
        transition-all
        duration-300
      "
        >
            {darkMode ? (
                <Sun size={21} />
            ) : (
                <Moon size={21} />
            )}
        </button>
    );
}

export default ThemeToggle;