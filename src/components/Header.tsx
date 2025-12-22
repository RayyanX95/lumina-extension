import { SettingsIcon, HistoryIcon, SparkIcon } from "./icons/Icons";
import type { View } from "../types";

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  return (
    <header className="header">
      <div
        className="header__logo"
        onClick={() => onNavigate("home")}
        style={{ cursor: "pointer" }}
      >
        <div className="header__logo-icon">
          <SparkIcon />
        </div>
        <span className="header__title">Lumina</span>
      </div>

      <div className="header__actions">
        <button
          className={`icon-btn ${
            currentView === "history" ? "icon-btn--active" : ""
          }`}
          onClick={() => onNavigate("history")}
          title="History"
        >
          <HistoryIcon />
        </button>
        <button
          className={`icon-btn ${
            currentView === "settings" ? "icon-btn--active" : ""
          }`}
          onClick={() => onNavigate("settings")}
          title="Settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
}
