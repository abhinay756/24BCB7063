import React, { useState, useEffect, useMemo } from 'react';
import TrackingForm from './components/TrackingForm';
import TrackingResult from './components/TrackingResult';
import QuickHelp from './components/QuickHelp';
import { getTrackingPrediction } from './services/geminiService';
import { OrderInput, TrackingData } from './types';

export type Language = 'en' | 'hi' | 'te';

const translations = {
  en: {
    govOfIndia: "GOVERNMENT OF INDIA",
    bharatSarkar: "भारत सरकार",
    skipToMain: "Skip to Main Content",
    login: "Login",
    departmentOfPosts: "Department of Posts",
    ministryOfComm: "Ministry of Communications",
    quickHelp: "Quick Help",
    trackNTrace: "Track N Trace",
    analyzing: "Analyzing Consignment",
    trackingFailed: "Tracking Failed",
    tryAgain: "Try Again",
    consignmentStatus: "Consignment Status",
    noTrackingData: "No Tracking Data",
    noTrackingDesc: "Please enter your consignment details in the form to initialize the real-time logistics triangulation.",
    aboutUs: "About Us",
    services: "Services",
    quickLinks: "Quick Links",
    connect: "Connect",
    footerCopyright: "© 2024 Department of Posts, Ministry of Communications, Government of India.",
    accessibility: "Accessibility",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    // Form Labels
    phoneLabel: "Registered Mobile No.",
    orderIdLabel: "Order ID / Post ID",
    originData: "Origin Location Data",
    destData: "Destination Location Data",
    state: "State",
    city: "City/Hub",
    pincode: "Pincode",
    finalAddress: "Final Delivery Address",
    initBtn: "INITIALIZE TRACKING",
    // Result Boxes
    liveStatus: "Live Status",
    nextHub: "Next Hub Arrival",
    modelAccuracy: "Model Accuracy",
    neuralLocked: "Neural Locked",
    mlTriangulation: "ML Triangulation Active",
    predictedAt: "Predicted @",
    outForDelivery: "Out for Delivery",
    nationalPath: "National Logistics Path",
    temporalTriangulation: "TEMPORAL TRIANGULATION",
    predictedTimeline: "Predicted Hub Timeline",
    mlInterpolated: "ML Interpolated",
    // Map Overlays
    courierInCharge: "Courier In-Charge",
    carrierFeed: "Carrier Feed",
    transitGridNotice: "Tracking via National Transit Grid",
    agent: "Agent",
    // Help
    helpTitle: "Logistics Assistant",
    helpDesc: "How can I assist you with your consignment today?",
    typeMessage: "Type your query..."
  },
  hi: {
    govOfIndia: "भारत सरकार",
    bharatSarkar: "भारत सरकार",
    skipToMain: "मुख्य सामग्री पर जाएं",
    login: "लॉगिन",
    departmentOfPosts: "डाक विभाग",
    ministryOfComm: "संचार मंत्रालय",
    quickHelp: "त्वरित सहायता",
    trackNTrace: "ट्रैक एंड ट्रेस",
    analyzing: "परिवहन विश्लेषण",
    trackingFailed: "ट्रैकिंग विफल रही",
    tryAgain: "पुनः प्रयास करें",
    consignmentStatus: "खेप की स्थिति",
    noTrackingData: "कोई ट्रैकिंग डेटा नहीं",
    noTrackingDesc: "वास्तविक समय रसद त्रिभुजन शुरू करने के लिए कृपया फॉर्म में अपना विवरण दर्ज करें।",
    aboutUs: "हमारे बारे में",
    services: "सेवाएं",
    quickLinks: "त्वरित लिंक",
    connect: "जुड़ें",
    footerCopyright: "© 2024 डाक विभाग, संचार मंत्रालय, भारत सरकार।",
    accessibility: "अभिगम्यता",
    privacy: "गोपनीयता नीति",
    terms: "नियम और शर्तें",
    // Form Labels
    phoneLabel: "पंजीकृत मोबाइल नंबर",
    orderIdLabel: "ऑर्डर आईडी / पोस्ट आईडी",
    originData: "मूल स्थान डेटा",
    destData: "गंतव्य स्थान डेटा",
    state: "राज्य",
    city: "शहर/हब",
    pincode: "पिनकोड",
    finalAddress: "अंतिम वितरण पता",
    initBtn: "ट्रैकिंग शुरू करें",
    // Result Boxes
    liveStatus: "लाइव स्थिति",
    nextHub: "अगला हब आगमन",
    modelAccuracy: "मॉडल सटीकता",
    neuralLocked: "न्यूरल लॉक",
    mlTriangulation: "ML त्रिभुजन सक्रिय",
    predictedAt: "पूर्वानुमानित @",
    outForDelivery: "वितरण के लिए तैयार",
    nationalPath: "राष्ट्रीय रसद पथ",
    temporalTriangulation: "सामयिक त्रिभुजन",
    predictedTimeline: "पूर्वानुमानित हब समयरेखा",
    mlInterpolated: "ML इंटरपोलेटेड",
    // Map Overlays
    courierInCharge: "कूरियर प्रभारी",
    carrierFeed: "कैरियर फीड",
    transitGridNotice: "राष्ट्रीय पारगमन ग्रिड के माध्यम से ट्रैकिंग",
    agent: "agent",
    // Help
    helpTitle: "रसद सहायक",
    helpDesc: "आज मैं आपकी खेप में आपकी क्या सहायता कर सकता हूँ?",
    typeMessage: "अपना प्रश्न लिखें..."
  },
  te: {
    govOfIndia: "భారత ప్రభుత్వం",
    bharatSarkar: "భారత ప్రభుత్వం",
    skipToMain: "ప్రధాన కంటెంట్‌కు వెళ్లండి",
    login: "లాగిన్",
    departmentOfPosts: "తంతి తపాలా శాఖ",
    ministryOfComm: "కమ్యూనికేషన్ల మంత్రిత్వ శాఖ",
    quickHelp: "త్వరిత సహాయం",
    trackNTrace: "ట్రాక్ అండ్ ట్రేస్",
    analyzing: "రవాణా విశ్లేషణ జరుగుతోంది",
    trackingFailed: "ట్రాకింగ్ విఫలమైంది",
    tryAgain: "మళ్ళీ ప్రయత్నించు",
    consignmentStatus: "రవాణా స్థితి",
    noTrackingData: "ట్రాకింగ్ డేటా లేదు",
    noTrackingDesc: "రియల్ టైమ్ లాజిస్టిక్స్ విశ్లేషణను ప్రారంభించడానికి దయచేసి ఫారమ్‌లో మీ వివరాలను నమోదు చేయండి.",
    aboutUs: "మా గురించి",
    services: "సేవలు",
    quickLinks: "త్వరిత లింకులు",
    connect: "సంప్రదించండి",
    footerCopyright: "© 2024 తంతి తపాలా శాఖ, కమ్యూనికేషన్ల మంత్రిత్వ శాఖ,భారత ప్రభుత్వం.",
    accessibility: "యాక్సెసిబిలిటీ",
    privacy: "గోపనీయత విధానం",
    terms: "నిబంధనలు & షరతులు",
    // Form Labels
    phoneLabel: "నమోదిత మొబైల్ నంబర్",
    orderIdLabel: "ఆర్డర్ ఐడి / పోస్ట్ ఐడి",
    originData: "ప్రారంభ స్థాన సమాచారం",
    destData: "గమ్యస్థాన సమాచారం",
    state: "రాష్ట్రం",
    city: "నగరం/హబ్",
    pincode: "పిన్‌కోడ్",
    finalAddress: "చివరి డెలివరీ చిరునామా",
    initBtn: "ట్రాకింగ్‌ను ప్రారంభించండి",
    // Result Boxes
    liveStatus: "లైవ్ స్థితి",
    nextHub: "తదుపరి హబ్ రాక",
    modelAccuracy: "మోడల్ ఖచ్చితత్వం",
    neuralLocked: "న్యూరల్ లాక్ చేయబడింది",
    mlTriangulation: "ML ట్రయాంగులేషన్ సక్రియంగా ఉంది",
    predictedAt: "అంచనా వేయబడింది @",
    outForDelivery: "డెలివరీకి బయలుదేరింది",
    nationalPath: "జాతీయ లాజిస్టిక్స్ మార్గం",
    temporalTriangulation: "టెంపోరల్ ట్రయాంగులేషన్",
    predictedTimeline: "అంచనా హబ్ టైమ్‌లైన్",
    mlInterpolated: "ML ఇంటర్‌పోలేటెడ్",
    // Map Overlays
    courierInCharge: "కొరియర్ ఇన్‌చార్జ్",
    carrierFeed: "క్యారియర్ ఫీడ్",
    transitGridNotice: "నేషనల్ ట్రాన్సిట్ గ్రిడ్ ద్వారా ట్రాకింగ్",
    agent: "agent",
    // Help
    helpTitle: "లాజిస్టిక్స్ అసిస్టెంట్",
    helpDesc: "ఈరోజు మీ రవాణాకు సంబంధించి నేను మీకు ఎలా సహాయపడగలను?",
    typeMessage: "మీ సందేహాన్ని టైప్ చేయండి..."
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('te');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [showHelp, setShowHelp] = useState(false);

  const t = useMemo(() => translations[lang], [lang]);

  const loadingMessages = useMemo(() => {
    if (lang === 'te') {
      return [
        "ఇండియా పోస్ట్ ట్రాకింగ్ గేట్‌వేకి కనెక్ట్ అవుతోంది...",
        "రవాణా సమాచారాన్ని సేకరిస్తోంది...",
        "ప్రాంతీయ హబ్‌ల ద్వారా మార్గాన్ని విశ్లేషిస్తోంది...",
        "నేషనల్ లాజిస్టిక్స్ గ్రిడ్‌తో సింక్ అవుతోంది...",
        "చివరి మైలు డెలివరీ స్థితిని అంచనా వేస్తోంది..."
      ];
    }
    if (lang === 'hi') {
      return [
        "इंडिया पोस्ट ट्रैकिंग गेटवे से जुड़ रहा है...",
        "खेप का डेटा प्राप्त किया जा रहा है...",
        "क्षेत्रीय हब के माध्यम से पथ का त्रिकोणीकरण...",
        "नेशनल लॉजिस्टिक्स ग्रिड के साथ सिंक हो रहा है...",
        "लास्ट माइल डिलीवरी स्थिति का अनुमान लगाया जा रहा है..."
      ];
    }
    return [
      "Connecting to India Post Tracking Gateway...",
      "Retrieving Consignment Data...",
      "Triangulating Path via Regional Hubs...",
      "Syncing with National Logistics Grid...",
      "Predicting Final Mile Delivery Status..."
    ];
  }, [lang]);

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
  }, [loading, loadingMessages]);

  const handleTrack = async (input: OrderInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrackingPrediction(input, userCoords, lang);
      await new Promise(resolve => setTimeout(resolve, 2500));
      setTrackingData(data);
      setTimeout(() => {
        const resultEl = document.getElementById('results-view');
        resultEl?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError(lang === 'te' ? "రవాణా సమాచారాన్ని ట్రాక్ చేయడం సాధ్యపడలేదు. వివరాలను సరిచూసుకోండి." : "Unable to track consignment. Please check details.");
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
      {/* Top Gov Banner with National Emblem */}
      <div className="gov-banner py-2 px-4 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] md:text-xs font-medium text-gray-600">
          <div className="flex items-center space-x-3">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png" 
              alt="National Emblem of India" 
              className="h-8 md:h-10 w-auto object-contain"
            />
            <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
              <span className="font-bold text-gray-800">{t.bharatSarkar}</span>
              <span className="hidden md:inline text-gray-300">|</span>
              <span className="uppercase text-gray-500 font-semibold">{t.govOfIndia}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hover:text-red-600 transition-colors uppercase hidden md:inline">{t.skipToMain}</button>
            <div className="border-l border-gray-300 h-3 mx-2 hidden md:inline"></div>
            <div className="flex space-x-3 font-bold text-[11px]">
              <button 
                onClick={() => setLang('en')} 
                className={`transition-colors hover:text-red-600 ${lang === 'en' ? 'text-red-600' : ''}`}
              >A (English)</button>
              <button 
                onClick={() => setLang('hi')} 
                className={`transition-colors hover:text-red-600 ${lang === 'hi' ? 'text-red-600' : ''}`}
              >अ (हिंदी)</button>
              <button 
                onClick={() => setLang('te')} 
                className={`transition-colors hover:text-red-600 ${lang === 'te' ? 'text-red-600' : ''}`}
              >తె (తెలుగు)</button>
            </div>
            <div className="border-l border-gray-300 h-3 mx-2"></div>
            <div className="flex items-center space-x-1 cursor-pointer hover:text-red-600 transition-colors">
              <i className="fa-solid fa-user-circle text-gray-400"></i>
              <span>{t.login}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Official Header */}
      <header className="bg-white border-b-4 border-[#E31E24] py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center cursor-pointer shrink-0" onClick={resetTracking}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/India_Post_Logo.svg/1200px-India_Post_Logo.svg.png" 
              alt="India Post Logo" 
              className="h-12 md:h-16 w-auto object-contain mr-4"
            />
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none tracking-tighter italic">
                <span className="text-[#E31E24]">INDIA</span> POST
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                {t.departmentOfPosts}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.ministryOfComm}</div>
             <div className="h-1 w-24 bg-red-100 mt-1 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-2/3"></div>
             </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-8 text-xs font-bold text-gray-700 shrink-0">
            <button 
              onClick={() => setShowHelp(true)}
              className="hover:text-red-600 transition-colors uppercase tracking-wider flex items-center"
            >
              <i className="fa-solid fa-circle-info mr-2 opacity-50"></i>
              {t.quickHelp}
            </button>
            <button className="bg-[#E31E24] text-white px-5 py-2 rounded-full hover:bg-red-700 transition-all shadow-md active:scale-95 uppercase tracking-widest text-[10px]">
              {t.trackNTrace}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
               <div className="india-post-bg-red p-6 text-white">
                  <h2 className="text-xl font-black tracking-tighter flex items-center italic">
                    <i className="fa-solid fa-location-crosshairs mr-3"></i>
                    {t.trackNTrace}
                  </h2>
                  <p className="text-[10px] text-red-100 font-bold uppercase mt-1 tracking-widest opacity-80">{t.departmentOfPosts} - ML Neural Interface</p>
               </div>
               <div className="p-6 md:p-8">
                 <TrackingForm 
                  onTrack={handleTrack} 
                  isLoading={loading} 
                  translations={t} 
                  lang={lang}
                 />
               </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {loading ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed border-red-200 p-12 text-center">
                 <div className="relative mb-8">
                    <div className="w-24 h-24 border-8 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <i className="fa-solid fa-satellite-dish text-3xl text-red-600 animate-pulse"></i>
                    </div>
                 </div>
                 <h3 className="text-xl font-black text-gray-900 mb-2 italic tracking-tight">{t.analyzing}</h3>
                 <p className="text-gray-500 text-sm font-medium animate-pulse">{loadingMessages[loadingStep]}</p>
              </div>
            ) : error ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-red-50 rounded-lg border border-red-200 p-12 text-center">
                 <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mb-4">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                 </div>
                 <h3 className="text-xl font-black text-gray-900 mb-2 italic">{t.trackingFailed}</h3>
                 <p className="text-gray-600 text-sm mb-6 max-w-sm">{error}</p>
                 <button 
                  onClick={() => setError(null)}
                  className="bg-red-600 text-white px-8 py-2 rounded font-bold hover:bg-red-700 transition-colors uppercase text-xs"
                 >
                   {t.tryAgain}
                 </button>
              </div>
            ) : trackingData ? (
              <div id="results-view">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic">
                    <span className="text-[#E31E24]">///</span> {t.consignmentStatus}
                  </h2>
                </div>
                <TrackingResult data={trackingData} translations={t} />
              </div>
            ) : (
              <div className="h-full min-h-[500px] bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100">
                  <i className="fa-solid fa-box-open text-5xl text-gray-200"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tighter italic">{t.noTrackingData}</h3>
                <p className="text-gray-500 text-sm max-w-md font-medium leading-relaxed">
                  {t.noTrackingDesc}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#1e293b] text-gray-400 py-16 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6 italic">{t.aboutUs}</h4>
              <ul className="space-y-3 text-xs font-bold">
                <li><a href="#" className="hover:text-red-500 transition-colors">History</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Mission & Vision</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6 italic">{t.services}</h4>
              <ul className="space-y-3 text-xs font-bold">
                <li><a href="#" className="hover:text-red-500 transition-colors">Mails</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Banking</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-[10px] font-bold">{t.footerCopyright}</p>
          </div>
        </div>
      </footer>

      {showHelp && (
        <QuickHelp 
          onClose={() => setShowHelp(false)} 
          translations={t} 
          lang={lang} 
          currentTrackingData={trackingData}
        />
      )}
    </div>
  );
};

export default App;