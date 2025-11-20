import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function AverageRatingChart() {
  const data = [
  { month: "Oct", rating: 4.8 },
  { month: "Nov", rating: 4.5 },
];

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.5)",
        padding: "1.5rem",
        borderRadius: "12px",
        border: "1px solid rgba(185,28,28,0.4)",
        marginTop: "2rem",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1rem",
          color: "white",
          fontSize: "1.7rem",
        }}
      >
        📊 Average Rating Over Time
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="month" stroke="#ccc" />
          <YAxis domain={[0, 5]} stroke="#ccc" />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #b91c1c" }}
            labelStyle={{ color: "white" }}
            itemStyle={{ color: "#b91c1c" }}
          />

          <Line
            type="monotone"
            dataKey="avg"
            stroke="#b91c1c"
            strokeWidth={3}
            dot={{ stroke: "#fff", strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AverageRatingChart;
