
import React, { useState, useEffect } from 'react';
import TrackingForm from './components/TrackingForm';
import TrackingResult from './components/TrackingResult';
import { getTrackingPrediction } from './services/geminiService';
import { OrderInput, TrackingData } from './types';

const App: React.FC = () => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  const loadingMessages = [
    "Connecting to India Post Tracking Gateway...",
    "Retrieving Consignment Data...",
    "Triangulating Path via Regional Hubs...",
    "Syncing with National Logistics Grid...",
    "Predicting Final Mile Delivery Status..."
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => console.debug("Geolocation access denied.")
      );
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleTrack = async (input: OrderInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrackingPrediction(input, userCoords);
      await new Promise(resolve => setTimeout(resolve, 2500));
      setTrackingData(data);
      setTimeout(() => {
        const resultEl = document.getElementById('results-view');
        resultEl?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Unable to track consignment. Please check the tracking ID and origin details.");
    } finally {
      setLoading(false);
    }
  };

  const resetTracking = () => {
    setTrackingData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      {/* Top Gov Banner */}
      <div className="gov-banner py-1 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] md:text-xs font-medium text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/National_emblem_of_India_logo.png" className="h-4" alt="National Emblem" />
              <span>भारत सरकार | GOVERNMENT OF INDIA</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hover:text-red-600 transition-colors uppercase">Skip to Main Content</button>
            <div className="border-l border-gray-300 h-3 mx-2"></div>
            <div className="flex space-x-2 font-bold">
              <span>अ</span>
              <span>A</span>
            </div>
            <div className="border-l border-gray-300 h-3 mx-2"></div>
            <div className="flex items-center space-x-1">
              <i className="fa-solid fa-user-circle text-gray-400"></i>
              <span>Login</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Official Header */}
      <header className="bg-white border-b-4 border-[#E31E24] py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Branding - EXACTLY AS PER IMAGE, REDUCED SIZE */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={resetTracking}>
            <div className="flex items-center space-x-2 md:space-x-3">
              <style>
                {`
                .pillar-logo {
                  width: 45px;
                  height: 60px;
                  background: url(data:image/png;base64,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) no-repeat center;
                  background-size: contain;
                }
                .branding-wrapper {
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                }
                .logo-hindi {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                }
                .wing-logo {
                  width: 45px;
                  height: 30px;
                  background: url(https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/India_Post_Logo.svg/1200px-India_Post_Logo.svg.png) no-repeat center;
                  background-size: contain;
                }
                .logo-english {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                `}
              </style>
              <div className="branding-wrapper">
                <div className="pillar-logo" title="National Emblem"></div>
                <div className="flex items-center gap-1.5">
                  <div className="logo-hindi">
                    <span className="text-[#E31E24] text-base font-bold font-hindi leading-none">भारतीय डाक</span>
                    <span className="text-[#E31E24] text-[7px] font-bold font-hindi leading-tight">डाक सेवा-जन सेवा</span>
                  </div>
                  <div className="logo-english">
                    <div className="wing-logo"></div>
                    <span className="text-[#E31E24] text-base font-bold leading-none">India Post</span>
                    <span className="text-[#E31E24] text-[7px] font-bold leading-tight">Dak Sewa-Jan Sewa</span>
                  </div>
                </div>
                {/* Department Text */}
                <div className="ml-3 border-l border-gray-200 pl-3 hidden lg:block">
                  <h1 className="text-[#E31E24] text-base font-black leading-tight">
                    Department of Posts
                  </h1>
                  <p className="text-[9px] font-bold text-gray-900 uppercase">
                    Government of India
                  </p>
                  <p className="text-[9px] text-gray-500 font-medium">Ministry of Communications</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Center (INCREASED LENGTH) */}
          <div className="flex-1 max-w-2xl w-full pt-4 md:pt-0">
            <div className="relative search-focus group border-2 border-gray-200 rounded-lg overflow-hidden transition-all flex items-center bg-gray-50">
              <input 
                type="text" 
                placeholder="Namaste! What can I find for you?" 
                className="w-full py-3 px-4 bg-transparent outline-none text-sm font-medium"
              />
              <button className="p-3 text-gray-400 hover:text-[#E31E24]">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>

          {/* Right Logos */}
          <div className="flex items-center space-x-6 shrink-0">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Swachh_Bharat_Abhiyan_logo.svg/1200px-Swachh_Bharat_Abhiyan_logo.svg.png" className="h-8 md:h-10" alt="Swachh Bharat" />
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png" className="h-8 md:h-10" alt="Digital India" />
          </div>
        </div>
      </header>

      {/* Hero Section / Service Indicator */}
      <div className="india-post-bg-yellow py-2 shadow-inner">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-700">
            <span className="hover:text-red-600 cursor-pointer">Home</span>
            <i className="fa-solid fa-chevron-right mx-2 text-[8px] opacity-50"></i>
            <span className="hover:text-red-600 cursor-pointer">Quick Help</span>
            <i className="fa-solid fa-chevron-right mx-2 text-[8px] opacity-50"></i>
            <span className="text-red-600">Track N Trace</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="india-post-bg-red p-4 text-white flex items-center justify-between">
                <h2 className="font-bold text-lg">Track N Trace</h2>
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div className="p-6 md:p-8">
                <TrackingForm onTrack={handleTrack} isLoading={loading} />
              </div>
            </div>

            {/* Help Cards */}
            <div className="mt-6 space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-start space-x-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <i className="fa-solid fa-circle-question"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Help on Tracking?</h4>
                  <p className="text-xs text-gray-500">Need help understanding your tracking status? Read our FAQ.</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-start space-x-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Dak Sewa - Jan Sewa</h4>
                  <p className="text-xs text-gray-500">Public Grievance cell and helpline information.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results / Loading */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="bg-white h-full rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center p-20 min-h-[400px]">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-gray-100 border-t-[#E31E24] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/India_Post_Logo.svg/1200px-India_Post_Logo.svg.png" className="h-8 grayscale opacity-50" alt="Loader Logo" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Consignment</h3>
                  <p className="text-[#E31E24] font-medium animate-pulse">{loadingMessages[loadingStep]}</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-100 rounded-lg p-10 flex flex-col items-center text-center">
                <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
                <h3 className="text-xl font-bold text-red-900 mb-2">Tracking Failed</h3>
                <p className="text-red-700 font-medium mb-6">{error}</p>
                <button onClick={() => setError(null)} className="px-6 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700">Try Again</button>
              </div>
            ) : trackingData ? (
              <div id="results-view" className="space-y-6">
                 <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Consignment Status</h2>
                      <p className="text-sm text-gray-500 font-bold uppercase">ID: {trackingData.orderId}</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 border border-gray-200 rounded hover:bg-gray-50"><i className="fa-solid fa-print"></i></button>
                       <button className="p-2 border border-gray-200 rounded hover:bg-gray-50"><i className="fa-solid fa-share-nodes"></i></button>
                    </div>
                 </div>
                 <TrackingResult data={trackingData} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-10 flex flex-col items-center justify-center text-center min-h-[500px]">
                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-magnifying-glass-location text-5xl text-gray-200"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Tracking Data</h3>
                <p className="text-gray-500 max-w-sm">Please enter your consignment details in the form to initialize the real-time logistics triangulation.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Government Directory Footer */}
      <footer className="bg-gray-800 text-white mt-20 pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-bold text-lg mb-6 border-b border-gray-700 pb-2">About Us</h4>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li className="hover:text-white cursor-pointer">Who we are</li>
                <li className="hover:text-white cursor-pointer">Citizen Charter</li>
                <li className="hover:text-white cursor-pointer">Financial Results</li>
                <li className="hover:text-white cursor-pointer">Employee Corner</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 border-b border-gray-700 pb-2">Services</h4>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li className="hover:text-white cursor-pointer">Mail Services</li>
                <li className="hover:text-white cursor-pointer">Banking & Remittance</li>
                <li className="hover:text-white cursor-pointer">Insurance (PLI/RPLI)</li>
                <li className="hover:text-white cursor-pointer">Philately</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 border-b border-gray-700 pb-2">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li className="hover:text-white cursor-pointer">Forms Download</li>
                <li className="hover:text-white cursor-pointer">Calculate Postage</li>
                <li className="hover:text-white cursor-pointer">Find Pincode</li>
                <li className="hover:text-white cursor-pointer">Dak Ticket</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 border-b border-gray-700 pb-2">Connect</h4>
              <div className="flex space-x-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <i className="fa-brands fa-facebook-f"></i>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-400 transition-colors cursor-pointer">
                  <i className="fa-brands fa-twitter"></i>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                  <i className="fa-brands fa-youtube"></i>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-relaxed">
                Contact us: 1800 266 6868 <br />
                Business Hours: 09:00 AM - 06:00 PM
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">
            <div className="text-center md:text-left">
              © 2024 Department of Posts, Ministry of Communications, Government of India.
            </div>
            <div className="flex items-center space-x-6">
              <span className="hover:text-white cursor-pointer">Accessibility</span>
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms & Conditions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
