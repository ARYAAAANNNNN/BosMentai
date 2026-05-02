import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "1 Des",  visitors: 80  },
  { date: "8 Des",  visitors: 130 },
  { date: "16 Des", visitors: 95  },
  { date: "24 Des", visitors: 190 },
  { date: "31 Des", visitors: 155 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg shadow-md px-3 py-2">
        <p className="text-[10px] font-bold text-gray-500">{label}</p>
        <p className="text-xs font-bold text-teal-600">{payload[0].value} pesanan</p>
      </div>
    );
  }
  return null;
};

export default function VisitorChart() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
      <h2 className="text-sm font-bold text-gray-800 mb-4">
        Grafik Pesanan Pengunjung
      </h2>

      <ResponsiveContainer width="100%" height={185}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: -22, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F3F4F6"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 250]}
            ticks={[0, 50, 100, 150, 200]}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E5E7EB" }} />
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="#0D9488"
            strokeWidth={2.5}
            dot={{ fill: "#0D9488", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#0D9488", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
