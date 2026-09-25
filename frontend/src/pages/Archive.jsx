import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, ChevronRight, Play, Headphones, FileText } from 'lucide-react';

export default function Archive() {
  const [documents, setDocuments] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'audio'

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/documents').then(r => r.json()),
      fetch('http://localhost:8000/api/media').then(r => r.json())
    ])
    .then(([docsData, mediaData]) => {
      setDocuments(docsData || []);
      setMedia(mediaData || []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-10 border-b border-white/10 pb-6">
        <p className="text-brand-gold uppercase tracking-[0.2em] text-xs font-bold mb-2">The Collection</p>
        <h1 className="text-5xl font-serif font-normal text-brand-cream mb-4">Digital Archive</h1>
        <p className="text-lg text-brand-cream/70 font-light max-w-2xl">Browse the primary sources, historical documents, and audio recordings in the collection.</p>
      </div>

      <div className="flex space-x-6 border-b border-white/10 mb-10">
        <button 
          onClick={() => setActiveTab('text')}
          className={`pb-4 px-2 uppercase tracking-[0.2em] text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'text' 
              ? 'text-brand-gold border-brand-gold' 
              : 'text-brand-cream/40 border-transparent hover:text-brand-cream/80'
          }`}
        >
          <FileText className="w-4 h-4" /> Text Archives
        </button>
        <button 
          onClick={() => setActiveTab('audio')}
          className={`pb-4 px-2 uppercase tracking-[0.2em] text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'audio' 
              ? 'text-brand-gold border-brand-gold' 
              : 'text-brand-cream/40 border-transparent hover:text-brand-cream/80'
          }`}
        >
          <Headphones className="w-4 h-4" /> Audio Archives
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      ) : activeTab === 'text' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(documents || []).map((doc, index) => (
            <Link to={`/document/${doc.id}`} key={doc.id} className="group flex flex-col bg-brand-black rounded-sm shadow-sm border border-white/10 hover:border-brand-gold/50 transition-all duration-300 overflow-hidden">
              <div className="bg-brand-black aspect-[4/3] flex justify-center items-center overflow-hidden border-b border-white/10 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent z-10" />
                <img 
                  src={`/images/covers/vol_${(index % 5) + 1}.jpg`} 
                  alt="Volume Cover" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-90 grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">{doc.document_type}</span>
                    <span className="text-xs text-brand-cream/40 uppercase tracking-widest">{doc.language}</span>
                  </div>
                  <h3 className="text-xl font-normal text-brand-cream mb-2 font-serif group-hover:text-brand-gold transition-colors">{doc.title}</h3>
                  {doc.volume && <p className="text-sm text-brand-cream/50 font-light italic">Volume {doc.volume} {doc.part && `Part ${doc.part}`}</p>}
                </div>
                <div className="mt-6 flex items-center text-brand-cream/80 text-sm uppercase tracking-widest font-semibold group-hover:text-brand-gold transition-colors">
                  Read Document <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(media || []).map((item, index) => (
            <Link to={`/media/${item.id}`} key={item.id} className="group flex flex-col bg-brand-black rounded-sm shadow-sm border border-white/10 hover:border-brand-gold/50 transition-all duration-300 overflow-hidden">
              <div className="bg-brand-black aspect-[4/3] flex justify-center items-center overflow-hidden border-b border-white/10 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent z-10" />
                <img 
                  src={`/images/AMB-IMG-008.jpeg`} 
                  alt="Audio Cover" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-90 grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-brand-gold/90 flex items-center justify-center text-brand-black">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">{item.type}</span>
                    <span className="text-xs text-brand-cream/40 uppercase tracking-widest">{item.language || 'en'}</span>
                  </div>
                  <h3 className="text-xl font-normal text-brand-cream mb-2 font-serif group-hover:text-brand-gold transition-colors">{item.title}</h3>
                  {item.year && <p className="text-sm text-brand-cream/50 font-light italic">Year {item.year}</p>}
                </div>
                <div className="mt-6 flex items-center text-brand-cream/80 text-sm uppercase tracking-widest font-semibold group-hover:text-brand-gold transition-colors">
                  Listen <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
          {(media || []).length === 0 && (
            <div className="col-span-full py-12 text-center border border-white/5">
              <p className="text-brand-cream/50 italic">No audio archives available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
