import { useState } from "react";
import type { Settings } from "../../types";
import { ArrowLeftIcon, UserIcon, CheckIcon } from "../icons/Icons";

interface SettingsViewProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onBack: () => void;
}

export function SettingsView({ settings, onSave, onBack }: SettingsViewProps) {
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeftIcon />
        Back to Home
      </button>

      <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "24px" }}>
        Settings
      </h2>

      {/* Persona Section */}
      <div className="settings-section">
        <h3 className="settings-section__title">
          <UserIcon />
          Your Persona
        </h3>

        <div className="form-group">
          <label className="form-label">Role / Title</label>
          <input
            type="text"
            className="form-input"
            value={formData.persona.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                persona: { ...formData.persona, role: e.target.value },
              })
            }
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Industry</label>
          <input
            type="text"
            className="form-input"
            value={formData.persona.industry}
            onChange={(e) =>
              setFormData({
                ...formData,
                persona: { ...formData.persona, industry: e.target.value },
              })
            }
            placeholder="e.g., Technology, Finance, Healthcare"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tone / Voice</label>
          <input
            type="text"
            className="form-input"
            value={formData.persona.tone}
            onChange={(e) =>
              setFormData({
                ...formData,
                persona: { ...formData.persona, tone: e.target.value },
              })
            }
            placeholder="e.g., Professional yet conversational"
          />
        </div>
      </div>

      {/* API Key removed - handled by proxy server */}

      <button className="btn btn--primary btn--full" onClick={handleSave}>
        {saved ? (
          <>
            <CheckIcon />
            Saved!
          </>
        ) : (
          "Save Settings"
        )}
      </button>
    </div>
  );
}
