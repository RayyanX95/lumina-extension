import type { Spark } from "../../types";
import { SparkCard } from "../SparkCard";
import { EmptyState } from "../EmptyState";
import { ArrowLeftIcon, HistoryIcon } from "../icons/Icons";

interface HistoryViewProps {
  sparks: Spark[];
  onSparkClick: (spark: Spark) => void;
  onBack: () => void;
}

export function HistoryView({
  sparks,
  onSparkClick,
  onBack,
}: HistoryViewProps) {
  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeftIcon />
        Back to Home
      </button>

      <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
        Spark History
      </h2>

      {sparks.length === 0 ? (
        <EmptyState
          title="No History"
          text="Your captured Sparks will appear here."
          icon={<HistoryIcon />}
        />
      ) : (
        sparks.map((spark) => (
          <SparkCard
            key={spark.id}
            spark={spark}
            onClick={() => onSparkClick(spark)}
          />
        ))
      )}
    </div>
  );
}
