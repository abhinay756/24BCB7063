
export type TransportMode = 'road' | 'rail';

export interface OrderInput {
  trackingId: string; // Generic ID for Vehicle/Flight/Container/Order
  transportMode: TransportMode;
  phoneNumber: string;
  address: string;
  userOrderId: string;
  state: string;
  district: string;
  pincode: string;
}

export interface TrackingStep {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  icon: string;
}

export interface RouteSegment {
  points: [number, number][];
  trafficDensity: 'low' | 'moderate' | 'heavy';
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface TrackingData {
  orderId: string;
  productName: string;
  transportMode: TransportMode;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  destinationLocation: {
    lat: number;
    lng: number;
  };
  driver: {
    name: string;
    vehicle: string;
    phone: string;
    rating: number;
    speed: string;
  };
  trafficInfo: {
    density: string;
    delayMinutes: number;
    status: string;
  };
  route: RouteSegment[];
  eta: string;
  steps: TrackingStep[];
  carrier: string;
  predictionConfidence: number;
  groundingSources?: GroundingSource[];
}
