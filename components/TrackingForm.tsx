import React, { useState, useEffect, useRef } from 'react';
import { OrderInput } from '../types';

interface TrackingFormProps {
  onTrack: (input: OrderInput) => void;
  isLoading: boolean;
  translations: any;
  lang: 'en' | 'hi' | 'te';
}

const INDIAN_STATES = {
  en: ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"],
  hi: ["आंध्र प्रदेश", "अरुणाचल प्रदेश", "असम", "बिहार", "छत्तीसगढ़", "गोवा", "गुजरात", "हरियाणा", "हिमाचल प्रदेश", "झारखंड", "कर्नाटक", "केरल", "मध्य प्रदेश", "महाराष्ट्र", "मणिपुर", "मेघालय", "मिजोरम", "नागालैंड", "ओडिशा", "पंजाब", "राजस्थान", "सिक्किम", "तमिलनाडु", "तेलंगाना", "त्रिपुरा", "उत्तर प्रदेश", "उत्तराखंड", "पश्चिम बंगाल", "दिल्ली"],
  te: ["ఆంధ్రప్రదేశ్", "అరుణాచల్ ప్రదేశ్", "అస్సాం", "బీహార్", "ఛత్తీస్‌గఢ్", "గోవా", "గుజరాత్", "హర్యానా", "హిమాచల్ ప్రదేశ్", "జార్ఖండ్", "కర్ణాటక", "కేరళ", "మధ్యప్రదేశ్", "మహారాష్ట్ర", "మణిపూర్", "మేఘాలయ", "మిజోరం", "నాగాలెండ్", "ఒడిశా", "పంజాబ్", "రాజస్థాన్", "సిక్కిం", "తమిళనాడు", "తెలంగాణ", "త్రిపుర", "ఉత్తర్ ప్రదేశ్", "ఉత్తరాఖండ్", "పశ్చిమ బెంగాల్", "ఢిల్లీ"]
};

const CITY_DATA: Record<string, Record<string, string[]>> = {
  en: {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Anantapur", "Kakinada"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Rohtak"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Kalaburagi"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur"],
    "Manipur": ["Imphal", "Thoubal", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura", "Jowai"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Prayagraj", "Ghaziabad", "Noida"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol", "Bardhaman"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Dwarka"]
  },
  hi: {
    "आंध्र प्रदेश": ["विशाखापत्तनम", "विजयवाड़ा", "गुंटूर"],
    "अरुणाचल प्रदेश": ["ईटानगर"],
    "असम": ["गुवाहाटी"],
    "बिहार": ["पटना", "गया", "भागलपुर", "मुजफ्फरपुर"],
    "छत्तीसगढ़": ["रायपुर", "भिलाई"],
    "गोवा": ["पणजी"],
    "गुजरात": ["अहमदाबाद", "सूरत", "वडोदरा", "राजकोट"],
    "हरियाणा": ["गुरुग्राम", "फरीदाबाद", "पानीपत"],
    "हिमाचल प्रदेश": ["शिमला", "मनाली"],
    "झारखंड": ["रांची", "जमशेदपुर"],
    "कर्नाटक": ["बेंगलुरु", "मैसूर"],
    "केरल": ["तिరువన్తపురమ్", "కోచ్చి"],
    "मध्य प्रदेश": ["इन्दौर", "भोपाल", "ग्वालियर"],
    "महाराष्ट्र": ["मुंबई", "पुणे", "नागपुर", "ठाणे", "नासिक"],
    "मणिपुर": ["इम्फाल"],
    "मेघालय": ["शिलांग"],
    "ओडिशा": ["भुवनेश्वर", "कटक"],
    "पंजाब": ["लुधियाना", "अमृतसर", "जालंधर"],
    "राजस्थान": ["जयपुर", "जोधपुर", "कोटा", "बीकानेर"],
    "तमिलनाडु": ["चेन्नई", "कोयंबटूर"],
    "तेलंगाना": ["హైదరాబాద్", "వరంగల్"],
    "उत्तर प्रदेश": ["लखनऊ", "कानपुर", "वाराणसी", "आगरा", "मेरठ", "प्रयागराज", "नोएडा"],
    "उत्तराखंड": ["देहरादून", "हरिद्वार"],
    "पश्चिम बंगाल": ["कोलकाता", "सिलीगुड़ी"],
    "दिल्ली": ["नई दिल्ली", "पुरानी दिल्ली"]
  },
  te: {
    "ఆంధ్రప్రదేశ్": ["విశాఖపట్నం", "విజయవాడ", "గుంటూరు", "నెల్లూరు", "కర్నూలు", "తిరుపతి", "కాకినాడ"],
    "అస్సాం": ["గువహాటి"],
    "బీహార్": ["పాట్నా"],
    "గుజరాత్": ["అహ్మదాబాద్", "సూరత్"],
    "హర్యానా": ["గురుగ్రామ్"],
    "కర్ణాటక": ["బెంగళూరు", "మైసూర్", "హుబ్లీ"],
    "కేరళ": ["తిరువనంతపురం", "కొచ్చి"],
    "మధ్యప్రదేశ్": ["ఇండోర్", "భోపాల్"],
    "మహారాష్ట్ర": ["ముంబై", "పూణే", "నాగ్‌పూర్"],
    "ఒడిశా": ["భువనేశ్వర్"],
    "పంజాబ్": ["అమృతసర్"],
    "రాజస్థాన్": ["జైపూర్"],
    "తమిళనాడు": ["చెన్నై", "కోయంబత్తూర్"],
    "తెలంగాణ": ["హైదరాబాద్", "వరంగల్", "నిజామాబాద్", "ఖమ్మం", "కరీంనగర్"],
    "ఉత్తర్ ప్రదేశ్": ["లక్నో", "కాన్పూర్", "వారణాసి"],
    "పశ్చిమ బెంగాల్": ["కోల్‌కతా"],
    "ఢిల్లీ": ["న్యూ ఢిల్లీ"]
  }
};

