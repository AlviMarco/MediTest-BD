type ChartItem = {
  label: string;
  value: number;
  color?: string;
};

function compactNumber(value: number) {
  return Intl.NumberFormat('en', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export function MetricBarChart({ items }: { items: ChartItem[] }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="modern-chart">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Platform Overview</h3>
          <p className="text-xs text-slate-500">Live module counts</p>
        </div>
        <span className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">
          Today
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const width = Math.max((item.value / max) * 100, item.value > 0 ? 8 : 2);
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className="tabular-nums text-slate-500">{compactNumber(item.value)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="chart-bar h-2 rounded-full"
                  style={{
                    width: `${width}%`,
                    background: item.color || '#2563eb',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 34 - (value / max) * 28;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="h-12 w-full" viewBox="0 0 100 40" role="img" aria-label="Trend chart">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function FinanceBarChart({ items }: { items: ChartItem[] }) {
  const max = Math.max(...items.map((item) => Math.abs(item.value)), 1);

  return (
    <div className="modern-chart">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Financial Snapshot</h3>
        <p className="text-xs text-slate-500">Selected date range summary</p>
      </div>
      <div className="grid min-h-56 grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const height = Math.max((Math.abs(item.value) / max) * 100, item.value ? 8 : 2);
          return (
            <div key={item.label} className="flex h-52 flex-col justify-end gap-2">
              <div className="flex flex-1 items-end rounded-md bg-slate-50 px-2">
                <div
                  className="chart-bar w-full rounded-t-md"
                  style={{
                    height: `${height}%`,
                    background: item.color || '#2563eb',
                  }}
                />
              </div>
              <div className="min-h-12">
                <p className="truncate text-xs font-medium text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-500">{compactNumber(item.value)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
