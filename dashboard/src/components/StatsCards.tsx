import { Shield, Activity, Globe, Zap } from 'lucide-react';

interface Stats {
  totalAttacks: number;
  uniqueIps: number;
  topCountry: string;
  mostTargeted: string;
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Total Attacks (24h)', value: stats.totalAttacks, icon: Shield, color: 'text-red-500' },
    { label: 'Unique IPs', value: stats.uniqueIps, icon: Globe, color: 'text-cyan-500' },
    { label: 'Top Country', value: stats.topCountry, icon: Zap, color: 'text-yellow-500' },
    { label: 'Most Targeted', value: stats.mostTargeted, icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-[#0f172a] border border-gray-800 p-4 rounded-lg flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-gray-900 ${card.color}`}>
            <card.icon size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
