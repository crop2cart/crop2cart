// lib/farmers.ts
// Farmer configuration data with Appwrite integration

export interface Farmer {
  id: string;
  name: string;
  email: string;
  location: string;
  area: string;
  latitude?: number;
  longitude?: number;
  areaName?: string;
  farmName?: string;
  address?: string;
  distance?: number; // calculated distance from user
}

// Real farmers from Appwrite Hyderabad database
export const FARMERS_APPWRITE_DATA: Farmer[] = [
  {
    id: '691d71728aae9e02a5a7',
    name: 'Yakoge Premium Farm',
    email: 'yakoge2234@gusronk.com',
    farmName: 'Yakoge Premium Farm',
    location: 'ECIL, Hyderabad',
    address: 'ECIL, Hyderabad, Telangana',
    areaName: 'ECIL',
    latitude: 17.3850,
    longitude: 78.5169,
    area: 'calculating...',
  },
  {
    id: '691d7173228d6f9d54a0',
    name: 'Green Valley Farms',
    email: 'vineethkumar45677@gmail.com',
    farmName: 'Green Valley Farms',
    location: 'Shamshabad, Hyderabad',
    address: 'Shamshabad, Hyderabad, Telangana',
    areaName: 'Shamshabad',
    latitude: 17.2391,
    longitude: 78.4056,
    area: 'calculating...',
  },
  {
    id: '691d7173bc793e81f6e0',
    name: 'Fresh Harvest Co.',
    email: 'vineethedits01@gmail.com',
    farmName: 'Fresh Harvest Co.',
    location: 'Ghatkesar, Hyderabad',
    address: 'Ghatkesar, Hyderabad, Telangana',
    areaName: 'Ghatkesar',
    latitude: 17.3566,
    longitude: 78.6631,
    area: 'calculating...',
  },
];

export const FARMERS = FARMERS_APPWRITE_DATA;

// Haversine formula to calculate distance between two coordinates
// Returns distance in kilometers
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(1)); // Return with 1 decimal place
};

// Get user location using browser Geolocation API
export const getUserLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  return new Promise((resolve) => {
    // Hyderabad city center as fallback
    const HYDERABAD_CENTER = { latitude: 17.3850, longitude: 78.5585 };

    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using Hyderabad center');
      resolve(HYDERABAD_CENTER);
      return;
    }

    const timeout = setTimeout(() => {
      console.log('Geolocation timeout, using Hyderabad center');
      resolve(HYDERABAD_CENTER);
    }, 8000); // 8 second timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        clearTimeout(timeout);
        console.log('Geolocation error, using Hyderabad center:', error.message);
        resolve(HYDERABAD_CENTER);
      },
      {
        timeout: 8000,
        enableHighAccuracy: true,
        maximumAge: 300000, // Cache position for 5 minutes
      }
    );
  });
};

// Calculate distances for all farmers from user location
export const calculateFarmerDistances = (
  userLat: number,
  userLng: number,
  farmers: Farmer[] = FARMERS
): Farmer[] => {
  return farmers
    .map((farmer) => {
      if (!farmer.latitude || !farmer.longitude) {
        return farmer;
      }

      const distance = calculateDistance(
        userLat,
        userLng,
        farmer.latitude,
        farmer.longitude
      );

      return {
        ...farmer,
        distance,
        area: `${distance} km away`,
      };
    })
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
};

// Get nearest farmer
export const getNearestFarmer = (
  farmers: Farmer[]
): Farmer | undefined => {
  return farmers.reduce((nearest, current) => {
    const currentDist = current.distance || Infinity;
    const nearestDist = nearest.distance || Infinity;
    return currentDist < nearestDist ? current : nearest;
  });
};

export const getFarmerById = (id: string, farmers: Farmer[] = FARMERS): Farmer | undefined => {
  return farmers.find(f => f.id === id);
};

export const getFarmerName = (id: string, farmers: Farmer[] = FARMERS): string => {
  return getFarmerById(id, farmers)?.name || 'Unknown';
};

export const getFarmerLocation = (id: string, farmers: Farmer[] = FARMERS) => {
  const farmer = getFarmerById(id, farmers);
  return farmer ? { location: farmer.location, area: farmer.area } : null;
};
