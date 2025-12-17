import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GeminiService } from '../../services/geminiService';
import { Card, Button, Skeleton } from '../Shared';
import { Activity } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export const DisasterAgent = () => {
  const [summary, setSummary] = useState('');
  
  const sensors = [
    { id: 1, type: 'Seismic', name: 'Coastal Sensor A4', lat: 35.50, lng: 139.60, val: 'Mag 4.2', status: 'critical', color: '#ef4444' },
    { id: 2, type: 'Flood', name: 'River Gauge R2', lat: 35.65, lng: 139.80, val: '+2cm/h', status: 'warning', color: '#3b82f6' },
    { id: 3, type: 'Wind', name: 'Metro Weather Stn', lat: 35.70, lng: 139.70, val: '82 km/h', status: 'warning', color: '#f59e0b' },
    { id: 4, type: 'Normal', name: 'Inland Ref 1', lat: 35.72, lng: 139.68, val: 'Stable', status: 'normal', color: '#22c55e' },
    { id: 5, type: 'Seismic', name: 'Offshore Buoy', lat: 35.45, lng: 139.90, val: 'Mag 3.1', status: 'warning', color: '#f59e0b' },
  ];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const context = "Live sensors detect seismic activity magnitude 4.2 near coastal region. Wind speeds increasing to 80km/h in sector 4. Flood gauges rising 2cm/hour.";
      return GeminiService.generateText('gemini-2.5-flash', `Write a short, urgent disaster impact summary based on this data: ${context}`);
    },
    onSuccess: (data) => setSummary(data)
  });

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden h-[400px] border border-slate-200 dark:border-slate-700 shadow-lg relative z-0">
        <MapContainer 
          center={[35.65, 139.75]} 
          zoom={10} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {sensors.map((sensor) => (
            <CircleMarker 
              key={sensor.id}
              center={[sensor.lat, sensor.lng]}
              pathOptions={{ 
                color: sensor.color, 
                fillColor: sensor.color, 
                fillOpacity: 0.7, 
                weight: 2 
              }}
              radius={sensor.status === 'critical' ? 12 : 8}
            >
              <Popup>
                <div className="text-sm">
                  <strong className="block text-slate-800">{sensor.name}</strong>
                  <span className="text-xs font-semibold uppercase text-slate-500">{sensor.type}</span>
                  <div className="mt-1 font-mono font-bold" style={{ color: sensor.color }}>{sensor.val}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 p-3 rounded-lg shadow-md backdrop-blur-sm z-[400] text-xs space-y-2">
            <h4 className="font-bold border-b border-slate-200 pb-1 mb-1">Sensor Status</h4>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div> Critical</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Warning</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Monitoring</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Normal</div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg flex gap-2"><Activity className="w-5 h-5 text-red-500" /> Live Alert Feed</h3>
          {[
            { level: 'High', msg: 'Seismic spike detected at Coastal Sensor A4', time: 'Just now', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
            { level: 'Med', msg: 'Wind speed > 80km/h at Metro Station', time: '5m ago', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
            { level: 'Low', msg: 'Flood gauge R2 deviation +2%', time: '12m ago', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
          ].map((alert, i) => (
            <div key={i} className={`p-4 rounded-lg flex justify-between items-center ${alert.color}`}>
              <div>
                <span className="font-bold text-xs uppercase px-2 py-1 bg-white/50 rounded mr-2">{alert.level}</span>
                <span>{alert.msg}</span>
              </div>
              <span className="text-xs opacity-70">{alert.time}</span>
            </div>
          ))}
        </div>

        <Card className="p-6 flex flex-col h-full">
           <h3 className="font-bold mb-4">AI Impact Analysis</h3>
           <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm leading-relaxed overflow-y-auto min-h-[150px]">
             {generateMutation.isPending ? <Skeleton className="h-full w-full" /> : (summary || "Click generate to analyze current sensor topology and predict impact.")}
           </div>
           <Button className="mt-4 w-full" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
             Generate Summary
           </Button>
        </Card>
      </div>
    </div>
  );
};