const TrackingForm: React.FC<TrackingFormProps> = ({ onTrack, isLoading, translations: t, lang }) => {
  const [formData, setFormData] = useState<OrderInput>({
    transportMode: 'road', 
    phoneNumber: '', 
    userOrderId: '', 
    originState: '', 
    originCity: '', 
    originPincode: '',
    destState: '',
    destCity: '',
    destPincode: ''
  });

  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<{ type: 'state' | 'city', field: 'origin' | 'dest' } | null>(null);
  const [errors, setErrors] = useState<{ 
    originCity?: string; 
    originPincode?: string; 
    destCity?: string; 
    destPincode?: string;
    phoneNumber?: string;
    userOrderId?: string;
  }>({});

  const containerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveInput(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStateChange = (val: string, field: 'origin' | 'dest') => {
    const stateKey = field === 'origin' ? 'originState' : 'destState';
    const cityKey = field === 'origin' ? 'originCity' : 'destCity';
    setFormData(prev => ({ ...prev, [stateKey]: val, [cityKey]: '' }));
    
    const allStates = INDIAN_STATES[lang];
    const filtered = allStates.filter(s => s.toLowerCase().includes(val.toLowerCase()));
    setStateSuggestions(filtered);
    setActiveInput({ type: 'state', field });
  };

  const handleCityChange = (val: string, field: 'origin' | 'dest') => {
    const cityKey = field === 'origin' ? 'originCity' : 'destCity';
    const stateVal = field === 'origin' ? formData.originState : formData.destState;
    setFormData(prev => ({ ...prev, [cityKey]: val }));
    
    const allCities = (CITY_DATA[lang] as any)[stateVal] || (CITY_DATA['en'] as any)[stateVal] || [];
    const filtered = allCities.filter((c: string) => c.toLowerCase().includes(val.toLowerCase()));
    setCitySuggestions(filtered);
    setActiveInput({ type: 'city', field });
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    const pinPattern = /^[1-9][0-9]{5}$/;

    if (!pinPattern.test(formData.originPincode)) {
      newErrors.originPincode = lang === 'te' ? 'సరైన పిన్‌కోడ్' : lang === 'hi' ? 'सही पिनकोड' : 'Invalid Pincode';
    }
    if (!pinPattern.test(formData.destPincode)) {
      newErrors.destPincode = lang === 'te' ? 'సరైన పిన్‌కోడ్' : lang === 'hi' ? 'सही पिनकोड' : 'Invalid Pincode';
    }

    if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = lang === 'te' ? '10 అంకెలు ఉండాలి' : lang === 'hi' ? '10 अंक होने चाहिए' : 'Must be 10 digits';
    }

    if (formData.userOrderId.length !== 13) {
      newErrors.userOrderId = lang === 'te' ? '13 అక్షరాలు ఉండాలి' : lang === 'hi' ? '13 अक्षर होने चाहिए' : 'Must be 13 chars';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onTrack(formData);
  };

  const renderLocationGroup = (field: 'origin' | 'dest', label: string) => {
    const stateKey = field === 'origin' ? 'originState' : 'destState';
    const cityKey = field === 'origin' ? 'originCity' : 'destCity';
    const pinKey = field === 'origin' ? 'originPincode' : 'destPincode';
    const cityErrKey = field === 'origin' ? 'originCity' : 'destCity' as keyof typeof errors;
    const pinErrKey = field === 'origin' ? 'originPincode' : 'destPincode' as keyof typeof errors;

    return (
      <div className="pt-4 border-t border-gray-100">
        <div className="text-[10px] font-black text-gray-400 uppercase mb-4 text-center tracking-widest">{label}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase">{t.state}</label>
            <input 
              type="text" required autoComplete="off" 
              value={(formData as any)[stateKey]} 
              onFocus={() => {
                const val = (formData as any)[stateKey];
                const allStates = INDIAN_STATES[lang];
                setStateSuggestions(allStates.filter(s => s.toLowerCase().includes(val.toLowerCase())));
                setActiveInput({ type: 'state', field });
              }} 
              onChange={(e) => handleStateChange(e.target.value, field)} 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm outline-none focus:border-red-500 font-medium" 
              placeholder={t.state} 
            />
            {activeInput?.type === 'state' && activeInput?.field === field && (
              <div className="absolute left-0 right-0 z-[1001] mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-48 overflow-y-auto">
                {stateSuggestions.map((s, i) => (
                  <div key={i} className="px-3 py-2 hover:bg-red-50 cursor-pointer text-xs font-bold transition-colors" 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFormData(prev => ({...prev, [stateKey]: s, [cityKey]: ''})); 
                      setActiveInput(null);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase">{t.city}</label>
            <input 
              type="text" required autoComplete="off" 
              value={(formData as any)[cityKey]} 
              onFocus={() => {
                const val = (formData as any)[cityKey];
                const stateVal = (formData as any)[stateKey];
                const allCities = (CITY_DATA[lang] as any)[stateVal] || (CITY_DATA['en'] as any)[stateVal] || [];
                setCitySuggestions(allCities.filter((c: string) => c.toLowerCase().includes(val.toLowerCase())));
                setActiveInput({ type: 'city', field });
              }} 
              onChange={(e) => handleCityChange(e.target.value, field)} 
              className={`w-full px-3 py-2 bg-gray-50 border ${errors[cityErrKey] ? 'border-red-500' : 'border-gray-300'} rounded text-sm outline-none focus:border-red-500 font-medium`} 
              placeholder={t.city} 
            />
            {activeInput?.type === 'city' && activeInput?.field === field && (
              <div className="absolute left-0 right-0 z-[1001] mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-48 overflow-y-auto">
                {citySuggestions.length > 0 ? citySuggestions.map((c, i) => (
                  <div key={i} className="px-3 py-2 hover:bg-red-50 cursor-pointer text-xs font-bold transition-colors" 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFormData(prev => ({...prev, [cityKey]: c})); 
                      setActiveInput(null);
                    }}
                  >
                    {c}
                  </div>
                )) : (
                  <div className="px-3 py-2 text-[10px] text-gray-400 italic">
                    {(formData as any)[stateKey] ? 'Type to add city manually' : 'Select a state first'}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase">{t.pincode}</label>
            <input 
              type="text" required maxLength={6}
              value={(formData as any)[pinKey]} 
              onFocus={() => setActiveInput(null)}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setFormData(prev => ({...prev, [pinKey]: val})); 
                setErrors(prev => ({...prev, [pinErrKey]: undefined}));
              }} 
              className={`w-full px-3 py-2 bg-gray-50 border ${errors[pinErrKey] ? 'border-red-500' : 'border-gray-300'} rounded text-sm outline-none focus:border-red-500 font-medium`} 
              placeholder="6 Digits" 
            />
            {errors[pinErrKey] && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{errors[pinErrKey]}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" ref={containerRef}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 uppercase">
              {t.phoneLabel} <span className="text-[9px] text-red-500 ml-1">(10 Digits)</span>
            </label>
            <input 
              type="tel" required maxLength={10}
              value={formData.phoneNumber} 
              onFocus={() => setActiveInput(null)}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({...formData, phoneNumber: val});
                if(errors.phoneNumber) setErrors(prev => ({...prev, phoneNumber: undefined}));
              }} 
              className={`w-full px-4 py-3 bg-gray-50 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded text-sm outline-none focus:border-red-500 font-bold`} 
              placeholder="e.g. 9876543210" 
            />
            {errors.phoneNumber && <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">{errors.phoneNumber}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 uppercase">
              {t.orderIdLabel} <span className="text-[9px] text-red-500 ml-1">(13 Chars)</span>
            </label>
            <input 
              type="text" required maxLength={13}
              value={formData.userOrderId} 
              onFocus={() => setActiveInput(null)}
              onChange={e => {
                const val = e.target.value.toUpperCase().slice(0, 13);
                setFormData({...formData, userOrderId: val});
                if(errors.userOrderId) setErrors(prev => ({...prev, userOrderId: undefined}));
              }} 
              className={`w-full px-4 py-3 bg-gray-50 border ${errors.userOrderId ? 'border-red-500' : 'border-gray-300'} rounded text-sm outline-none focus:border-red-500 font-bold`} 
              placeholder="IPXXXXXXXXIN" 
            />
            {errors.userOrderId && <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">{errors.userOrderId}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {renderLocationGroup('origin', t.originData)}
        {renderLocationGroup('dest', t.destData)}
      </div>

      <button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-[#E31E24] hover:bg-red-700 text-white font-black py-4 rounded shadow-lg flex items-center justify-center space-x-3 transition-all disabled:opacity-50 active:scale-[0.98]"
      >
        <i className="fa-solid fa-location-crosshairs animate-pulse"></i>
        <span className="tracking-widest">{t.initBtn}</span>
      </button>
    </form>
  );
};

export default TrackingForm;