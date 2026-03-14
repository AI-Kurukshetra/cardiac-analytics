import { VitalsTrendPoint } from "@/components/dashboard/types";

type VitalsTrendsSectionProps = {
  vitalsHistory: VitalsTrendPoint[];
};

type TrendSeriesConfig = {
  key: string;
  color: string;
  getValue: (reading: VitalsTrendPoint) => number | null;
};

type ChartCardProps = {
  title: string;
  description: string;
  value: string;
  unit: string;
  trendLabel: string;
  readingsLabel: string;
  chartTintClassName: string;
  legend?: { label: string; color: string }[];
  series: TrendSeriesConfig[];
  vitalsHistory: VitalsTrendPoint[];
};

type ChartDomain = {
  min: number;
  max: number;
  gridValues: number[];
};

type ChartPoint = {
  x: number;
  y: number;
};

const chartWidth = 320;
const chartHeight = 168;
const chartPaddingX = 16;
const chartPaddingY = 18;

function formatCompactDate(
  date: string | null | undefined,
  fallbackIndex: number,
) {
  if (!date) {
    return `R${fallbackIndex + 1}`;
  }

  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatNumericValue(value: number) {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1);
}

function formatDelta(delta: number, unit: string) {
  if (delta === 0) {
    return `No change vs previous ${unit}`;
  }

  const direction = delta > 0 ? "Up" : "Down";
  const amount = formatNumericValue(Math.abs(delta));

  return `${direction} ${amount} ${unit} vs previous`;
}

function buildChartDomain(seriesValues: Array<Array<number | null>>) {
  const validValues = seriesValues
    .flat()
    .filter((value): value is number => value !== null);

  if (!validValues.length) {
    return null;
  }

  const rawMin = Math.min(...validValues);
  const rawMax = Math.max(...validValues);
  const spread = rawMax - rawMin;
  const padding =
    spread === 0 ? Math.max(Math.abs(rawMax) * 0.08, 1) : spread * 0.14;
  const min = rawMin - padding;
  const max = rawMax + padding;

  return {
    min,
    max,
    gridValues: Array.from({ length: 4 }, (_, index) => {
      const ratio = index / 3;
      return max - ratio * (max - min);
    }),
  } satisfies ChartDomain;
}

function buildSeriesGeometry(
  values: Array<number | null>,
  domain: ChartDomain,
) {
  const drawableWidth = chartWidth - chartPaddingX * 2;
  const drawableHeight = chartHeight - chartPaddingY * 2;
  const stepX = values.length > 1 ? drawableWidth / (values.length - 1) : 0;
  const denominator = domain.max - domain.min || 1;
  const rawPoints = values.map((value, index) => {
    if (value === null) {
      return null;
    }

    const x = chartPaddingX + stepX * index;
    const ratio = (value - domain.min) / denominator;
    const y = chartHeight - chartPaddingY - ratio * drawableHeight;

    return { x, y };
  });

  let path = "";
  let hasGap = false;

  for (const point of rawPoints) {
    if (!point) {
      hasGap = true;
      continue;
    }

    if (!path || hasGap) {
      path += `${path ? " " : ""}M ${point.x} ${point.y}`;
      hasGap = false;
      continue;
    }

    path += ` L ${point.x} ${point.y}`;
  }

  return {
    path,
    points: rawPoints.filter((point): point is ChartPoint => point !== null),
  };
}

