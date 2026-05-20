"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimelineData {
  time: string;
  ssh: number;
  http: number;
}

export default function AttackTimeline({ data }: { data: TimelineData[] }) {
  return (
    <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-lg h-[300px]">
      <h3 className="text-white font-semibold mb-4">Attack Timeline (24h)</h3>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Area type="monotone" dataKey="ssh" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
          <Area type="monotone" dataKey="http" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
