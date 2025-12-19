
import React, { useState } from 'react';
import { OrderInput, TransportMode } from '../types';

interface TrackingFormProps {
  onTrack: (input: OrderInput) => void;
  isLoading: boolean;
}

const TrackingForm: React.FC<TrackingFormProps> = ({ onTrack, isLoading }) => {
  const [formData, setFormData] = useState<OrderInput>({
    trackingId: '',
    transportMode: 'road',
    phoneNumber: '',
    address: '',
    userOrderId: '',
    state: '',
    district: '',
    pincode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTrack(formData);
  };

  const modes: { id: TransportMode; label: string; icon: string }[] = [
    { id: 'road', label: 'By Road', icon: 'truck' },
    { id: 'rail', label: 'By Rail', icon: 'train' },
  ];

  const isRail = formData.transportMode === 'rail';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Transport Mode Selection</label>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setFormData({ ...formData, transportMode: mode.id })}
              className={`p-3 rounded-md border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                formData.transportMode === mode.id
                  ? 'bg-red-50 border-red-200 text-[#E31E24] ring-1 ring-red-500'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <i className={`fa-solid fa-${mode.icon} text-lg`}></i>
              <span className="text-[10px] font-bold uppercase">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-600 uppercase">
            {isRail ? 'Official Train Number' : 'Vehicle / Tracking Number'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
               <i className="fa-solid fa-barcode text-sm"></i>
            </div>
            <input
              type="text"
              required
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all text-sm font-medium"
              placeholder={isRail ? "e.g. 12952 Mumbai Rajdhani" : "e.g. DL-01-AB-1234"}
              value={formData.trackingId}
              onChange={(e) => setFormData({ ...formData, trackingId: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 uppercase">Registered Mobile No.</label>
            <input
              type="tel"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all text-sm font-medium"
              placeholder="+91"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 uppercase">Consignment Order ID</label>
            <input
              type="text"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all text-sm font-medium"
              placeholder="Ref Number"
              value={formData.userOrderId}
              onChange={(e) => setFormData({ ...formData, userOrderId: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-4 flex items-center">
          <span className="w-4 h-[1px] bg-gray-200 mr-2"></span>
          Origin Location Data
          <span className="w-4 h-[1px] bg-gray-200 ml-2"></span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">State</label>
            <input
              type="text"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm outline-none focus:border-red-500"
              placeholder="e.g. Delhi"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">City/Hub</label>
            <input
              type="text"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm outline-none focus:border-red-500"
              placeholder="e.g. New Delhi"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Pincode</label>
            <input
              type="text"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm outline-none focus:border-red-500"
              placeholder="6 digits"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-600 uppercase">Final Delivery Address</label>
        <textarea
          required
          rows={2}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all resize-none text-sm font-medium"
          placeholder="Complete drop-off location details..."
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full group india-post-bg-red hover:bg-red-700 text-white font-black py-4 rounded-md shadow-lg transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
      >
        <i className="fa-solid fa-crosshairs group-hover:scale-125 transition-transform"></i>
        <span>INITIALIZE TRACKING</span>
      </button>

      <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center justify-center space-x-3 text-[9px] font-bold text-gray-400 uppercase">
        <span className="flex items-center"><i className="fa-solid fa-shield-halved text-emerald-600 mr-1"></i> Govt-Grade Trace</span>
        <span className="flex items-center"><i className="fa-solid fa-satellite text-emerald-600 mr-1"></i> Sat-Link Active</span>
        <span className="flex items-center"><i className="fa-solid fa-clock text-emerald-600 mr-1"></i> Real-time Sync</span>
      </div>
    </form>
  );
};

export default TrackingForm;
