import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, ExternalLink, Loader2, Book } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`http://localhost:8000/api/search?q=${encodeURIComponent(query)}&limit=10`);
      if (!res.ok) throw new Error('Failed to fetch search results');
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError('An error occurred while searching.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Semantic Search</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Search across all documents by meaning, not just keywords.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-12 relative max-w-3xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., origin of caste, constitution drafting..."
          className="w-full text-lg pl-6 pr-16 py-5 rounded-2xl border-2 border-gray-200 shadow-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all"
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="absolute right-3 top-3 bottom-3 bg-brand-900 text-white p-3 rounded-xl hover:bg-brand-800 disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <SearchIcon className="w-6 h-6" />}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 max-w-3xl mx-auto border border-red-100">
          {error}
        </div>
      )}

      {results !== null && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-serif">
            Found {results.length} results
          </h2>
          
          {results.length > 0 ? (
            <div className="space-y-6">
              {results.map((res, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-300 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2 text-brand-700">
                      <Book className="w-5 h-5" />
                      <span className="font-bold">{res.document_id}</span>
                      <span className="text-gray-400">&bull;</span>
                      <span className="text-gray-600 text-sm">Page {res.pdf_page}</span>
                    </div>
                    <Link 
                      to={`/document/${res.document_id}?page=${res.pdf_page}`}
                      className="flex items-center space-x-1 text-sm bg-brand-50 text-brand-700 px-3 py-1 rounded-full hover:bg-brand-100 transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="prose prose-sm font-serif text-gray-700 max-w-none">
                    <p className="whitespace-pre-wrap">{res.text}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                     <span className="text-xs text-gray-400">Relevance: {Math.round(res.similarity * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">No matching text found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
