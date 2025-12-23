import { LightbulbIcon } from "./icons/Icons";

interface EmptyStateProps {
  title: string;
  text: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, text, icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon || <LightbulbIcon />}</div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__text">{text}</p>
    </div>
  );
}
