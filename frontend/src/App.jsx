import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Archive from './pages/Archive';
import DocumentView from './pages/DocumentView';
import Research from './pages/Research';
import Search from './pages/Search';
import OpenData from './pages/OpenData';
import Graph from './pages/Graph';
import Timeline from './pages/Timeline';
import MediaPlayer from './pages/MediaPlayer';
import { BookOpen, Search as SearchIcon, Library, Sparkles, Database, Network, Clock } from 'lucide-react';

import GlowPillar from './components/GlowPillar';
import SectionBlock from './components/SectionBlock';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-brand-black text-brand-cream">
        <header className="border-b border-white/10 sticky top-0 z-50 bg-brand-black/80 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3 text-2xl font-serif font-bold hover:text-brand-100 transition-colors">
              <Library className="w-8 h-8" />
              <span>Ambedkar Digital Archive</span>
            </Link>
            <nav className="flex space-x-8 text-sm uppercase tracking-widest font-medium">
              <Link to="/archive" className="flex items-center hover:text-brand-gold transition-colors">
                Archive
              </Link>
              <Link to="/search" className="flex items-center hover:text-brand-gold transition-colors">
                Search
              </Link>
              <Link to="/timeline" className="flex items-center hover:text-brand-gold transition-colors">
                Timeline
              </Link>
              <Link to="/research" className="flex items-center text-brand-black bg-brand-gold hover:bg-white px-4 py-2 rounded-sm transition-colors">
                Assistant
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col relative w-full overflow-hidden">
                {/* Glow Pillars Behind Hero */}
                <GlowPillar width="120px" left="30%" rotation="-15deg" opacity={0.4} delay="0s" />
                <GlowPillar width="80px" left="70%" rotation="10deg" opacity={0.3} delay="2s" />
                <GlowPillar width="150px" left="50%" rotation="-5deg" opacity={0.5} delay="4s" />

                {/* Hero Section */}
                <section 
                  className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 relative z-10"
                  style={{
                    backgroundImage: "linear-gradient(rgba(10, 10, 10, 0.7), rgba(10, 10, 10, 0.9)), url('/images/covers/hero.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                  }}
                >
                  <div className="absolute inset-0 bg-brand-black/60 pointer-events-none mix-blend-multiply" />
                  <div className="relative z-10 max-w-4xl mx-auto">
                    <p className="text-brand-gold uppercase tracking-[0.3em] text-xs md:text-sm font-bold mb-6 mt-16">The Digital Collection</p>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-normal text-brand-cream mb-8 leading-snug">
                      The Collected Works of Dr. B.R. Ambedkar
                    </h1>
                    <p className="text-xl text-brand-cream/70 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                      Explore the digital repository preserving the institutional knowledge and primary sources of the architect of India's Constitution.
                    </p>
                    <div className="flex justify-center space-x-6">
                      <Link to="/archive" className="border border-brand-cream/30 text-brand-cream px-8 py-3 rounded-sm text-sm uppercase tracking-widest hover:bg-brand-cream hover:text-brand-black transition-colors">
                        Browse Archive
                      </Link>
                      <Link to="/research" className="bg-brand-gold text-brand-black px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-semibold hover:bg-white transition-colors">
                        Ask AI Assistant
                      </Link>
                    </div>
                  </div>
                </section>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent my-12" />

                {/* 5 Alternating Intro Sections */}
                <SectionBlock
                  eyebrow="Introduction"
                  headline="Original Manuscripts"
                  description="Read the exact words directly from the source material. Every document in the archive is fully digitized, allowing researchers to explore authentic historical texts without reliance on secondary interpretations."
                  imageLabel="1"
                  reverse={false}
                />
                
                <SectionBlock
                  eyebrow="Discovery"
                  headline="Semantic Search"
                  description="Search across thousands of pages by meaning, not just keywords. Our AI-powered search understands the context of your queries, surfacing relevant historical insights even when exact phrasing differs."
                  imageLabel="2"
                  reverse={true}
                />
                
                <SectionBlock
                  eyebrow="AI Assistant"
                  headline="Source-Cited Answers"
                  description="Ask complex questions and our AI will synthesize answers directly cited to the original texts. Avoid hallucinations with responses firmly grounded in verified archival data."
                  imageLabel="3"
                  reverse={false}
                />

                <SectionBlock
                  eyebrow="Context"
                  headline="Historical Timeline"
                  description="Explore chronological events extracted straight from the primary sources. Understand the sequence of constitutional debates, social movements, and key milestones in Ambedkar's life."
                  imageLabel="4"
                  reverse={true}
                />

                <SectionBlock
                  eyebrow="Connections"
                  headline="Knowledge Graph"
                  description="See how people, places, and movements interconnect through interactive visualizations. Trace the relationships between historical figures and the evolution of core concepts over time."
                  imageLabel="5"
                  reverse={false}
                />
              </div>
            } />
            <Route path="/archive" element={<Archive />} />
            <Route path="/document/:id" element={<DocumentView />} />
            <Route path="/research" element={<Research />} />
            <Route path="/search" element={<Search />} />
            <Route path="/open-data" element={<OpenData />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/media/:id" element={<MediaPlayer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
