import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const ThemeToggle = (): React.JSX.Element => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  return (
    <button
      type="button"
      onClick={() => setDarkMode(!darkMode)}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-violet-300 hover:bg-violet-50"
    >
      {darkMode ? (
        <Sun
          size={20}
          className="text-amber-500"
        />
      ) : (
        <Moon
          size={20}
          className="text-slate-600"
        />
      )}
    </button>
  );
};

export default ThemeToggle;