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
             src="data:image/png;base64,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"
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