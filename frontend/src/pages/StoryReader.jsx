import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, ExternalLink, PenTool, ArrowDown } from 'lucide-react';

// Custom scroll animation block for story beats
function BeatBlock({ children }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
    >
      {children}
    </div>
  );
}

export default function StoryReader() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/stories/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(data => {
        setStory(data);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex h-screen items-center justify-center text-brand-cream/50 uppercase tracking-widest text-xs">
        Failed to load story: {error}
      </div>
    );
  }

  return (
    <div className="bg-brand-black min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center justify-center border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/60 via-brand-black/80 to-brand-black z-10" />
          <img
            src={story.cover_image || '/images/covers/hero.jpg'}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-30 grayscale"
          />
        </div>

        <div className="relative z-20 container mx-auto px-6 text-center max-w-4xl pt-20">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-xs font-bold mb-6 flex items-center justify-center gap-3">
            <span className="w-12 h-px bg-brand-gold/50" />
            Editorial Feature
            <span className="w-12 h-px bg-brand-gold/50" />
          </p>

          <h1 className="text-5xl md:text-7xl font-serif text-brand-cream leading-tight mb-8 drop-shadow-lg">
            {story.title}
          </h1>

          {story.subtitle && (
            <p className="text-xl md:text-2xl text-brand-cream/70 font-light max-w-2xl mx-auto mb-12">
              {story.subtitle}
            </p>
          )}

          <div className="flex flex-col items-center gap-4 text-brand-cream/40 text-xs uppercase tracking-widest">
            <p>By {story.author || 'Editorial Team'}</p>
            <ArrowDown className="w-6 h-6 mt-8 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Story Beats */}
      <div className="py-12">
        {story.beats && story.beats.map((beat, idx) => (
          <BeatBlock key={beat.id || idx}>
            <div className="min-h-[70vh] flex items-center justify-center py-20 px-6">
              <div className="w-full max-w-3xl mx-auto relative">

                {/* Visual Connector Line between beats */}
                {idx !== 0 && (
                  <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-brand-gold/30" />
                )}

                {/* Narrative Beat */}
                {beat.beat_type === 'narrative' && (
                  <div className="text-center">
                    <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-brand-cream/40 mb-6 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      <PenTool className="w-3 h-3" /> Editorial Narrative
                    </span>
                    <p className="text-2xl md:text-3xl font-serif text-brand-cream/90 leading-relaxed">
                      {beat.narrative_text}
                    </p>
                  </div>
                )}

                {/* Excerpt Beat */}
                {beat.beat_type === 'excerpt' && (
                  <div className="bg-brand-gold/5 border border-brand-gold/20 p-8 md:p-12 relative">
                    <span className="absolute -top-3 left-8 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-brand-black bg-brand-gold px-3 py-1">
                      <BookOpen className="w-3 h-3" /> From the archive
                    </span>

                    {beat.narrative_text && (
                      <p className="text-brand-cream/60 font-light mb-6 text-sm">
                        {beat.narrative_text}
                      </p>
                    )}

                    <blockquote className="text-xl md:text-2xl font-serif text-brand-gold italic leading-loose mb-8 border-l-2 border-brand-gold/30 pl-6">
                      "{beat.excerpt_text}"
                    </blockquote>

                    <div className="flex items-center justify-between border-t border-brand-gold/10 pt-6">
                      <div className="text-xs text-brand-cream/40 uppercase tracking-widest font-mono">
                        {beat.document_id} • Page {beat.pdf_page}
                      </div>

                      {beat.document_id && beat.pdf_page != null && (
                        <Link
                          to={`/document/${beat.document_id}?page=${beat.pdf_page}`}
                          target="_blank"
                          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-gold hover:text-white transition-colors"
                        >
                          Read in context <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline / Media beats could be added here in the future following the same pattern */}
              </div>
            </div>
          </BeatBlock>
        ))}
      </div>

      {/* Footer / End of Story */}
      <div className="py-32 text-center border-t border-white/10 mt-20">
        <div className="w-8 h-8 rounded-full bg-brand-gold mx-auto mb-6 flex items-center justify-center text-brand-black font-serif font-bold italic">
          A
        </div>
        <p className="text-brand-gold uppercase tracking-[0.2em] text-xs font-bold">
          End of feature
        </p>
        <Link to="/stories" className="inline-block mt-8 text-brand-cream/50 hover:text-white text-sm uppercase tracking-widest transition-colors underline decoration-brand-gold/30 underline-offset-8">
          Back to Stories
        </Link>
      </div>
    </div>
  );
}