function TrendChartCard({
  title,
  description,
  value,
  unit,
  trendLabel,
  readingsLabel,
  chartTintClassName,
  legend,
  series,
  vitalsHistory,
}: ChartCardProps) {
  const seriesValues = series.map((config) =>
    vitalsHistory.map((reading) => config.getValue(reading)),
  );
  const domain = buildChartDomain(seriesValues);

  if (!domain) {
    return (
      <article className="rounded-[24px] border border-slate-200 bg-white/75 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {title}
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              {value}
            </h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            {readingsLabel}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-4 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Not enough readings yet to render this trend.
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white/75 p-5 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <h3 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{unit}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          {readingsLabel}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
          {trendLabel}
        </span>
        {legend?.length ? (
          <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-600">
            {legend.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div
        className={`mt-4 rounded-[22px] border border-white/70 p-4 ${chartTintClassName}`}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-44 w-full"
          role="img"
          aria-label={`${title} trend chart`}
        >
          {domain.gridValues.map((gridValue, index) => {
            const y =
              chartPaddingY +
              ((domain.max - gridValue) / (domain.max - domain.min || 1)) *
                (chartHeight - chartPaddingY * 2);

            return (
              <g key={`${title}-grid-${index}`}>
                <line
                  x1={chartPaddingX}
                  y1={y}
                  x2={chartWidth - chartPaddingX}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.24)"
                  strokeDasharray="4 5"
                />
                <text
                  x={chartWidth - chartPaddingX}
                  y={y - 6}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {formatNumericValue(gridValue)}
                </text>
              </g>
            );
          })}

          {series.map((config, index) => {
            const currentGeometry = buildSeriesGeometry(seriesValues[index], domain);

            if (!currentGeometry.path) {
              return null;
            }

            return (
              <g key={config.key}>
                <path
                  d={currentGeometry.path}
                  fill="none"
                  stroke={config.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {currentGeometry.points.map((point, pointIndex) => (
                  <circle
                    key={`${config.key}-${pointIndex}`}
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    fill={config.color}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        <span>{formatCompactDate(vitalsHistory[0]?.created_at, 0)}</span>
        <span>
          {formatCompactDate(
            vitalsHistory[vitalsHistory.length - 1]?.created_at,
            vitalsHistory.length - 1,
          )}
        </span>
      </div>
    </article>
  );
}

export function VitalsTrendsSection({
  vitalsHistory,
}: VitalsTrendsSectionProps) {
  const readingsCount = vitalsHistory.length;
  const latestReading = vitalsHistory.at(-1) ?? null;
  const previousReading = vitalsHistory.at(-2) ?? null;
  const weightReadings = vitalsHistory.filter(
    (reading) => reading.weight !== null,
  );
  const latestWeightReading = weightReadings.at(-1) ?? null;
  const previousWeightReading = weightReadings.at(-2) ?? null;
  const readingsLabel =
    readingsCount === 1 ? "1 reading" : `${readingsCount} readings`;

  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-3">
      <TrendChartCard
        title="Heart rate"
        description="Simple line view of recent beats per minute to make changes obvious in the demo."
        value={latestReading ? formatNumericValue(latestReading.heart_rate) : "No data"}
        unit="Latest bpm"
        trendLabel={
          latestReading && previousReading
            ? formatDelta(latestReading.heart_rate - previousReading.heart_rate, "bpm")
            : "First heart rate trend"
        }
        readingsLabel={readingsLabel}
        chartTintClassName="bg-[linear-gradient(180deg,rgba(236,253,245,0.92)_0%,rgba(255,255,255,0.9)_100%)]"
        series={[
          {
            key: "heart-rate",
            color: "#0f766e",
            getValue: (reading) => reading.heart_rate,
          },
        ]}
        vitalsHistory={vitalsHistory}
      />

      <TrendChartCard
        title="Blood pressure"
        description="Systolic and diastolic lines stay on the same chart for a compact dashboard view."
        value={
          latestReading
            ? `${latestReading.systolic_bp}/${latestReading.diastolic_bp}`
            : "No data"
        }
        unit="Latest mmHg"
        trendLabel={
          latestReading && previousReading
            ? `Sys ${formatDelta(
                latestReading.systolic_bp - previousReading.systolic_bp,
                "mmHg",
              )}`
            : "First blood pressure trend"
        }
        readingsLabel={readingsLabel}
        chartTintClassName="bg-[linear-gradient(180deg,rgba(240,249,255,0.94)_0%,rgba(255,255,255,0.9)_100%)]"
        legend={[
          { label: "Systolic", color: "#0284c7" },
          { label: "Diastolic", color: "#f59e0b" },
        ]}
        series={[
          {
            key: "systolic-bp",
            color: "#0284c7",
            getValue: (reading) => reading.systolic_bp,
          },
          {
            key: "diastolic-bp",
            color: "#f59e0b",
            getValue: (reading) => reading.diastolic_bp,
          },
        ]}
        vitalsHistory={vitalsHistory}
      />

      <TrendChartCard
        title="Weight"
        description="Recent weight entries are kept visible without adding more dashboard complexity."
        value={
          latestWeightReading?.weight !== null &&
          latestWeightReading?.weight !== undefined
            ? formatNumericValue(latestWeightReading.weight)
            : "No data"
        }
        unit="Latest kg"
        trendLabel={
          latestWeightReading?.weight !== null &&
          latestWeightReading?.weight !== undefined &&
          previousWeightReading?.weight !== null &&
          previousWeightReading?.weight !== undefined
            ? formatDelta(latestWeightReading.weight - previousWeightReading.weight, "kg")
            : "First weight trend"
        }
        readingsLabel={
          weightReadings.length === 1 ? "1 weight" : `${weightReadings.length} weights`
        }
        chartTintClassName="bg-[linear-gradient(180deg,rgba(245,250,255,0.94)_0%,rgba(255,255,255,0.9)_100%)]"
        series={[
          {
            key: "weight",
            color: "#2563eb",
            getValue: (reading) => reading.weight,
          },
        ]}
        vitalsHistory={vitalsHistory}
      />
    </div>
  );
}
