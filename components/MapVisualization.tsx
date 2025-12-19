
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TrackingData } from '../types';

interface MapVisualizationProps {
  data: TrackingData;
  translations: any;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ data, translations: t }) => {
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

    const isRail = data.transportMode === 'rail';

    const driverIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="pulse-ring"></div>
          <div class="w-10 h-10 ${isRail ? 'bg-blue-600' : 'bg-[#E31E24]'} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
            <i class="fa-solid fa-${isRail ? 'train' : 'truck'}"></i>
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
      if (isRail) {
        // Railway track style: Dashed black and white
        L.polyline(segment.points as [number, number][], {
          color: '#334155',
          weight: 7,
          opacity: 0.9,
        }).addTo(map);
        L.polyline(segment.points as [number, number][], {
          color: '#ffffff',
          weight: 4,
          opacity: 1,
          dashArray: '10, 10'
        }).addTo(map);
      } else {
        let color = '#E31E24'; 
        if (segment.trafficDensity === 'moderate') color = '#f59e0b';
        if (segment.trafficDensity === 'heavy') color = '#ef4444';

        L.polyline(segment.points as [number, number][], {
          color: color,
          weight: 6,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
      }
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
            <div className={`text-[9px] font-black ${data.transportMode === 'rail' ? 'text-blue-600' : 'text-[#E31E24]'} uppercase tracking-widest`}>
              {data.transportMode === 'rail' ? 'Loco Pilot' : t.courierInCharge}
            </div>
            <div className="text-xs font-bold text-gray-800">{data.driver.name}</div>
            <div className="flex items-center text-[9px] text-gray-500 font-bold">
              ID: {data.driver.phone.slice(-6)} • {data.driver.vehicle}
            </div>
          </div>
        </div>
      </div>

      {data.groundingSources && data.groundingSources.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
          <div className="bg-white/95 p-2 rounded shadow-md border border-gray-200 flex flex-col space-y-1">
            <span className="text-[8px] font-black text-gray-400 uppercase">Verified Sources</span>
            {data.groundingSources.map((source, i) => (
              <a 
                key={i} 
                href={source.uri} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[9px] text-blue-600 hover:underline flex items-center font-bold"
              >
                <i className="fa-solid fa-map-location-dot mr-1"></i>
                {source.title.length > 15 ? source.title.slice(0, 15) + '...' : source.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Speed overlay removed as per user request */}
    </div>
  );
};

export default MapVisualization;
