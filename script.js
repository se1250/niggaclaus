// Initialize the map
var map = L.map('map', {
    minZoom: 2.75,  // Lower minimum zoom to show full width
    maxZoom: 19,
    maxBounds: [[-90, -190], [90, 190]],  // Slightly wider bounds to prevent cutting off
    maxBoundsViscosity: 0.8,  // Slightly reduced for smoother panning
    zoomSnap: 0.1,  // Very smooth zoom
    zoomDelta: 0.25,  // Controlled zoom steps
    wheelDebounceTime: 50,  // Faster wheel response
    wheelPxPerZoomLevel: 80,  // More precise zoom control
    worldCopyJump: true  // Smoother panning around edges
}).setView([0, 0], 2);  // Initial view

// Update tile layer configuration
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    noWrap: false,  // Allow slight wrapping for smooth edges
    bounds: [[-90, -190], [90, 190]]  // Match the map bounds
}).addTo(map);

// Add this line to debug map initialization
console.log('Map initialized:', map);

// Create custom Santa icon
var santaIcon = L.icon({
    // Option 1: Use local file if you have it
    iconUrl: 'santa.png',
    
    // Option 2: Use a fallback emoji URL (uncomment this if you don't have santa.png)
    // iconUrl: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛷</text></svg>',
    
    iconSize: [80, 80],
    iconAnchor: [40, 40],
    popupAnchor: [0, -40]
});

// Define time zones with coordinates (ordered by UTC offset)
const timeZones = [
    // UTC-12 to UTC-11
    { lat: 16.7414, lon: -169.5332, label: 'Baker Island', offset: -12 },
    { lat: -14.2833, lon: -170.7167, label: 'Samoa', offset: -11 },
    
    // UTC-10 to UTC-8
    { lat: 21.3069, lon: -157.8583, label: 'Honolulu', offset: -10 },
    { lat: 61.2181, lon: -149.9003, label: 'Anchorage', offset: -9 },
    { lat: 49.2827, lon: -123.1207, label: 'Vancouver', offset: -8 },
    { lat: 34.0522, lon: -118.2437, label: 'Los Angeles', offset: -8 },
    
    // UTC-7 to UTC-5
    { lat: 33.4484, lon: -112.0740, label: 'Phoenix', offset: -7 },
    { lat: 51.0486, lon: -114.0708, label: 'Calgary', offset: -7 },
    { lat: 41.8781, lon: -87.6298, label: 'Chicago', offset: -6 },
    { lat: 19.4326, lon: -99.1332, label: 'Mexico City', offset: -6 },
    { lat: 40.7128, lon: -74.0060, label: 'New York', offset: -5 },
    { lat: -12.0464, lon: -77.0428, label: 'Lima', offset: -5 },
    
    // UTC-4 to UTC-2
    { lat: -33.4489, lon: -70.6693, label: 'Santiago', offset: -4 },
    { lat: 10.4806, lon: -66.9036, label: 'Caracas', offset: -4 },
    { lat: -23.5505, lon: -46.6333, label: 'São Paulo', offset: -3 },
    { lat: -34.6037, lon: -58.3816, label: 'Buenos Aires', offset: -3 },
    { lat: -3.7319, lon: -38.5267, label: 'Fernando de Noronha', offset: -2 },
    
    // UTC-1 to UTC+0
    { lat: 14.9195, lon: -23.5087, label: 'Praia', offset: -1 },
    { lat: 51.5074, lon: -0.1278, label: 'London', offset: 0 },
    { lat: 14.6937, lon: -17.4441, label: 'Dakar', offset: 0 },
    
    // UTC+1 to UTC+3
    { lat: 48.8566, lon: 2.3522, label: 'Paris', offset: 1 },
    { lat: 52.5200, lon: 13.4050, label: 'Berlin', offset: 1 },
    { lat: 30.0444, lon: 31.2357, label: 'Cairo', offset: 2 },
    { lat: 41.0082, lon: 28.9784, label: 'Istanbul', offset: 3 },
    { lat: -1.2921, lon: 36.8219, label: 'Nairobi', offset: 3 },
    { lat: 55.7558, lon: 37.6173, label: 'Moscow', offset: 3 },
    
    // UTC+4 to UTC+6
    { lat: 25.2048, lon: 55.2708, label: 'Dubai', offset: 4 },
    { lat: 40.1872, lon: 44.5152, label: 'Yerevan', offset: 4 },
    { lat: 23.8103, lon: 90.4125, label: 'Dhaka', offset: 6 },
    { lat: 27.7172, lon: 85.3240, label: 'Kathmandu', offset: 5.75 },
    { lat: 28.6139, lon: 77.2090, label: 'New Delhi', offset: 5.5 },
    
    // UTC+7 to UTC+9
    { lat: 13.7563, lon: 100.5018, label: 'Bangkok', offset: 7 },
    { lat: -6.2088, lon: 106.8456, label: 'Jakarta', offset: 7 },
    { lat: 1.3521, lon: 103.8198, label: 'Singapore', offset: 8 },
    { lat: 39.9042, lon: 116.4074, label: 'Beijing', offset: 8 },
    { lat: 35.6762, lon: 139.6503, label: 'Tokyo', offset: 9 },
    { lat: 37.5665, lon: 126.9780, label: 'Seoul', offset: 9 },
    
    // UTC+10 to UTC+14
    { lat: -33.8688, lon: 151.2093, label: 'Sydney', offset: 10 },
    { lat: -9.4438, lon: 147.1803, label: 'Port Moresby', offset: 10 },
    { lat: -41.2866, lon: 174.7756, label: 'Wellington', offset: 12 },
    { lat: -17.7134, lon: 178.0650, label: 'Suva', offset: 12 },
    { lat: -8.5333, lon: 179.2167, label: 'Kiritimati', offset: 14 }
];

