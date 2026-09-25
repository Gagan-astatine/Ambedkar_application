import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Sparkles, BookOpen, ExternalLink, Loader2, Play } from 'lucide-react';

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
      <div className="text-center mb-12 border-b border-white/10 pb-8">
        <div className="inline-flex items-center justify-center p-4 bg-brand-gold/10 rounded-full mb-4 border border-brand-gold/20">
          <Sparkles className="w-10 h-10 text-brand-gold" />
        </div>
        <h1 className="text-5xl font-serif font-normal text-brand-cream mb-4">AI Research Assistant</h1>
        <p className="text-lg text-brand-cream/70 max-w-2xl mx-auto font-light">
          Ask complex questions. The assistant will search the archive and synthesize an answer citing exact pages.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-12 relative max-w-3xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., What were Dr. Ambedkar's views on the origin of the caste system?"
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

      {result && (
        <div className="bg-brand-black border border-white/10 max-w-4xl mx-auto">
          <div className="p-8 md:p-12">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-8 flex items-center">
              <Sparkles className="w-3 h-3 mr-2" /> Synthesized Answer
            </h2>
            
            <div className="prose prose-lg font-serif text-brand-cream/90 max-w-none leading-relaxed whitespace-pre-wrap">
              {result.answer === "not found in the archive" ? (
                <p className="text-brand-cream/50 italic">I could not find information to answer this question in the currently ingested archive documents.</p>
              ) : (
                result.answer
              )}
            </div>
          </div>
          
          {result.citations && result.citations.length > 0 && (
            <div className="bg-white/5 p-8 md:p-12 border-t border-white/10">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-cream/50 mb-6 flex items-center">
                <BookOpen className="w-3 h-3 mr-2" /> Source Material Cited
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.citations.map((cite, idx) => {
                  const isAudio = cite.media_type === 'audio';
                  if (isAudio) {
                    // Audio citation card with "play from here" button
                    return (
                      <div key={idx} className="bg-brand-black p-6 border border-white/10 hover:border-brand-gold/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <span className="font-bold text-brand-black text-[10px] uppercase tracking-widest bg-brand-gold px-2 py-1">Citation {idx + 1}</span>
                          <span className="text-[10px] uppercase tracking-widest text-brand-gold/60 border border-brand-gold/20 px-2 py-1">Audio</span>
                        </div>
                        <p className="text-sm text-brand-cream font-semibold mb-1">{cite.document_id}</p>
                        <p className="text-[10px] uppercase tracking-widest text-brand-cream/40 mb-4 flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {cite.timestamp_start_fmt} – {cite.timestamp_end_fmt}
                        </p>
                        <p className="text-sm text-brand-cream/70 font-serif line-clamp-3 italic leading-relaxed mb-4">"{cite.text}"</p>
                        <Link
                          to={`/media/${cite.document_id}?t=${Math.floor(cite.timestamp_start ?? 0)}`}
                          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-black bg-brand-gold px-3 py-2 hover:bg-white transition-colors"
                        >
                          <Play className="w-3 h-3" /> Play from here
                        </Link>
                      </div>
                    );
                  }
                  // Standard document citation card
                  return (
                    <Link 
                      key={idx} 
                      to={`/document/${cite.document_id}?page=${cite.pdf_page}`}
                      className="bg-brand-black p-6 border border-white/10 hover:border-brand-gold/50 transition-all group block"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-bold text-brand-black text-[10px] uppercase tracking-widest bg-brand-gold px-2 py-1">Citation {idx + 1}</span>
                        <ExternalLink className="w-4 h-4 text-brand-cream/30 group-hover:text-brand-gold transition-colors" />
                      </div>
                      <p className="text-sm text-brand-cream font-semibold mb-1">{cite.document_id}</p>
                      <p className="text-[10px] uppercase tracking-widest text-brand-cream/40 mb-4">Page {cite.pdf_page}</p>
                      <p className="text-sm text-brand-cream/70 font-serif line-clamp-3 italic leading-relaxed">"{cite.text}"</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {result.related_graph_nodes && result.related_graph_nodes.length > 0 && (
            <div className="bg-brand-gold/5 p-8 md:p-12 border-t border-brand-gold/20">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6 flex items-center">
                <span className="mr-2">🔗</span> Related in the Knowledge Graph
              </h3>
              <div className="flex flex-wrap gap-3">
                {result.related_graph_nodes.map((node, idx) => (
                  <div key={idx} className="bg-transparent border border-brand-gold/30 text-brand-cream text-xs px-4 py-2 flex items-center">
                    <span className="font-semibold tracking-wide">{node.name}</span>
                    <span className="text-brand-gold mx-2">•</span>
                    <span className="italic text-brand-cream/50">{node.relation.replace(/_/g, ' ')}</span>
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
