import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Calendar, LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import { Complaint } from "@/lib/api";

type ChartMode = "category" | "ward";

const WARD_COLORS = ["#0b756d", "#10b981", "#f59e0b", "#0284c7", "#8b5cf6"];

export function TrendCharts({ complaints }: { complaints: Complaint[] }) {
  const [mode, setMode] = useState<ChartMode>("category");
  const [days, setDays] = useState<7 | 14 | 30>(14);

  const { data, topWards } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const cutoff = new Date(today);
    cutoff.setDate(today.getDate() - days);

    const visible = complaints.filter(
      (c) => new Date(c.createdAt).getTime() >= cutoff.getTime()
    );

    // Identify top 4 wards
    const wardCounts: Record<string, number> = {};
    complaints.forEach((c) => {
      const w = c.ward.split("·")[1]?.trim() || c.ward;
      wardCounts[w] = (wardCounts[w] || 0) + 1;
    });
    const topWardsList = Object.entries(wardCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([w]) => w);

    // Build day buckets
    const chartData = Array.from({ length: days }, (_, idx) => {
      const d = new Date(cutoff);
      d.setDate(cutoff.getDate() + idx + 1);
      const dayKey = d.toISOString().slice(0, 10);

      // Find complaints for this date
      const bucket = visible.filter(
        (c) => new Date(c.createdAt).toISOString().slice(0, 10) === dayKey
      );

      const row: Record<string, string | number> = {
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        Garbage: bucket.filter((c) => c.category === "garbage").length,
        Pothole: bucket.filter((c) => c.category === "pothole").length,
      };

      topWardsList.forEach((ward) => {
        row[ward] = bucket.filter((c) => c.ward.includes(ward)).length;
      });

      return row;
    });

    return { data: chartData, topWards: topWardsList };
  }, [complaints, days]);

  return (
    <section className="paper-card trend-charts-card" style={{ padding: "20px 24px", marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "20px",
          borderBottom: "1px solid #e1eee9",
          paddingBottom: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "#e6f6f2",
                color: "#0b756d",
                display: "grid",
                placeItems: "center",
              }}
            >
              <TrendingUp size={16} />
            </span>
            <strong style={{ fontSize: "15px", color: "#11362e" }}>
              Bengaluru Civic Issue Trends
            </strong>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#62877c" }}>
            Daily reported volume across Bengaluru wards with category breakdowns.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Days selector */}
          <div className="filter-group" role="group" aria-label="Days window">
            {([7, 14, 30] as const).map((d) => (
              <button
                key={d}
                type="button"
                className={`filter-button ${days === d ? "active" : ""}`}
                style={{ fontSize: "11px", padding: "4px 9px" }}
                onClick={() => setDays(d)}
              >
                {d}d
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="filter-group" role="group" aria-label="Chart mode">
            <button
              type="button"
              className={`filter-button ${mode === "category" ? "active" : ""}`}
              style={{ fontSize: "11px", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: "5px" }}
              onClick={() => setMode("category")}
            >
              <LineChartIcon size={12} /> Category
            </button>
            <button
              type="button"
              className={`filter-button ${mode === "ward" ? "active" : ""}`}
              style={{ fontSize: "11px", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: "5px" }}
              onClick={() => setMode("ward")}
            >
              <BarChart3 size={12} /> Top Wards
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: "260px", width: "100%" }}>
        {mode === "category" ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#ebf3f0" vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#62877c" }}
                tickLine={false}
                axisLine={{ stroke: "#d3e7df" }}
                interval={days > 14 ? 2 : 0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#62877c" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #b5d8cb",
                  backgroundColor: "#0d221e",
                  color: "#e5f5f0",
                  fontSize: "11px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Line
                type="monotone"
                dataKey="Garbage"
                stroke="#0b756d"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0b756d" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Pothole"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#f59e0b" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#ebf3f0" vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#62877c" }}
                tickLine={false}
                axisLine={{ stroke: "#d3e7df" }}
                interval={days > 14 ? 2 : 0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#62877c" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #b5d8cb",
                  backgroundColor: "#0d221e",
                  color: "#e5f5f0",
                  fontSize: "11px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              {topWards.map((ward, idx) => (
                <Bar
                  key={ward}
                  dataKey={ward}
                  fill={WARD_COLORS[idx % WARD_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export default TrendCharts;