let santaMarker = null;
let routeLine = null;
let currentSegment = 0;
let animationInProgress = false;
let housesRobbed = 0;
const totalHouses = 2200000000; // 2.2 billion houses
const initialPercentage = 0; // Start from 0
const incrementPercentage = 0.006; // 0.6%
let visitedLocations = 0;
let lastUpdateTime = Date.now();

function calculateLocalTime(lat, lon) {
    // Calculate approximate local time based on longitude
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localOffset = Math.round(lon / 15); // Each 15 degrees is roughly 1 hour
    return new Date(utc + (3600000 * localOffset));
}

function sortRouteByChristmasTime() {
    // Group cities by rough time zones
    const timeZones = [
        // Start at the international date line and move west
        { min: 160, max: 180, offset: 12 },  // UTC+12
        { min: 140, max: 160, offset: 10 },  // UTC+10
        { min: 120, max: 140, offset: 8 },   // UTC+8
        { min: 100, max: 120, offset: 7 },   // UTC+7
        { min: 60, max: 100, offset: 5 },    // UTC+5
        { min: 30, max: 60, offset: 3 },     // UTC+3
        { min: 0, max: 30, offset: 1 },      // UTC+1
        { min: -30, max: 0, offset: 0 },     // UTC+0
        { min: -60, max: -30, offset: -2 },  // UTC-2
        { min: -90, max: -60, offset: -4 },  // UTC-4
        { min: -120, max: -90, offset: -6 }, // UTC-6
        { min: -150, max: -120, offset: -8 }, // UTC-8
        { min: -180, max: -150, offset: -10 } // UTC-10
    ];

    // Start at North Pole
    let sortedRoute = [santaRoute[0]];
    
    // Sort cities by time zones
    timeZones.forEach(zone => {
        const citiesInZone = santaRoute.filter(city => 
            city.lon > zone.min && 
            city.lon <= zone.max &&
            city.label !== 'North Pole'
        );
        
        // Sort cities within each zone from north to south
        citiesInZone.sort((a, b) => b.lat - a.lat);
        sortedRoute = sortedRoute.concat(citiesInZone);
    });

    // End at North Pole
    sortedRoute.push(santaRoute[0]);
    
    return sortedRoute;
}

function initializeRoute() {
    const sortedRoute = sortRouteByChristmasTime();
    
    // Create the green line connecting all points
    routeLine = L.polyline(sortedRoute.map(loc => [loc.lat, loc.lon]), {
        color: '#2ecc71',
        weight: 3,
        opacity: 0.6
    }).addTo(map);

    // Initialize Santa using the santaIcon we defined earlier
    santaMarker = L.marker([sortedRoute[0].lat, sortedRoute[0].lon], {
        icon: santaIcon,  // Use the predefined santaIcon instead of inline configuration
        rotationOrigin: "center center"
    }).addTo(map);

    // Add console logs for debugging
    console.log('Route initialized with length:', sortedRoute.length);
    console.log('Starting position:', sortedRoute[0]);

    return sortedRoute;
}

