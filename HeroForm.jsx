import React, { useState } from 'react';

const HeroForm = () => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [appState, setAppState] = useState('form'); 
  
  // Data States
  const [packingData, setPackingData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [hotelData, setHotelData] = useState([]);

  const activitiesList = ['🏖️ Beach', '🥾 Hiking', '💼 Business', '🎿 Snow', '📸 Sightseeing'];

  const toggleActivity = (activity) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAppState('loading'); 

    try {
      const response = await fetch('http://localhost:5000/api/generate-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, duration, activities: selectedActivities }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPackingData(data.packingData); 
        setWeatherData(data.weather); // Grabbing weather from backend
        setHotelData(data.hotels);    // Grabbing hotels from backend
        setAppState('results');       
      }
    } catch (error) {
      alert("Uh oh! Make sure your Node.js backend server is running on port 5000!");
      setAppState('form');
    }
  };

  const toggleItem = (categoryIndex, itemId) => {
    const newData = [...packingData];
    const item = newData[categoryIndex].items.find(i => i.id === itemId);
    if (item) { 
      item.packed = !item.packed; 
      setPackingData(newData); 
    }
  };

  const resetApp = () => {
    setAppState('form'); 
    setDestination(''); 
    setDuration(''); 
    setSelectedActivities([]);
  };

  // ==========================================
  // SLIDE 3: THE DASHBOARD
  // ==========================================
  if (appState === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-4 md:px-10 font-sans">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Header & Weather Widget */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-blue-900 text-white p-8 rounded-3xl shadow-xl mb-8">
            <div className="mb-6 md:mb-0">
              <p className="text-blue-200 text-sm font-bold tracking-wider uppercase mb-1">Your Smart Itinerary</p>
              <h2 className="text-4xl font-extrabold">{destination}</h2>
              <p className="mt-2 text-blue-100">{duration} Days • {selectedActivities.join(' • ')}</p>
            </div>
            
            {/* Weather Widget (Only shows if weatherData exists) */}
            {weatherData && (
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 border border-white/30 shadow-lg">
                <span className="text-5xl">{weatherData.icon}</span>
                <div>
                  <p className="text-3xl font-black">{weatherData.temp}</p>
                  <p className="text-blue-100 text-sm font-medium">{weatherData.desc}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Packing List */}
            <div className="lg:w-2/3">
              <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center justify-between">
                <span>🧳 Packing Checklist</span>
                <button onClick={resetApp} className="text-sm bg-indigo-100 text-indigo-700 px-5 py-2 rounded-full font-bold hover:bg-indigo-200 transition">
                  ← Start New Trip
                </button>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {packingData.map((category, catIndex) => (
                  <div key={catIndex} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">{category.title}</h4>
                    <ul className="space-y-3">
                      {category.items.map((item) => (
                        <li key={item.id} onClick={() => toggleItem(catIndex, item.id)} className="flex items-center group cursor-pointer">
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-3 transition-colors ${item.packed ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 group-hover:border-indigo-400'}`}>
                            {item.packed && <span className="text-white text-sm font-bold">✓</span>}
                          </div>
                          <span className={`text-base transition-all ${item.packed ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-indigo-600'}`}>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Hotel Deals with Redirects */}
            <div className="lg:w-1/3">
              <h3 className="text-2xl font-black text-gray-800 mb-6">🏨 Top Hotel Deals</h3>
              <div className="space-y-4">
                {hotelData.map((hotel, index) => (
                  <a 
                    key={index} 
                    href={`https://www.booking.com/searchresults.html?ss=${destination}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer transform hover:-translate-y-1"
                  >
                    <h4 className="font-bold text-gray-800 text-lg">{hotel.name}</h4>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-yellow-500 tracking-widest">{hotel.rating}</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-black">{hotel.price}</span>
                    </div>
                    <p className="text-xs text-indigo-500 mt-3 font-semibold">Click to view on Booking.com →</p>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // SLIDE 2: LOADING
  // ==========================================
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-12 flex flex-col items-center max-w-sm w-full border border-white">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">✈️</div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800 text-center mb-2">
            Mapping <span className="text-indigo-600">{destination}</span>
          </h3>
          <p className="text-gray-500 text-center font-medium animate-pulse">
            Cross-referencing weather & hotels...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // SLIDE 1: INPUT FORM
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
          Pack Smarter.<br/><span className="text-indigo-300">Travel Lighter.</span>
        </h1>
        <p className="text-lg text-indigo-100 font-medium">Our AI-driven assistant builds your perfect itinerary.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-indigo-100 mb-2 uppercase tracking-wide">Destination</label>
            <input type="text" placeholder="e.g., Tokyo, Japan" className="w-full px-5 py-4 rounded-xl bg-white/90 border-0 focus:ring-4 focus:ring-indigo-400 text-gray-800 outline-none" value={destination} onChange={(e) => setDestination(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-indigo-100 mb-2 uppercase tracking-wide">Duration (Days)</label>
            <input type="number" min="1" placeholder="e.g., 7" className="w-full px-5 py-4 rounded-xl bg-white/90 border-0 focus:ring-4 focus:ring-indigo-400 text-gray-800 outline-none" value={duration} onChange={(e) => setDuration(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-indigo-100 mb-3 uppercase tracking-wide">Trip Vibe</label>
            <div className="flex flex-wrap gap-3">
              {activitiesList.map((activity) => (
                <button type="button" key={activity} onClick={() => toggleActivity(activity)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${selectedActivities.includes(activity) ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'bg-white/20 text-white hover:bg-white/30'}`}>{activity}</button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black text-lg py-4 px-6 rounded-xl shadow-xl hover:-translate-y-1 transition-transform">Generate My Custom List ✨</button>
        </form>
      </div>
    </div>
  );
};

export default HeroForm;