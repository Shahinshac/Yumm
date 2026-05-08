import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminOverview';
import { useApp } from '../../context/AppContext';
import { MapPin, Navigation, Signal, Battery, Bike, Car } from 'lucide-react';

// Mock driver data
const generateDrivers = () => Array.from({ length: 8 }).map((_, i) => ({
  id: `DRV-${1000 + i}`,
  name: ['Alex Rider', 'Sam Bridges', 'Sarah Connor', 'John Matrix', 'Ellen Ripley', 'Arthur Morgan', 'Lara Croft', 'Nathan Drake'][i],
  status: i < 3 ? 'active' : i < 6 ? 'delivering' : 'offline',
  vehicle: i % 3 === 0 ? 'Bike' : 'Car',
  battery: Math.floor(Math.random() * 60) + 40,
  lat: 50 + (Math.random() * 40 - 20), // mock % positions
  lng: 50 + (Math.random() * 40 - 20),
}));

export default function AdminDriverFleet() {
  const [drivers, setDrivers] = useState(generateDrivers());

  // Simulate movement
  useEffect(() => {
    const i = setInterval(() => {
      setDrivers(prev => prev.map(d => {
        if (d.status === 'offline') return d;
        return {
          ...d,
          lat: d.lat + (Math.random() * 2 - 1),
          lng: d.lng + (Math.random() * 2 - 1),
          battery: Math.max(0, d.battery - 0.1)
        };
      }));
    }, 3000);
    return () => clearInterval(i);
  }, []);

  const activeCount = drivers.filter(d => d.status !== 'offline').length;

  return (
    <AdminLayout active="drivers">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-lexend font-black text-3xl tracking-tight text-charcoal">Fleet Command Center</h1>
          <p className="text-on-surface-variant font-medium mt-1">Live GPS tracking and logistics optimization</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
            <Signal className="w-4 h-4 animate-pulse" />
            {activeCount} Active Units
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Radar Map Simulation */}
        <div className="lg:col-span-2 card-premium p-1 relative overflow-hidden bg-charcoal group">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          {/* Radar Sweep */}
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -ml-[400px] -mt-[400px] border border-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -ml-[200px] -mt-[200px] border border-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-white/10 -mt-[0.5px]"></div>
          <div className="absolute top-1/2 left-1/2 w-[1px] h-full bg-white/10 -ml-[0.5px]"></div>
          
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -ml-[200px] -mt-[200px] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(168,51,0,0.4)_90deg,transparent_90deg)] animate-[spin_4s_linear_infinite]"></div>

          {/* Driver Markers */}
          {drivers.map(driver => (
            <div 
              key={driver.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
              style={{ left: `${driver.lng}%`, top: `${driver.lat}%` }}
            >
              <div className="relative group/marker cursor-pointer">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] flex items-center justify-center ${
                  driver.status === 'active' ? 'bg-green-500' : driver.status === 'delivering' ? 'bg-orange-500' : 'bg-gray-500'
                }`}>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-white/90 backdrop-blur shadow-xl rounded-lg p-2 opacity-0 group-hover/marker:opacity-100 transition-opacity z-10 pointer-events-none">
                  <p className="font-bold text-xs text-charcoal">{driver.name}</p>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase">{driver.status}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
            <div className="bg-black/50 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-white/70 font-mono text-xs">
              SYS.MAP.v4.2 // LIVE TRACKING
            </div>
          </div>
        </div>

        {/* Fleet List */}
        <div className="card-premium p-0 flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container/50">
            <h3 className="font-lexend font-bold text-charcoal">Fleet Roster</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {drivers.map(driver => (
              <div key={driver.id} className="p-3 rounded-xl border border-outline-variant/30 hover:border-primary/30 transition-colors flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  driver.status === 'active' ? 'bg-green-500' : driver.status === 'delivering' ? 'bg-orange-500' : 'bg-gray-300'
                }`}>
                  {driver.vehicle === 'Bike' ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-charcoal truncate">{driver.name}</h4>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{driver.id} • {driver.status}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end text-xs font-bold text-on-surface-variant">
                    {Math.floor(driver.battery)}% <Battery className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[10px] text-primary font-bold mt-0.5">GPS OK</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
