import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, Zap, X } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

interface SearchResult {
  id: string;
  title: string;
  type: 'workflow' | 'agent' | 'template';
  subtitle?: string;
  icon: React.ReactNode;
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { workflows, agents, templates } = useWorkflowStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      setSelectedIndex(0);
      return;
    }

    const searchLower = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search workflows
    workflows.forEach((workflow) => {
      if (workflow.name.toLowerCase().includes(searchLower) ||
          workflow.description?.toLowerCase().includes(searchLower)) {
        searchResults.push({
          id: workflow.id,
          title: workflow.name,
          type: 'workflow',
          subtitle: workflow.description,
          icon: <FileText className="h-4 w-4" />,
        });
      }
    });

    // Search agents
    agents.forEach((agent) => {
      if (agent.name.toLowerCase().includes(searchLower) ||
          agent.role.toLowerCase().includes(searchLower) ||
          agent.capabilities.some((cap) => cap.toLowerCase().includes(searchLower))) {
        searchResults.push({
          id: agent.id,
          title: agent.name,
          type: 'agent',
          subtitle: `${agent.role} agent`,
          icon: <Users className="h-4 w-4" />,
        });
      }
    });

    // Search templates
    templates.forEach((template) => {
      if (template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower)) {
        searchResults.push({
          id: template.id,
          title: template.name,
          type: 'template',
          subtitle: template.description,
          icon: <Zap className="h-4 w-4" />,
        });
      }
    });

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
    setShowResults(searchResults.length > 0);
    setSelectedIndex(0);
  }, [query, workflows, agents, templates]);

  const handleNavigate = (result: SearchResult) => {
    if (result.type === 'workflow') {
      navigate(`/workflows/${result.id}`);
    } else if (result.type === 'agent') {
      navigate('/agents');
    } else if (result.type === 'template') {
      navigate('/templates');
    }
    setQuery('');
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleNavigate(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="w-full pl-9 md:pl-10 pr-9 md:pr-10 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleNavigate(result)}
              title={`Navigate to ${result.title}`}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3 transition-colors ${
                index === selectedIndex ? 'bg-primary-50' : ''
              }`}
            >
              <div className="mt-1 text-black dark:text-white">
                {result.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white truncate">{result.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {result.type}
                  </span>
                </div>
                {result.subtitle && (
                  <p className="text-sm text-gray-500 truncate mt-0.5">{result.subtitle}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-8 z-50 text-center">
          <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No results found for "{query}"</p>
          <p className="text-xs text-gray-500 mt-1">Try searching for workflows, agents, or templates</p>
        </div>
      )}
    </div>
  );
}
