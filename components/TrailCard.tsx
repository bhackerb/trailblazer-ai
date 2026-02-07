import React from 'react';
import { TrailRecommendation } from '../types';
import { Mountain, Clock, Ruler, Navigation, MapPin, Star } from 'lucide-react';

interface TrailCardProps {
  trail: TrailRecommendation;
  index: number;
}

export const TrailCard: React.FC<TrailCardProps> = ({ trail, index }) => {
  // Use the API provided image if available (Grounding Photo).
  // Otherwise, use a high-quality generic forest/trail image.
  // We use a small rotation of high quality images to avoid them looking identical if multiple fail to load real photos.
  const genericImages = [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop", // Forest path light
    "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2000&auto=format&fit=crop", // Mountain hike
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop"  // Deep woods
  ];
  
  // Pick one deterministically based on index so it doesn't change on re-render
  const fallbackImage = genericImages[index % genericImages.length];
  
  const imageUrl = trail.imageUrl || fallbackImage;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-stone-100 flex flex-col h-full animate-fadeIn" style={{ animationDelay: `${index * 150}ms` }}>
      <div className="relative h-48 sm:h-56 overflow-hidden group bg-stone-100">
        <img 
          src={imageUrl} 
          alt={trail.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white w-full pr-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold leading-tight shadow-sm max-w-[70%]">{trail.name}</h3>
            {trail.rating && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-sm">{trail.rating}</span>
                    {trail.reviewCount && <span className="text-xs text-white/80">({trail.reviewCount})</span>}
                </div>
            )}
          </div>
        </div>
        {/* If we have a real Google Maps photo, we can maybe indicate it, or just leave it clean. */}
        {trail.imageUrl && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1">
             <MapPin className="w-3 h-3 text-emerald-600" />
             <span className="hidden sm:inline">Google Photo</span>
           </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          {trail.features.map((feature, idx) => (
            <span key={idx} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium border border-emerald-100">
              {feature}
            </span>
          ))}
        </div>

        <p className="text-stone-600 text-sm mb-6 leading-relaxed flex-grow">
          {trail.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-stone-700">
                <Ruler className="w-4 h-4 mr-2 text-emerald-500" />
                <span className="text-sm font-semibold">{trail.distance}</span>
            </div>
            <div className="flex items-center text-stone-700">
                <Mountain className="w-4 h-4 mr-2 text-emerald-500" />
                <span className="text-sm font-semibold">{trail.elevation}</span>
            </div>
            <div className="flex items-center text-stone-700">
                <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                <span className="text-sm font-semibold">{trail.travelTime} drive</span>
            </div>
        </div>

        <a 
          href={trail.googleMapsUri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors gap-2"
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </a>
      </div>
    </div>
  );
};