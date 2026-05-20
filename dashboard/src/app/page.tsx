"use client";
import { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import StatsCards from '@/components/StatsCards';
import AttackTimeline from '@/components/AttackTimeline';
import TopCredentials from '@/components/TopCredentials';
import LiveFeed from '@/components/LiveFeed';
import WorldHeatmap from '@/components/WorldHeatmap';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    async function initDashboard() {
      try {
        // 1. Fetch runtime config from our API
        const configRes = await fetch('/api/config');
        const config = await configRes.json();

        if (!config.url || !config.anonKey) {
          console.error("Supabase config missing from API");
          return;
        }

        // 2. Initialize Supabase Client with REAL keys
        const client = createClient(config.url, config.anonKey);
        setSupabase(client);

        // 3. Fetch initial data
        const res = await fetch('/api/events');
        const json = await res.json();
        setData(json);
        setRealtimeEvents(json.recentEvents || []);

        // 4. Setup Realtime
        const channel = client
          .channel('public:honeypot_events')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'honeypot_events' }, 
          (payload) => {
            setRealtimeEvents(prev => [payload.new, ...prev].slice(0, 20));
          })
          .subscribe();

        return () => {
          client.removeChannel(channel);
        };
      } catch (err) {
        console.error("Failed to initialize dashboard", err);
      }
    }

    initDashboard();
  }, []);

  if (!data || !supabase) return (
    <div className="bg-[#0a0f1e] min-h-screen text-white flex flex-col items-center justify-center font-mono">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="animate-pulse">ESTABLISHING SECURE CONNECTION...</p>
    </div>
  );

  const mapMarkers = realtimeEvents
    .filter(e => e.latitude && e.longitude)
    .map((e, i) => ({
      name: `${e.city || e.country_code}-${i}`,
      coordinates: [e.longitude, e.latitude] as [number, number],
      count: 1
    }));

  return (
    <main className="bg-[#0a0f1e] min-h-screen p-6 text-white font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-red-500 flex items-center">
              <span className="mr-2">🛡️</span> HONEYTRAP SOC
            </h1>
            <p className="text-gray-500 text-sm">Real-time Threat Intelligence Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest">System Status</p>
            <p className="text-green-500 font-mono text-sm">● OPERATIONAL</p>
          </div>
        </header>

        <StatsCards stats={data.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WorldHeatmap markers={mapMarkers} />
          <AttackTimeline data={data.timeline} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TopCredentials credentials={data.topCredentials || []} />
          </div>
          <div className="lg:col-span-2">
            <LiveFeed events={realtimeEvents} />
          </div>
        </div>
      </div>
    </main>
  );
}
