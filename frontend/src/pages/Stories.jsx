import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/stories')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => {
        setStories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-12 border-b border-white/10 pb-8 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-serif font-normal text-brand-cream mb-4">Editorial Stories</h1>
        <p className="text-lg text-brand-cream/70 font-light">
          Curated narratives connecting primary sources across the archive.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(stories || []).map(story => (
            <Link key={story.id} to={`/stories/${story.id}`} className="group block bg-brand-black border border-white/10 hover:border-brand-gold/50 transition-all duration-300">
              <div className="aspect-[16/9] relative overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent z-10" />
                <img 
                  src={story.cover_image || '/images/covers/hero.jpg'} 
                  alt="Story Cover" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-90 grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <p className="text-brand-gold uppercase tracking-[0.2em] text-[10px] font-bold mb-3 flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Scrollytelling
                </p>
                <h3 className="text-2xl font-serif text-brand-cream mb-3 group-hover:text-brand-gold transition-colors">{story.title}</h3>
                {story.subtitle && (
                  <p className="text-brand-cream/60 font-light text-sm line-clamp-2">{story.subtitle}</p>
                )}
                <div className="mt-6 flex justify-between items-center text-xs text-brand-cream/40 uppercase tracking-widest">
                  <span>{story.author || 'Editorial Team'}</span>
                </div>
              </div>
            </Link>
          ))}
          {(stories || []).length === 0 && (
            <div className="col-span-full py-20 text-center border border-white/5">
              <p className="text-brand-cream/50 italic">No stories published yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
