import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertTriangle, Clock } from 'lucide-react';

export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/timeline?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error("Invalid timeline data:", data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex h-[calc(100vh-76px)] items-center justify-center">Loading Timeline...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-4xl font-serif font-normal text-brand-cream mb-4 flex items-center">
          <Clock className="w-10 h-10 mr-4 text-brand-black/30 bg-brand-gold/10 p-2 rounded-full border border-brand-gold/20" />
          Historical Timeline
        </h1>
        <p className="text-lg text-brand-cream/70 leading-relaxed font-light">
          Chronological events extracted from the archive texts. Click on evidence links to view the original source material.
        </p>
      </div>

      <div className="relative border-l-2 border-white/20 ml-4 md:ml-0 md:mx-auto space-y-12 before:absolute before:inset-0 before:ml-[-1px] md:before:ml-0 md:before:left-1/2 md:before:w-px md:before:bg-white/20 md:border-l-0">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-8 md:pl-0">
            {/* Timeline dot */}
            <div className="absolute left-[-9px] md:left-1/2 md:transform md:-translate-x-1/2 top-0 w-4 h-4 rounded-full bg-brand-black border-4 border-brand-cream shadow"></div>
            
            <div className={`md:flex items-center justify-between w-full ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="hidden md:block w-5/12"></div>
              
              <div className="w-full md:w-5/12 bg-brand-black rounded-sm border border-white/10 p-8 hover:border-brand-gold/50 transition-colors">
                <div className="inline-block px-3 py-1 bg-transparent text-brand-gold border border-brand-gold/30 font-bold tracking-widest uppercase text-xs mb-4">
                  {event.year}
                </div>
                <h3 className="text-2xl font-normal font-serif text-brand-cream mb-3">{event.name}</h3>
                <p className="text-brand-cream/70 mb-6 font-light leading-relaxed">{event.description}</p>
                
                {event.related && event.related.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-3">Related Entities & Evidence</h4>
                    <ul className="space-y-3">
                      {event.related.map((rel, relIdx) => (
                        <li key={relIdx} className="text-sm bg-white/5 p-3 rounded-sm border border-white/5">
                          <span className="font-semibold text-brand-cream/90">{rel.name}</span> <span className="text-brand-cream/40 text-xs uppercase tracking-widest ml-1">({rel.type})</span>
                          <div className="mt-2">
                            {rel.evidence && rel.evidence.doc ? (
                              <Link to={`/document/${rel.evidence.doc}?page=${rel.evidence.page}`} target="_blank" className="text-xs text-brand-cream/60 hover:text-brand-gold transition-colors flex items-center">
                                <BookOpen className="w-3 h-3 mr-1" /> View in {rel.evidence.doc}
                              </Link>
                            ) : (
                              <span className="text-xs text-brand-gold/80 flex items-center opacity-80">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Needs Verification
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
