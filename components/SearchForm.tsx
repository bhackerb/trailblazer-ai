import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { Button } from './Button';
import { Footprints, TreePine, Map, MountainSnow, Timer, Star } from 'lucide-react';

interface SearchFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const FEATURE_OPTIONS = [
  "Lake", "River", "Waterfall", "Forest", "Views", "Wildflowers", "Dog friendly", "Loop"
];

export const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, isLoading }) => {
  const [activityType, setActivityType] = useState<'hike' | 'run'>('hike');
  const [distance, setDistance] = useState<number>(5);
  const [travelTime, setTravelTime] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<('easy' | 'moderate' | 'hard')[]>(['moderate']);
  const [features, setFeatures] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(4.0);

  const toggleFeature = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature) 
        : [...prev, feature]
    );
  };

  const toggleDifficulty = (level: 'easy' | 'moderate' | 'hard') => {
    setDifficulty(prev => {
      if (prev.includes(level)) {
        return prev.filter(d => d !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      activityType,
      distance,
      travelTime,
      difficulty: difficulty.length === 0 ? ['easy', 'moderate', 'hard'] : difficulty,
      features,
      minRating
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-white/50 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-2">Find Your Path</h2>
        <p className="text-stone-500">Tell us what you're looking for, and we'll find the perfect trail.</p>
      </div>

      {/* Activity Type */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setActivityType('hike')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
            activityType === 'hike' 
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
              : 'border-stone-200 text-stone-400 hover:border-emerald-200 hover:bg-emerald-50/50'
          }`}
        >
          <TreePine className={`w-8 h-8 mb-2 ${activityType === 'hike' ? 'text-emerald-600' : 'text-stone-400'}`} />
          <span className="font-semibold">Hike</span>
        </button>
        <button
          type="button"
          onClick={() => setActivityType('run')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
            activityType === 'run' 
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
              : 'border-stone-200 text-stone-400 hover:border-emerald-200 hover:bg-emerald-50/50'
          }`}
        >
          <Footprints className={`w-8 h-8 mb-2 ${activityType === 'run' ? 'text-emerald-600' : 'text-stone-400'}`} />
          <span className="font-semibold">Run</span>
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-6 mb-8">
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-semibold text-stone-700 flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-500" /> Preferred Distance
            </label>
            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-sm">{distance} miles</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={distance}
            onChange={(e) => setDistance(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="font-semibold text-stone-700 flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-500" /> Max Travel Time
            </label>
            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-sm">{travelTime} mins</span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={travelTime}
            onChange={(e) => setTravelTime(parseInt(e.target.value))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="font-semibold text-stone-700 flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-500" /> Min Google Rating
            </label>
            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-sm">{minRating}+ Stars</span>
          </div>
          <input
            type="range"
            min="3.0"
            max="5.0"
            step="0.1"
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-8">
        <label className="block font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <MountainSnow className="w-4 h-4 text-emerald-500" /> Elevation / Difficulty <span className="text-stone-400 font-normal text-xs ml-2">(Select multiple)</span>
        </label>
        <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
          {(['easy', 'moderate', 'hard'] as const).map((level) => {
            const isSelected = difficulty.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => toggleDifficulty(level)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  isSelected
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div className="mb-8">
        <label className="block font-semibold text-stone-700 mb-3">Desired Features</label>
        <div className="flex flex-wrap gap-2">
          {FEATURE_OPTIONS.map((feature) => (
            <button
              key={feature}
              type="button"
              onClick={() => toggleFeature(feature)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                features.includes(feature)
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300'
              }`}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Scouting Trails...' : 'Find Trails'}
      </Button>
    </form>
  );
};