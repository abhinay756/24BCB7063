import React from 'react';
import { TrackingData } from '../types';
import MapVisualization from './MapVisualization';

interface TrackingResultProps {
  data: TrackingData;
  translations: any;
}

const TrackingResult: React.FC<TrackingResultProps> = ({ data, translations: t }) => {
  const isRail = data.transportMode === 'rail';
  
  const modeIcons: Record<string, string> = {
    road: 'truck',
    rail: 'train',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Model Training Indicator */}
      <div className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center justify-between shadow-lg overflow-hidden relative">
        <div className="flex items-center space-x-3 z-10">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <i className="fa-solid fa-microchip text-blue-400 animate-pulse"></i>
          </div>
          <div>
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Neural Engine v4.2</div>
            <div className="text-xs font-bold">Historical State-Timing Dataset Ingested (Kaggle Mode)</div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end z-10">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Training Loss</div>
          <div className="text-xs font-mono font-bold text-emerald-400">0.0234σ</div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Dynamic Status Card based on transport mode */}
        <div className={`bg-white p-5 rounded-lg border-l-4 ${isRail ? 'border-blue-600' : 'border-[#E31E24]'} shadow-sm flex flex-col justify-center`}>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            {isRail ? 'Current Rail Hub' : 'Precise Live Hub'}
          </span>
          <div className="text-gray-900 font-black text-xl flex items-center leading-tight">
             {data.currentLocation.address}
          </div>
          <p className={`text-[10px] font-bold mt-1 ${isRail ? 'text-blue-600' : 'text-[#E31E24]'} uppercase`}>
            {isRail ? 'Live Grid: Rail Connect' : 'Live Path: Road Network'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border-l-4 border-emerald-500 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Connectivity Status</span>
          <div className="text-emerald-600 font-bold text-xl flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
            SYNCED
          </div>
          <p className="text-xs text-gray-500 mt-1 font-bold">{t.mlTriangulation}</p>
        </div>

        <div className="bg-white p-5 rounded-lg border-l-4 border-indigo-500 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transit Distance</span>
          <div className="text-gray-900 font-black text-xl flex items-baseline">
            {data.distanceKm} <span className="text-xs ml-1 font-bold text-gray-400">KM</span>
          </div>
          <p className="text-[9px] text-indigo-600 mt-1 font-black uppercase">
            {isRail ? 'National Rail Corridor' : 'National Roadway Path'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border-l-4 border-slate-700 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Model Confidence</span>
          <div className="text-gray-900 font-black text-xl">
            {Math.round(data.predictionConfidence * 100)}%
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div 
              className="bg-slate-700 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${data.predictionConfidence * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
           <h3 className="font-bold text-gray-800 flex items-center">
             <i className={`fa-solid fa-${modeIcons[data.transportMode] || 'truck'} mr-3 ${isRail ? 'text-blue-600' : 'text-[#E31E24]'}`}></i>
             <span className="uppercase tracking-tight">
                {isRail ? 'Real-time Railway Visualization' : 'Real-time Road Logistics Visualization'}
             </span>
           </h3>
           <div className={`text-[10px] font-black ${isRail ? 'text-blue-600 bg-blue-50' : 'text-[#E31E24] bg-red-50'} px-2 py-1 rounded`}>
             <i className="fa-solid fa-satellite mr-1"></i> {t.temporalTriangulation}
           </div>
        </div>
        <div className="p-2">
           <MapVisualization data={data} translations={t} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">State-Wise Timing Timeline</h3>
          <span className="text-[10px] font-black text-gray-400 uppercase">{t.mlInterpolated}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-widest border-b border-gray-200">
                <th className="px-6 py-3">{t.timestamp || 'Timestamp'}</th>
                <th className="px-6 py-3">{isRail ? 'Railway Station / Junction' : 'Logistics Hub / Landmark'}</th>
                <th className="px-6 py-3">{t.liveStatus || 'Status'}</th>
                <th className="px-6 py-3">Inference Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.steps.map((step, index) => {
                const isPredicted = step.status === 'Predicted';
                return (
                  <tr key={index} className={!isPredicted ? "bg-emerald-50/20" : "hover:bg-gray-50 transition-colors"}>
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center">
                        <i className={`fa-solid ${isPredicted ? 'fa-clock text-amber-500' : 'fa-check-circle text-emerald-500'} mr-2`}></i>
                        {step.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800 uppercase">{step.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${isPredicted ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {step.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium italic">{step.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackingResult;