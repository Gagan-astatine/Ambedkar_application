import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Play, Pause, Volume2, AlertTriangle, Clock } from 'lucide-react';

function fmt(sec) {
  if (sec == null) return '--:--';
  const s = Math.floor(sec);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function MediaPlayer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const segRefs = useRef({});

  useEffect(() => {
    fetch(`http://localhost:8000/api/media/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, [id]);

  // Jump to timestamp from ?t= param once audio is ready
  useEffect(() => {
    const t = parseFloat(searchParams.get('t'));
    if (!isNaN(t) && audioRef.current) {
      audioRef.current.currentTime = t;
      audioRef.current.play().catch(() => {});
    }
  }, [data, searchParams]);

  // Scroll active segment into view
  useEffect(() => {
    const activeRef = segRefs.current[currentActiveIndex(data, currentTime)];
    if (activeRef) {
      activeRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentTime]);

  function currentActiveIndex(d, t) {
    if (!d?.transcript?.segments) return -1;
    return d.transcript.segments.findIndex(s => t >= s.start && t <= s.end);
  }

  const activeIdx = currentActiveIndex(data, currentTime);

  if (loading) return (
    <div className="flex h-screen items-center justify-center text-brand-cream/50 uppercase tracking-widest text-xs">
      Loading…
    </div>
  );
  if (error) return (
    <div className="flex h-screen items-center justify-center text-brand-gold/70 text-sm">
      Failed to load media: {error}
    </div>
  );

  const { media, playback_url, transcript } = data;

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-8 border-b border-white/10 pb-8">
        <p className="text-brand-gold uppercase tracking-[0.2em] text-xs font-bold mb-2">Audio</p>
        <h1 className="text-4xl font-serif font-normal text-brand-cream mb-3">{media.title}</h1>
        {media.source && (
          <p className="text-brand-cream/50 text-sm uppercase tracking-widest">
            Source: {media.source}
          </p>
        )}
        {media.external_url && (
          <a href={media.external_url} target="_blank" rel="noopener noreferrer"
            className="text-brand-gold/70 text-xs hover:text-brand-gold underline mt-1 inline-block">
            {media.external_url}
          </a>
        )}
      </div>

      {/* Audio player with Cover */}
      <div className="bg-white/5 border border-white/10 p-6 mb-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/3 aspect-square bg-brand-black flex-shrink-0 relative overflow-hidden border border-white/10 shadow-lg">
          <img 
            src="/images/AMB-IMG-008.jpeg" 
            alt="Audio Cover" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        
        <div className="w-full flex-grow">
          <div className="flex items-center gap-3 mb-6">
            <Volume2 className="w-5 h-5 text-brand-gold" />
            <span className="text-brand-cream/60 uppercase tracking-widest text-sm font-bold">Audio Player</span>
          </div>
          {playback_url ? (
            <audio
              ref={audioRef}
              src={playback_url}
              controls
              className="w-full"
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
              style={{ filter: 'invert(1) hue-rotate(180deg)' }}
            />
          ) : (
            <p className="text-brand-cream/40 italic text-sm">No playback URL available.</p>
          )}
        </div>
      </div>

      {/* Transcript panel */}
      {transcript ? (
        <div>
          <p className="text-brand-gold uppercase tracking-[0.2em] text-xs font-bold mb-4">
            Transcript
          </p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {transcript.segments.map((seg, idx) => {
              const isActive = idx === activeIdx;
              return (
                <div
                  key={seg.id}
                  ref={el => segRefs.current[idx] = el}
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = seg.start;
                      audioRef.current.play().catch(() => {});
                    }
                  }}
                  className={`flex gap-4 p-4 cursor-pointer transition-all border rounded-sm ${
                    isActive
                      ? 'bg-brand-gold/10 border-brand-gold/40'
                      : 'border-transparent hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="text-xs text-brand-gold/60 font-mono shrink-0 mt-0.5 w-12">
                    {fmt(seg.start)}
                  </span>
                  <p className={`text-sm leading-relaxed font-serif ${isActive ? 'text-brand-cream' : 'text-brand-cream/70'}`}>
                    {seg.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-brand-cream/40 italic text-sm">No transcript available.</p>
      )}
    </div>
  );
}