function calculateBearing(start, end) {
    const startLat = start.lat * Math.PI / 180;
    const startLng = start.lon * Math.PI / 180;
    const endLat = end.lat * Math.PI / 180;
    const endLng = end.lon * Math.PI / 180;

    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
        Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return bearing;
}

function updateHousesCount(isNewLocation = false) {
    // If we've reached a new location, add the increment
    if (isNewLocation) {
        const increment = Math.floor(totalHouses * incrementPercentage);
        housesRobbed = Math.min(housesRobbed + increment, totalHouses);
    }
    
    // Format the number with commas
    const formattedCount = housesRobbed.toLocaleString();
    document.getElementById('houses-count').textContent = formattedCount;
}

function animateSanta(route, currentIndex) {
    if (currentIndex >= route.length - 1) {
        currentIndex = 0;
        housesRobbed = 0; // Reset counter when starting over
        visitedLocations = 0;
    }

    // Set initial houses count if starting fresh
    if (currentIndex === 0 && housesRobbed === 0) {
        updateHousesCount(false);
    }

    const start = L.latLng(route[currentIndex].lat, route[currentIndex].lon);
    const end = L.latLng(route[currentIndex + 1].lat, route[currentIndex + 1].lon);
    
    // Calculate distance between points for variable duration
    const distance = start.distanceTo(end);
    const duration = Math.min(Math.max(distance / 100, 2000), 8000); // Between 2 and 8 seconds
    
    const frames = 100;
    let frame = 0;

    const bearing = calculateBearing(route[currentIndex], route[currentIndex + 1]);
    
    function animate() {
        frame++;
        const progress = frame / frames;
        
        const lat = start.lat + (end.lat - start.lat) * progress;
        const lng = start.lng + (end.lng - start.lng) * progress;
        
        santaMarker.setLatLng([lat, lng]);

        // Update location text
        document.getElementById('current-country').textContent = route[currentIndex].label;
        document.getElementById('next-country').textContent = route[currentIndex + 1].label;
        
        // Update houses count only when reaching new location
        if (frame === frames) {
            updateHousesCount(true);
        }
        
        if (frame < frames) {
            requestAnimationFrame(animate);
        } else {
            animationInProgress = false;
            setTimeout(() => {
                animateSanta(route, currentIndex + 1);
            }, 1000);
        }
    }

    animate();
}

// Update the DOM loaded event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting Santa tracker');
    
    // Initialize map with a more central view
    map.setView([20, 0], 2);
    
    const sortedRoute = initializeRoute();
    
    // Start counter updates
    setInterval(updateHousesCount, 100); // Update every 100ms
    
    // Start animation after a short delay
    setTimeout(() => {
        animateSanta(sortedRoute, 0);
    }, 2000);
});

