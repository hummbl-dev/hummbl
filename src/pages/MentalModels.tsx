/**
 * Mental Models Browser
 * 
 * @module pages/MentalModels
 * @version 1.0.0
 * @description Browse and explore HUMMBL Base120 mental models
 * 
 * HUMMBL Systems
 */

import { useState } from 'react';
import { Brain, Search, Filter, BookOpen } from 'lucide-react';
import { 
  mentalModels, 
  transformations, 
  getModelsByTransformation,
  type TransformationType,
  type MentalModel
} from '../data/mentalModels';

export default function MentalModels() {
  const [selectedTransformation, setSelectedTransformation] = useState<TransformationType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredModels = mentalModels.filter(model => {
    const matchesTransformation = selectedTransformation === 'all' || model.transformation === selectedTransformation;
    const matchesDifficulty = selectedDifficulty === 'all' || model.difficulty === selectedDifficulty;
    const matchesSearch = !searchQuery || 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTransformation && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mental Models</h1>
        <p className="text-gray-600 mt-1">
          Explore the HUMMBL Base120 framework of mental models
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search mental models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Transformation Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="inline h-4 w-4 mr-1" />
            Transformation
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTransformation('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTransformation === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({mentalModels.length})
            </button>
            {transformations.map((t) => {
              const count = getModelsByTransformation(t.code).length;
              return (
                <button
                  key={t.code}
                  onClick={() => setSelectedTransformation(t.code)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTransformation === t.code
                      ? `bg-${t.color}-600 text-white`
                      : `bg-${t.color}-100 text-${t.color}-800 hover:bg-${t.color}-200`
                  }`}
                >
                  {t.icon} {t.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <div className="flex gap-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDifficulty === level
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredModels.length} of {mentalModels.length} mental models
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="card text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No mental models match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <ModelCard key={model.code} model={model} />
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">About HUMMBL Base120</h3>
            <p className="text-sm text-blue-800">
              The Base120 framework organizes 120 mental models across 6 core transformations:
              Perspective (P), Inversion (IN), Composition (CO), Decomposition (DE), 
              Recursion (RE), and Systems (SY). Each transformation contains 20 models
              that help you think more effectively about problems and opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModelCardProps {
  model: MentalModel;
}

function ModelCard({ model }: ModelCardProps) {
  const transformation = transformations.find(t => t.code === model.transformation);
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-2xl">{transformation?.icon}</span>
            <h3 className="font-bold text-gray-900">
              {model.code}: {model.name}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              transformation ? `bg-${transformation.color}-100 text-${transformation.color}-800` : ''
            }`}>
              {transformation?.name}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[model.difficulty]}`}>
              {model.difficulty}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">
        {model.description}
      </p>

      <div className="bg-gray-50 p-3 rounded-lg mb-3">
        <p className="text-xs font-medium text-gray-600 mb-1">Example:</p>
        <p className="text-xs text-gray-700 italic">
          {model.example}
        </p>
      </div>

      {model.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {model.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {model.relatedModels.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Related: {model.relatedModels.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
