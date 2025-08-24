"use client"
import { useTheme } from "@/app/contexts/ThemeContext";

const ThemeToggle: React.FC = () => {

  const {theme,toggleTheme} = useTheme();
  
  return (
    <button
      id="theme-toggle"
      className="theme-toggle-btn"
      onClick={() => toggleTheme()}
      aria-label={`Toggle theme. Current theme is ${theme}`}
      title="Toggle light/dark theme"
    >
      <span className="theme-icon" aria-hidden="true">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
};

export default ThemeToggle;
