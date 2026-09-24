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
      <div className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="w-10 h-10 mr-4 text-brand-700" />
          Historical Timeline
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          Chronological events extracted from the archive texts. Click on evidence links to view the original source material.
        </p>
      </div>

      <div className="relative border-l-2 border-brand-200 ml-4 md:ml-0 md:mx-auto space-y-12">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-8 md:pl-0">
            {/* Timeline dot */}
            <div className="absolute left-[-9px] md:left-1/2 md:transform md:-translate-x-1/2 top-0 w-4 h-4 rounded-full bg-brand-500 border-4 border-white shadow"></div>
            
            <div className={`md:flex items-center justify-between w-full ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="hidden md:block w-5/12"></div>
              
              <div className="w-full md:w-5/12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="inline-block px-3 py-1 bg-brand-100 text-brand-800 font-bold rounded-full text-sm mb-3">
                  {event.year}
                </div>
                <h3 className="text-xl font-bold font-serif mb-2">{event.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{event.description}</p>
                
                {event.related && event.related.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Related Entities & Evidence</h4>
                    <ul className="space-y-2">
                      {event.related.map((rel, relIdx) => (
                        <li key={relIdx} className="text-sm bg-gray-50 p-2 rounded">
                          <span className="font-semibold">{rel.name}</span> <span className="text-gray-500 text-xs">({rel.type})</span>
                          <div className="mt-1">
                            {rel.evidence && rel.evidence.doc ? (
                              <Link to={`/document/${rel.evidence.doc}?page=${rel.evidence.page}`} target="_blank" className="text-xs text-brand-600 hover:underline flex items-center">
                                <BookOpen className="w-3 h-3 mr-1" /> View in {rel.evidence.doc}
                              </Link>
                            ) : (
                              <span className="text-xs text-orange-600 flex items-center">
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
