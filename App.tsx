import React, { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { TrailCard } from './components/TrailCard';
import { UserPreferences, Coordinates, TrailRecommendation } from './types';
import { getTrailSuggestions } from './services/geminiService';
import { Compass, MapPinOff, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trails, setTrails] = useState<TrailRecommendation[] | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  React.useEffect(() => {
    // Attempt to get location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Location error:", err);
          setLocationError("Please enable location services to find trails near you.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleSearch = async (prefs: UserPreferences) => {
    if (!location) {
      setError("We need your location to suggest nearby trails.");
      return;
    }

    setLoading(true);
    setError(null);
    setTrails(null);

    try {
      const results = await getTrailSuggestions(prefs, location);
      setTrails(results);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch trail suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setTrails(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen bg-emerald-950/40 backdrop-blur-sm overflow-y-auto">
        <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white cursor-pointer" onClick={resetSearch}>
            <Compass className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-bold tracking-tight">TrailBlazer AI</span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 pb-12">
          {/* Location Error State */}
          {locationError && !location && (
            <div className="max-w-md mx-auto mt-20 bg-white/90 p-8 rounded-2xl text-center shadow-xl">
              <MapPinOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-800 mb-2">Location Required</h3>
              <p className="text-stone-600 mb-6">{locationError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Try enabling location and reload
              </button>
            </div>
          )}

          {/* Search State */}
          {location && !trails && (
            <div className="mt-8 sm:mt-16 animate-fadeInUp">
               {error && (
                <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
              <SearchForm onSubmit={handleSearch} isLoading={loading} />
            </div>
          )}

          {/* Results State */}
          {location && trails && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 text-shadow">Your Trail Mix</h2>
                  <p className="text-emerald-100">Handpicked adventures just for you.</p>
                </div>
                <button 
                  onClick={resetSearch}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-md transition-colors text-sm font-medium border border-white/20"
                >
                  Modify Search
                </button>
              </div>

              {trails.length === 0 ? (
                <div className="bg-white/90 p-12 rounded-3xl text-center max-w-xl mx-auto">
                  <p className="text-xl text-stone-600">No trails found matching your specific criteria nearby. Try expanding your search range or being less specific with features.</p>
                  <button onClick={resetSearch} className="mt-6 text-emerald-600 font-bold hover:underline">Adjust Filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {trails.map((trail, index) => (
                    <TrailCard key={trail.id} trail={trail} index={index} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-xs">
        <p>Powered by Gemini AI & Google Maps • Images from Picsum</p>
      </footer>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default App;