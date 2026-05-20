import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  console.log("Supabase Config Check:", {
    url: supabaseUrl,
    key_length: supabaseKey?.length,
    key_prefix: supabaseKey?.substring(0, 10)
  });
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }
  try {
    const results = await Promise.all([
      supabase.rpc('get_dashboard_stats'),
      supabase.from('honeypot_events').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.rpc('get_timeline_stats'),
      supabase.rpc('get_top_credentials')
    ]);

    console.log("API Fetch Results:", JSON.stringify(results.map(r => ({ 
      error: r.error, 
      count: Array.isArray(r.data) ? r.data.length : (r.data ? 1 : 0) 
    }))));

    const [{ data: dashboardStats }, { data: recentEvents }, { data: timelineData }, { data: topCredsData }] = results;

    return NextResponse.json({
      stats: {
        totalAttacks: dashboardStats?.total_attacks || 0,
        uniqueIps: dashboardStats?.unique_ips || 0,
        topCountry: dashboardStats?.top_country || "N/A",
        mostTargeted: (dashboardStats?.ssh_count > dashboardStats?.http_count) ? "SSH" : "HTTP"
      },
      recentEvents: recentEvents || [],
      timeline: timelineData || [],
      topCredentials: topCredsData || []
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
