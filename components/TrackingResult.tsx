
import React from 'react';
import { TrackingData, TransportMode } from '../types';
import MapVisualization from './MapVisualization';

interface TrackingResultProps {
  data: TrackingData;
}

const TrackingResult: React.FC<TrackingResultProps> = ({ data }) => {
  const modeIcons: Record<TransportMode, string> = {
    road: 'truck',
    rail: 'train',
  };

  const modeLabels: Record<TransportMode, string> = {
    road: 'Road Logistics Path',
    rail: 'Rail Telemetry Grid',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* High-level status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border-l-4 border-emerald-500 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Event</span>
          <div className="text-emerald-600 font-bold text-xl flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
            In Transit
          </div>
          <p className="text-xs text-gray-500 mt-1 font-bold">{data.steps[0]?.status}</p>
        </div>

        <div className="bg-white p-5 rounded-lg border-l-4 border-[#E31E24] shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Delivery</span>
          <div className="text-gray-900 font-black text-xl flex items-center">
            {data.eta}
          </div>
          <p className="text-xs text-[#E31E24] mt-1 font-bold">Latency: {data.trafficInfo.delayMinutes} Mins</p>
        </div>

        <div className="bg-white p-5 rounded-lg border-l-4 border-indigo-500 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trace Integrity</span>
          <div className="text-gray-900 font-black text-xl">
            {Math.round(data.predictionConfidence * 100)}%
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${data.predictionConfidence * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Grounding Source Badge */}
      {data.groundingSources && data.groundingSources.length > 0 && (
        <div className="bg-[#fff9e6] p-3 rounded-md border border-[#ffeeba] flex items-center flex-wrap gap-4">
          <div className="flex items-center text-[10px] font-bold text-[#856404] uppercase tracking-wider">
            <i className="fa-solid fa-map-location-dot mr-2"></i>
            Source Validation:
          </div>
          <div className="flex flex-wrap gap-2">
            {data.groundingSources.map((source, i) => (
              <a 
                key={i} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-bold text-red-700 bg-white px-3 py-1 rounded border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                {source.title} <i className="fa-solid fa-up-right-from-square ml-1"></i>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
           <h3 className="font-bold text-gray-800 flex items-center">
             <i className={`fa-solid fa-${modeIcons[data.transportMode]} mr-3 text-[#E31E24]`}></i>
             {modeLabels[data.transportMode]}
           </h3>
           <div className="text-[10px] font-black text-[#E31E24] bg-red-50 px-2 py-1 rounded">
             <i className="fa-solid fa-satellite mr-1"></i> LIVE TELEMETRY
           </div>
        </div>
        <div className="p-2">
           <MapVisualization data={data} />
        </div>
      </div>

      {/* Timeline Section - Table style for official look */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Tracking Event Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-widest border-b border-gray-200">
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Hub Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.steps.map((step, index) => (
                <tr key={index} className={index === 0 ? "bg-red-50/30" : "hover:bg-gray-50"}>
                  <td className="px-6 py-4 font-bold text-red-600 whitespace-nowrap">{step.timestamp}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 uppercase">{step.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${index === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {step.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{step.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackingResult;
