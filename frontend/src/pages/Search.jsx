import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, ExternalLink, Loader2, Book, Play } from 'lucide-react';

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
      <div className="text-center mb-12 border-b border-white/10 pb-8">
        <h1 className="text-5xl font-serif font-normal text-brand-cream mb-4">Semantic Search</h1>
        <p className="text-lg text-brand-cream/70 max-w-2xl mx-auto font-light">
          Search across all documents by meaning, not just keywords.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-12 relative max-w-3xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., origin of caste, constitution drafting..."
          className="w-full text-lg pl-6 pr-16 py-5 rounded-none border-b-2 border-white/20 bg-transparent text-brand-cream placeholder-brand-cream/30 focus:border-brand-gold outline-none transition-all font-light"
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="absolute right-0 top-3 bottom-3 text-brand-gold p-3 disabled:opacity-30 transition-colors flex items-center justify-center hover:text-white"
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
          <p className="text-brand-gold uppercase tracking-[0.2em] text-xs font-bold mb-6">
            Found {results.length} results
          </p>
          
          {results.length > 0 ? (
            <div className="space-y-6">
              {results.map((res, idx) => {
                const isAudio = res.media_type === 'audio';
                return (
                  <div key={idx} className="bg-brand-black p-8 border border-white/10 hover:border-brand-gold/50 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-3 text-brand-cream">
                        {isAudio ? <Play className="w-5 h-5 text-brand-gold" /> : <Book className="w-5 h-5 text-brand-gold" />}
                        <span className="font-bold font-serif text-lg">{res.document_id}</span>
                        <span className="text-brand-cream/30">&bull;</span>
                        <span className="text-brand-cream/70 text-sm uppercase tracking-widest font-semibold">
                          {isAudio ? `${res.timestamp_start_fmt} – ${res.timestamp_end_fmt}` : `Page ${res.pdf_page}`}
                        </span>
                      </div>
                      <Link 
                        to={isAudio ? `/media/${res.document_id}?t=${Math.floor(res.timestamp_start ?? 0)}` : `/document/${res.document_id}?page=${res.pdf_page}`}
                        className="flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-brand-black bg-brand-gold px-4 py-2 hover:bg-white transition-colors"
                      >
                        <span>{isAudio ? 'Listen' : 'View'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="font-serif text-brand-cream/80 leading-relaxed max-w-none text-lg">
                      <p className="whitespace-pre-wrap">{res.text}</p>
                    </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                     <span className="text-xs text-brand-cream/40 uppercase tracking-widest">Relevance: {Math.round(res.similarity * 100)}%</span>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/10">
              <p className="text-brand-cream/50 font-light">No matching text found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
