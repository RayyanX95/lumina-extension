import type { Spark } from "../../types";
import { SparkCard } from "../SparkCard";
import { EmptyState } from "../EmptyState";
import { PlusIcon } from "../icons/Icons";

interface HomeViewProps {
  sparks: Spark[];
  onSparkClick: (spark: Spark) => void;
  onAddDemo: () => void;
}

export function HomeView({ sparks, onSparkClick, onAddDemo }: HomeViewProps) {
  if (sparks.length === 0) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <EmptyState
          title="No Sparks Yet"
          text="Highlight any text on a webpage and right-click to capture it as a Spark. We'll help you turn it into a LinkedIn post."
        />
        <div style={{ padding: "0 24px 24px", marginTop: "auto" }}>
          <button className="btn btn--secondary btn--full" onClick={onAddDemo}>
            <PlusIcon />
            Add Demo Spark
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Your Sparks
        </h2>
        <span className="badge badge--primary">{sparks.length}</span>
      </div>

      {sparks.map((spark) => (
        <SparkCard
          key={spark.id}
          spark={spark}
          onClick={() => onSparkClick(spark)}
        />
      ))}
    </div>
  );
}
