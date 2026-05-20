import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapProps {
  markers: Array<{
    name: string;
    coordinates: [number, number];
    count: number;
  }>;
}

export default function WorldHeatmap({ markers }: MapProps) {
  return (
    <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-lg flex flex-col items-center justify-center min-h-[400px] w-full">
      <h3 className="text-white font-semibold mb-4 w-full text-left flex justify-between">
        <span>Global Threat Heatmap</span>
        <span className="text-xs text-cyan-500 animate-pulse">● LIVE DATA</span>
      </h3>
      <div className="flex-1 w-full bg-gray-900/30 rounded-lg overflow-hidden border border-gray-800/50">
        <ComposableMap projectionConfig={{ scale: 140 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#334155", outline: "none" },
                    pressed: { outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map(({ name, coordinates, count }) => (
            <Marker key={name} coordinates={coordinates}>
              <circle r={Math.min(2 + count / 10, 10)} fill="#ef4444" fillOpacity={0.6} />
              <circle r={Math.min(2 + count / 10, 10)} fill="#ef4444" className="animate-ping" fillOpacity={0.3} />
            </Marker>
          ))}
        </ComposableMap>
      </div>
      <div className="w-full flex justify-between text-[10px] text-gray-500 mt-4 uppercase tracking-widest font-mono">
        <span>Active Zones: {markers.length}</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> High Intensity</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-700 rounded-full"></span> Neutral</span>
        </div>
      </div>
    </div>
  );
}
