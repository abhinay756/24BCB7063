
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TrackingData } from '../types';

interface MapVisualizationProps {
  data: TrackingData;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ data }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([data.currentLocation.lat, data.currentLocation.lng], 14);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    const modeIconsMap = {
      road: 'truck',
      rail: 'train',
    };

    const driverIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="pulse-ring"></div>
          <div class="w-10 h-10 bg-[#E31E24] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
            <i class="fa-solid fa-${modeIconsMap[data.transportMode as keyof typeof modeIconsMap] || 'location-dot'}"></i>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const houseIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="w-10 h-10 bg-[#1e293b] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
          <i class="fa-solid fa-house-flag"></i>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    data.route.forEach(segment => {
      let color = '#E31E24'; // India Post Red
      if (segment.trafficDensity === 'moderate') color = '#f59e0b';
      if (segment.trafficDensity === 'heavy') color = '#ef4444';

      L.polyline(segment.points as [number, number][], {
        color: color,
        weight: 6,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: data.transportMode === 'rail' ? '1, 10' : undefined // Rail road visual
      }).addTo(map);
    });

    const driverMarker = L.marker([data.currentLocation.lat, data.currentLocation.lng], { icon: driverIcon }).addTo(map);
    const destinationMarker = L.marker([data.destinationLocation.lat, data.destinationLocation.lng], { icon: houseIcon }).addTo(map);

    const group = L.featureGroup([driverMarker, destinationMarker]);
    map.fitBounds(group.getBounds().pad(0.3));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [data]);

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-200 relative group shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Overlays */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-white/95 p-3 rounded shadow-md border border-gray-200 flex items-center space-x-3 pointer-events-auto">
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${data.driver.name}`} alt="Agent" />
          </div>
          <div>
            <div className="text-[9px] font-black text-[#E31E24] uppercase tracking-widest">Courier In-Charge</div>
            <div className="text-xs font-bold text-gray-800">{data.driver.name}</div>
            <div className="flex items-center text-[9px] text-gray-500 font-bold">
              ID: {data.driver.phone.slice(-6)} • {data.driver.vehicle}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-white/95 p-3 rounded shadow-md border border-gray-200 pointer-events-auto w-[200px]">
           <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Carrier Feed</div>
           <div className="flex items-end space-x-2">
              <div className="text-2xl font-black text-gray-900 tracking-tighter">
                {data.driver.speed}
              </div>
           </div>
           <p className="text-[9px] text-gray-500 mt-1 font-medium italic">
             Tracking via National Transit Grid
           </p>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;
