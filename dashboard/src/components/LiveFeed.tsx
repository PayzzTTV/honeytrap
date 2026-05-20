interface Event {
  created_at: string;
  ip_address: string;
  protocol: string;
  username?: string;
  password?: string;
  http_path?: string;
  country_code?: string;
  threat_score: number;
}

export default function LiveFeed({ events }: { events: Event[] }) {
  return (
    <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-lg flex flex-col h-full">
      <h3 className="text-white font-semibold mb-4">Live Threat Feed</h3>
      <div className="space-y-2 overflow-y-auto flex-1 font-mono text-xs">
        {events.map((event, i) => (
          <div key={i} className="border-l-2 border-red-500 pl-3 py-1 bg-gray-900/50 rounded-r">
            <span className="text-gray-500">[{new Date(event.created_at).toLocaleTimeString()}]</span>
            <span className="ml-2 text-yellow-500">{event.country_code || 'LOCAL'}</span>
            <span className="ml-2 text-white">{event.ip_address}</span>
            <span className="ml-2 text-cyan-400">→ {event.protocol}</span>
            <span className="ml-2 text-gray-400 truncate max-w-[200px] inline-block align-bottom">
              {event.protocol === 'SSH' ? `${event.username}/${event.password}` : event.http_path}
            </span>
            <span className={`ml-auto float-right ${event.threat_score > 50 ? 'text-red-500' : 'text-orange-500'}`}>
              (score: {event.threat_score})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
