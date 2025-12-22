import { useState } from "react";
import type { Draft } from "../types";
import {
  ZapIcon,
  EyeIcon,
  MessageIcon,
  CopyIcon,
  LinkedInIcon,
  CheckIcon,
} from "./icons/Icons";

interface DraftCardProps {
  draft: Draft;
  onCopy: (text: string) => void;
  onSendToLinkedIn: (text: string) => void;
}

const draftTypeLabels: Record<
  Draft["type"],
  { label: string; icon: React.ReactNode }
> = {
  tldr: { label: "TL;DR", icon: <ZapIcon /> },
  perspective: { label: "Perspective", icon: <EyeIcon /> },
  question: { label: "Question", icon: <MessageIcon /> },
};

export function DraftCard({ draft, onCopy, onSendToLinkedIn }: DraftCardProps) {
  const [copied, setCopied] = useState(false);
  const typeInfo = draftTypeLabels[draft.type];

  const handleCopy = () => {
    onCopy(draft.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="draft-card">
      <div className="draft-card__header">
        <div className="draft-card__type">
          <div
            className={`draft-card__type-icon draft-card__type-icon--${draft.type}`}
          >
            {typeInfo.icon}
          </div>
          <span>{typeInfo.label}</span>
        </div>
      </div>

      <div className="draft-card__content">
        <p className="draft-card__text">{draft.content}</p>
      </div>

      <div className="draft-card__actions">
        <button className="btn btn--ghost" onClick={handleCopy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          className="btn btn--linkedin"
          onClick={() => onSendToLinkedIn(draft.content)}
          style={{ marginLeft: "auto" }}
        >
          <LinkedInIcon />
          Post to LinkedIn
        </button>
      </div>
    </div>
  );
}
