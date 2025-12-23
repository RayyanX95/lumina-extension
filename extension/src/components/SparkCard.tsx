import type { Spark } from "../types";

interface SparkCardProps {
  spark: Spark;
  onClick: () => void;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export function SparkCard({ spark, onClick }: SparkCardProps) {
  return (
    <div className="spark-card" onClick={onClick}>
      <div className="spark-card__header">
        <div className="spark-card__source">
          <img
            className="spark-card__favicon"
            src={getFaviconUrl(spark.domain)}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="spark-card__domain">{spark.domain}</span>
        </div>
        <span className="spark-card__time">
          {formatTimeAgo(spark.capturedAt)}
        </span>
      </div>

      <h4 className="spark-card__title">{spark.pageTitle}</h4>
      <p className="spark-card__text">{spark.text}</p>

      {spark.drafts && spark.drafts.length > 0 && (
        <div style={{ marginTop: "8px" }}>
          <span className="badge badge--success">
            {spark.drafts.length} drafts
          </span>
        </div>
      )}
    </div>
  );
}