const santaRoute = [
    { lat: 90, lon: 0, label: 'North Pole' }, // Starting point

    // Europe (44 countries)
    { lat: 41.3275, lon: 19.8187, label: 'Tirana, Albania' },
    { lat: 42.5063, lon: 1.5218, label: 'Andorra la Vella, Andorra' },
    { lat: 48.2082, lon: 16.3738, label: 'Vienna, Austria' },
    { lat: 53.9045, lon: 27.5615, label: 'Minsk, Belarus' },
    { lat: 50.8503, lon: 4.3517, label: 'Brussels, Belgium' },
    { lat: 43.8564, lon: 18.4131, label: 'Sarajevo, Bosnia and Herzegovina' },
    { lat: 42.6977, lon: 23.3219, label: 'Sofia, Bulgaria' },
    { lat: 45.8150, lon: 15.9819, label: 'Zagreb, Croatia' },
    { lat: 35.1856, lon: 33.3823, label: 'Nicosia, Cyprus' },
    { lat: 50.0755, lon: 14.4378, label: 'Prague, Czech Republic' },
    { lat: 55.6761, lon: 12.5683, label: 'Copenhagen, Denmark' },
    { lat: 59.4370, lon: 24.7536, label: 'Tallinn, Estonia' },
    { lat: 60.1699, lon: 24.9384, label: 'Helsinki, Finland' },
    { lat: 48.8566, lon: 2.3522, label: 'Paris, France' },
    { lat: 52.5200, lon: 13.4050, label: 'Berlin, Germany' },
    { lat: 37.9838, lon: 23.7275, label: 'Athens, Greece' },
    { lat: 47.4979, lon: 19.0402, label: 'Budapest, Hungary' },
    { lat: 64.1265, lon: -21.8174, label: 'Reykjavik, Iceland' },
    { lat: 53.3498, lon: -6.2603, label: 'Dublin, Ireland' },
    { lat: 41.9028, lon: 12.4964, label: 'Rome, Italy' },
    { lat: 42.6629, lon: 21.1655, label: 'Pristina, Kosovo' },
    { lat: 56.9496, lon: 24.1052, label: 'Riga, Latvia' },
    { lat: 47.1410, lon: 9.5209, label: 'Vaduz, Liechtenstein' },
    { lat: 54.6872, lon: 25.2797, label: 'Vilnius, Lithuania' },
    { lat: 49.6116, lon: 6.1319, label: 'Luxembourg City, Luxembourg' },
    { lat: 41.9973, lon: 21.4280, label: 'Skopje, North Macedonia' },
    { lat: 35.8989, lon: 14.5146, label: 'Valletta, Malta' },
    { lat: 47.0104, lon: 28.8638, label: 'Chisinau, Moldova' },
    { lat: 43.7384, lon: 7.4246, label: 'Monaco' },
    { lat: 42.4304, lon: 19.2594, label: 'Podgorica, Montenegro' },
    { lat: 52.3676, lon: 4.9041, label: 'Amsterdam, Netherlands' },
    { lat: 59.9139, lon: 10.7522, label: 'Oslo, Norway' },
    { lat: 52.2297, lon: 21.0122, label: 'Warsaw, Poland' },
    { lat: 38.7223, lon: -9.1393, label: 'Lisbon, Portugal' },
    { lat: 44.4268, lon: 26.1025, label: 'Bucharest, Romania' },
    { lat: 55.7558, lon: 37.6173, label: 'Moscow, Russia' },
    { lat: 43.9424, lon: 12.4578, label: 'San Marino' },
    { lat: 44.8024, lon: 20.4656, label: 'Belgrade, Serbia' },
    { lat: 48.1486, lon: 17.1077, label: 'Bratislava, Slovakia' },
    { lat: 46.0569, lon: 14.5058, label: 'Ljubljana, Slovenia' },
    { lat: 40.4168, lon: -3.7038, label: 'Madrid, Spain' },
    { lat: 59.3293, lon: 18.0686, label: 'Stockholm, Sweden' },
    { lat: 46.9480, lon: 7.4474, label: 'Bern, Switzerland' },
    { lat: 50.4501, lon: 30.5234, label: 'Kiev, Ukraine' },
    { lat: 51.5074, lon: -0.1278, label: 'London, United Kingdom' },
    { lat: 41.9028, lon: 12.4964, label: 'Vatican City' },

    // Asia (48 countries)
    { lat: 34.5553, lon: 69.2075, label: 'Kabul, Afghanistan' },
    { lat: 26.2235, lon: 50.5876, label: 'Manama, Bahrain' },
    { lat: 23.8103, lon: 90.4125, label: 'Dhaka, Bangladesh' },
    { lat: 27.4712, lon: 89.6339, label: 'Thimphu, Bhutan' },
    { lat: 4.5353, lon: 114.7277, label: 'Bandar Seri Begawan, Brunei' },
    { lat: 11.5564, lon: 104.9282, label: 'Phnom Penh, Cambodia' },
    { lat: 39.9042, lon: 116.4074, label: 'Beijing, China' },
    { lat: 41.7151, lon: 44.8271, label: 'Tbilisi, Georgia' },
    { lat: 28.6139, lon: 77.2090, label: 'New Delhi, India' },
    { lat: -6.2088, lon: 106.8456, label: 'Jakarta, Indonesia' },
    { lat: 35.6892, lon: 51.3890, label: 'Tehran, Iran' },
    { lat: 33.3152, lon: 44.3661, label: 'Baghdad, Iraq' },
    { lat: 31.7683, lon: 35.2137, label: 'Jerusalem, Israel' },
    { lat: 35.6762, lon: 139.6503, label: 'Tokyo, Japan' },
    { lat: 31.9497, lon: 35.9328, label: 'Amman, Jordan' },
    { lat: 51.1694, lon: 71.4491, label: 'Nur-Sultan, Kazakhstan' },
    { lat: 39.0392, lon: 125.7625, label: 'Pyongyang, North Korea' },
    { lat: 37.5665, lon: 126.9780, label: 'Seoul, South Korea' },
    { lat: 29.3759, lon: 47.9774, label: 'Kuwait City, Kuwait' },
    { lat: 42.8746, lon: 74.5698, label: 'Bishkek, Kyrgyzstan' },
    { lat: 17.9757, lon: 102.6331, label: 'Vientiane, Laos' },
    { lat: 33.8938, lon: 35.5018, label: 'Beirut, Lebanon' },
    { lat: 3.1412, lon: 101.6865, label: 'Kuala Lumpur, Malaysia' },
    { lat: 47.9184, lon: 106.9177, label: 'Ulaanbaatar, Mongolia' },
    { lat: 19.7633, lon: 96.0785, label: 'Naypyidaw, Myanmar' },
    { lat: 27.7172, lon: 85.3240, label: 'Kathmandu, Nepal' },
    { lat: 23.5880, lon: 58.3829, label: 'Muscat, Oman' },
    { lat: 33.6844, lon: 73.0479, label: 'Islamabad, Pakistan' },
    { lat: 14.5995, lon: 120.9842, label: 'Manila, Philippines' },
    { lat: 25.2854, lon: 51.5310, label: 'Doha, Qatar' },
    { lat: 24.7136, lon: 46.6753, label: 'Riyadh, Saudi Arabia' },
    { lat: 1.3521, lon: 103.8198, label: 'Singapore' },
    { lat: 6.9271, lon: 79.8612, label: 'Colombo, Sri Lanka' },
    { lat: 33.5138, lon: 36.2765, label: 'Damascus, Syria' },
    { lat: 25.0330, lon: 121.5654, label: 'Taipei, Taiwan' },
    { lat: 38.5598, lon: 68.7870, label: 'Dushanbe, Tajikistan' },
    { lat: 13.7563, lon: 100.5018, label: 'Bangkok, Thailand' },
    { lat: 40.9923, lon: 28.7195, label: 'Istanbul, Turkey' },
    { lat: 37.9509, lon: 58.3794, label: 'Ashgabat, Turkmenistan' },
    { lat: 24.4667, lon: 54.3667, label: 'Abu Dhabi, UAE' },
    { lat: 41.3111, lon: 69.2797, label: 'Tashkent, Uzbekistan' },
    { lat: 21.0285, lon: 105.8542, label: 'Hanoi, Vietnam' },
    { lat: 15.3694, lon: 44.1910, label: 'Sanaa, Yemen' },

    // Africa (54 countries)
    { lat: 36.7538, lon: 3.0588, label: 'Algiers, Algeria' },
    { lat: -8.8383, lon: 13.2344, label: 'Luanda, Angola' },
    { lat: 6.4969, lon: 2.6283, label: 'Porto-Novo, Benin' },
    { lat: -24.6282, lon: 25.9231, label: 'Gaborone, Botswana' },
    { lat: 12.3714, lon: -1.5197, label: 'Ouagadougou, Burkina Faso' },
    { lat: -3.3731, lon: 29.3187, label: 'Bujumbura, Burundi' },
    { lat: 3.8667, lon: 11.5167, label: 'Yaoundé, Cameroon' },
    { lat: 14.9177, lon: -23.5092, label: 'Praia, Cape Verde' },
    { lat: 4.3947, lon: 18.5582, label: 'Bangui, Central African Republic' },
    { lat: 12.1348, lon: 15.0557, label: 'N\'Djamena, Chad' },
    { lat: -11.7047, lon: 43.2558, label: 'Moroni, Comoros' },
    { lat: -4.2634, lon: 15.2429, label: 'Kinshasa, DR Congo' },
    { lat: -4.4419, lon: 15.2663, label: 'Brazzaville, Republic of Congo' },
    { lat: 6.8276, lon: -5.2893, label: 'Yamoussoukro, Ivory Coast' },
    { lat: 11.5886, lon: 43.1451, label: 'Djibouti' },
    { lat: 30.0444, lon: 31.2357, label: 'Cairo, Egypt' },
    { lat: 3.7523, lon: 8.7741, label: 'Malabo, Equatorial Guinea' },
    { lat: 15.3229, lon: 38.9251, label: 'Asmara, Eritrea' },
    { lat: 9.0320, lon: 38.7483, label: 'Addis Ababa, Ethiopia' },
    { lat: 0.4162, lon: 9.4673, label: 'Libreville, Gabon' },
    { lat: 13.4527, lon: -16.5780, label: 'Banjul, Gambia' },
    { lat: 5.5600, lon: -0.2057, label: 'Accra, Ghana' },
    { lat: 9.6412, lon: -13.5784, label: 'Conakry, Guinea' },
    { lat: 11.8636, lon: -15.5977, label: 'Bissau, Guinea-Bissau' },
    { lat: -1.2921, lon: 36.8219, label: 'Nairobi, Kenya' },
    { lat: -29.3142, lon: 27.4833, label: 'Maseru, Lesotho' },
    { lat: 6.3004, lon: -10.7969, label: 'Monrovia, Liberia' },
    { lat: 32.8872, lon: 13.1913, label: 'Tripoli, Libya' },
    { lat: -18.8792, lon: 47.5079, label: 'Antananarivo, Madagascar' },
    { lat: -13.9631, lon: 33.7741, label: 'Lilongwe, Malawi' },
    { lat: 12.6392, lon: -8.0029, label: 'Bamako, Mali' },
    { lat: 18.0735, lon: -15.9582, label: 'Nouakchott, Mauritania' },
    { lat: -20.1609, lon: 57.5012, label: 'Port Louis, Mauritius' },
    { lat: 33.9716, lon: -6.8498, label: 'Rabat, Morocco' },
    { lat: -25.9692, lon: 32.5732, label: 'Maputo, Mozambique' },
    { lat: -22.5597, lon: 17.0832, label: 'Windhoek, Namibia' },
    { lat: 13.5127, lon: 2.1128, label: 'Niamey, Niger' },
    { lat: 9.0765, lon: 7.3986, label: 'Abuja, Nigeria' },
    { lat: -1.9441, lon: 30.0619, label: 'Kigali, Rwanda' },
    { lat: 0.3306, lon: 6.7311, label: 'São Tomé, São Tomé and Príncipe' },
    { lat: 14.6937, lon: -17.4441, label: 'Dakar, Senegal' },
    { lat: -4.6191, lon: 55.4513, label: 'Victoria, Seychelles' },
    { lat: 8.4847, lon: -13.2343, label: 'Freetown, Sierra Leone' },
    { lat: 2.0469, lon: 45.3182, label: 'Mogadishu, Somalia' },
    { lat: -33.9249, lon: 18.4241, label: 'Cape Town, South Africa' },
    { lat: 4.8594, lon: 31.5713, label: 'Juba, South Sudan' },
    { lat: 15.5007, lon: 32.5599, label: 'Khartoum, Sudan' },
    { lat: -26.3054, lon: 31.1367, label: 'Mbabane, Eswatini' },
    { lat: -6.1630, lon: 35.7516, label: 'Dodoma, Tanzania' },
    { lat: 6.1375, lon: 1.2123, label: 'Lomé, Togo' },
    { lat: 36.8065, lon: 10.1815, label: 'Tunis, Tunisia' },
    { lat: 0.3476, lon: 32.5825, label: 'Kampala, Uganda' },
    { lat: -15.4167, lon: 28.2833, label: 'Lusaka, Zambia' },
    { lat: -17.8216, lon: 31.0492, label: 'Harare, Zimbabwe' },

    // Americas (35 countries)
    { lat: 17.1274, lon: -61.8468, label: 'Saint John\'s, Antigua and Barbuda' },
    { lat: -34.6037, lon: -58.3816, label: 'Buenos Aires, Argentina' },
    { lat: 25.0343, lon: -77.3963, label: 'Nassau, Bahamas' },
    { lat: 13.1939, lon: -59.5432, label: 'Bridgetown, Barbados' },
    { lat: 17.2534, lon: -88.7713, label: 'Belmopan, Belize' },
    { lat: -16.4990, lon: -68.1483, label: 'La Paz, Bolivia' },
    { lat: -15.7975, lon: -47.8919, label: 'Brasília, Brazil' },
    { lat: 45.4215, lon: -75.6972, label: 'Ottawa, Canada' },
    { lat: -33.4489, lon: -70.6693, label: 'Santiago, Chile' },
    { lat: 4.7110, lon: -74.0721, label: 'Bogotá, Colombia' },
    { lat: 9.9281, lon: -84.0907, label: 'San José, Costa Rica' },
    { lat: 23.1136, lon: -82.3666, label: 'Havana, Cuba' },
    { lat: 15.3010, lon: -61.3870, label: 'Roseau, Dominica' },
    { lat: 18.4861, lon: -69.9312, label: 'Santo Domingo, Dominican Republic' },
    { lat: -0.1807, lon: -78.4678, label: 'Quito, Ecuador' },
    { lat: 13.6929, lon: -89.2182, label: 'San Salvador, El Salvador' },
    { lat: 12.0560, lon: -61.7486, label: 'St. George\'s, Grenada' },
    { lat: 14.6349, lon: -90.5069, label: 'Guatemala City, Guatemala' },
    { lat: 6.8013, lon: -58.1553, label: 'Georgetown, Guyana' },
    { lat: 18.5944, lon: -72.3074, label: 'Port-au-Prince, Haiti' },
    { lat: 14.0723, lon: -87.1921, label: 'Tegucigalpa, Honduras' },
    { lat: 18.1096, lon: -77.2975, label: 'Kingston, Jamaica' },
    { lat: 19.4326, lon: -99.1332, label: 'Mexico City, Mexico' },
    { lat: 12.1149, lon: -86.2362, label: 'Managua, Nicaragua' },
    { lat: 8.9943, lon: -79.5188, label: 'Panama City, Panama' },
    { lat: -25.2867, lon: -57.3333, label: 'Asunción, Paraguay' },
    { lat: -12.0464, lon: -77.0428, label: 'Lima, Peru' },
    { lat: 17.2971, lon: -62.7183, label: 'Basseterre, Saint Kitts and Nevis' },
    { lat: 14.0101, lon: -60.9875, label: 'Castries, Saint Lucia' },
    { lat: 13.1586, lon: -61.2242, label: 'Kingstown, Saint Vincent and the Grenadines' },
    { lat: 5.8520, lon: -55.2038, label: 'Paramaribo, Suriname' },
    { lat: 10.6596, lon: -61.5078, label: 'Port of Spain, Trinidad and Tobago' },
    { lat: 38.9072, lon: -77.0369, label: 'Washington DC, United States' },
    { lat: -34.8941, lon: -56.0675, label: 'Montevideo, Uruguay' },
    { lat: 10.4806, lon: -66.9036, label: 'Caracas, Venezuela' },

    // Oceania (14 countries)
    { lat: -35.2809, lon: 149.1300, label: 'Canberra, Australia' },
    { lat: -18.1416, lon: 178.4419, label: 'Suva, Fiji' },
    { lat: -0.5477, lon: 166.9209, label: 'Yaren, Nauru' },
    { lat: -41.2866, lon: 174.7756, label: 'Wellington, New Zealand' },
    { lat: 7.5000, lon: 134.6244, label: 'Ngerulmud, Palau' },
    { lat: -9.4438, lon: 147.1803, label: 'Port Moresby, Papua New Guinea' },
    { lat: -13.8333, lon: -171.7667, label: 'Apia, Samoa' },
    { lat: -9.4333, lon: 159.9500, label: 'Honiara, Solomon Islands' },
    { lat: -21.1333, lon: -175.2000, label: 'Nuku\'alofa, Tonga' },
    { lat: -8.5167, lon: 179.2167, label: 'Funafuti, Tuvalu' },
    { lat: -17.7333, lon: 168.3167, label: 'Port Vila, Vanuatu' },
    { lat: -13.2833, lon: -176.1833, label: 'Mata-Utu, Wallis and Futuna' },
    { lat: 1.3300, lon: 172.9800, label: 'South Tarawa, Kiribati' },
    { lat: -9.0000, lon: -171.2500, label: 'Tokelau' },

    { lat: 90, lon: 0, label: 'North Pole' } // Return to North Pole
];
