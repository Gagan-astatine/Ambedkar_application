import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Sparkles, BookOpen, ExternalLink, Loader2 } from 'lucide-react';

export default function Research() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`http://localhost:8000/api/research?q=${encodeURIComponent(query)}&limit=5`);
      if (!res.ok) throw new Error('Failed to fetch research results');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('An error occurred while researching. The AI may be experiencing rate limits.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-brand-100 rounded-full mb-4">
          <Sparkles className="w-10 h-10 text-brand-600" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">AI Research Assistant</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Ask complex questions. The assistant will search the archive and synthesize an answer citing exact pages.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-12 relative max-w-3xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., What were Dr. Ambedkar's views on the origin of the caste system?"
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

      {result && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden max-w-4xl mx-auto">
          <div className="p-8 md:p-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-6 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" /> Synthesized Answer
            </h2>
            
            <div className="prose prose-lg font-serif text-gray-800 max-w-none leading-relaxed whitespace-pre-wrap">
              {result.answer === "not found in the archive" ? (
                <p className="text-gray-500 italic">I could not find information to answer this question in the currently ingested archive documents.</p>
              ) : (
                result.answer
              )}
            </div>
          </div>
          
          {result.citations && result.citations.length > 0 && (
            <div className="bg-gray-50 p-8 md:p-10 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" /> Source Material Cited
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.citations.map((cite, idx) => (
                  <Link 
                    key={idx} 
                    to={`/document/${cite.document_id}?page=${cite.pdf_page}`}
                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all group block"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-brand-700 text-sm bg-brand-50 px-2 py-1 rounded">Citation {idx + 1}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brand-500" />
                    </div>
                    <p className="text-sm text-gray-900 font-semibold mb-1">{cite.document_id}</p>
                    <p className="text-xs text-gray-500 mb-3">Page {cite.pdf_page}</p>
                    <p className="text-xs text-gray-600 font-serif line-clamp-3 italic">"{cite.text}"</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {result.related_graph_nodes && result.related_graph_nodes.length > 0 && (
            <div className="bg-brand-50 p-8 md:p-10 border-t border-brand-100 rounded-b-3xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-800 mb-4 flex items-center">
                <span className="mr-2">🔗</span> Related in the Knowledge Graph
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.related_graph_nodes.map((node, idx) => (
                  <div key={idx} className="bg-white border border-brand-200 text-brand-900 text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm">
                    <span className="font-semibold">{node.name}</span>
                    <span className="text-brand-500 mx-1">•</span>
                    <span className="italic text-gray-500">{node.relation.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
