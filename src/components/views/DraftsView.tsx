import { useState } from "react";
import type { Spark, Settings, Draft } from "../../types";
import { DraftCard } from "../DraftCard";
import { ArrowLeftIcon, RefreshIcon, TrashIcon } from "../icons/Icons";
import { generateDrafts } from "../../utils/ai";

interface DraftsViewProps {
  spark: Spark;
  settings: Settings;
  onBack: () => void;
  onUpdateSpark: (id: string, updates: Partial<Spark>) => void;
  onDeleteSpark: (id: string) => void;
  onCopy: (text: string) => void;
  onSendToLinkedIn: (text: string) => void;
}

export function DraftsView({
  spark,
  settings,
  onBack,
  onUpdateSpark,
  onDeleteSpark,
  onCopy,
  onSendToLinkedIn,
}: DraftsViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!settings.apiKey) {
      setError("Please add your OpenAI API key in Settings first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const drafts = await generateDrafts({
        text: spark.text,
        pageTitle: spark.pageTitle,
        url: spark.url,
        persona: settings.persona,
        apiKey: settings.apiKey,
      });

      onUpdateSpark(spark.id, { drafts });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate drafts"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Delete this Spark and all its drafts?")) {
      onDeleteSpark(spark.id);
      onBack();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <button className="back-btn" onClick={onBack} style={{ margin: 0 }}>
          <ArrowLeftIcon />
          Back
        </button>
        <button
          className="icon-btn"
          onClick={handleDelete}
          title="Delete Spark"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Spark Preview */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-md)",
          marginBottom: "var(--space-lg)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-tertiary)",
            marginBottom: "4px",
          }}
        >
          {spark.domain}
        </p>
        <h4 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
          {spark.pageTitle}
        </h4>
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          "{spark.text.slice(0, 150)}
          {spark.text.length > 150 ? "..." : ""}"
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
            marginBottom: "var(--space-lg)",
            color: "var(--color-error)",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      {/* Drafts or Generate Button */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {spark.drafts && spark.drafts.length > 0 ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ fontSize: "13px", fontWeight: 600 }}>
                Generated Drafts
              </h3>
              <button
                className="btn btn--ghost"
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{ padding: "4px 8px", fontSize: "11px" }}
              >
                <RefreshIcon />
                Regenerate
              </button>
            </div>
            {spark.drafts.map((draft: Draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onCopy={onCopy}
                onSendToLinkedIn={onSendToLinkedIn}
              />
            ))}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "32px 16px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginBottom: "16px",
              }}
            >
              Ready to transform this into LinkedIn posts?
            </p>
            <button
              className="btn btn--primary btn--lg"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="spinner" />
                  Generating...
                </>
              ) : (
                "Generate Drafts"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
