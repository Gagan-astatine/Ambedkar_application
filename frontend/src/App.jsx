import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Archive from './pages/Archive';
import DocumentView from './pages/DocumentView';
import Research from './pages/Research';
import Search from './pages/Search';
import OpenData from './pages/OpenData';
import Graph from './pages/Graph';
import Timeline from './pages/Timeline';
import { BookOpen, Search as SearchIcon, Library, Sparkles, Database, Network, Clock } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans">
        <header className="bg-brand-900 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3 text-2xl font-serif font-bold hover:text-brand-100 transition-colors">
              <Library className="w-8 h-8" />
              <span>Ambedkar Digital Archive</span>
            </Link>
            <nav className="flex space-x-6">
              <Link to="/archive" className="flex items-center space-x-2 text-lg hover:text-brand-100 transition-colors">
                <BookOpen className="w-5 h-5" />
                <span>Archive</span>
              </Link>
              <Link to="/search" className="flex items-center space-x-2 text-lg hover:text-brand-100 transition-colors">
                <SearchIcon className="w-5 h-5" />
                <span>Search</span>
              </Link>
              <Link to="/open-data" className="flex items-center space-x-2 text-lg hover:text-brand-100 transition-colors">
                <Database className="w-5 h-5" />
                <span>Open Data</span>
              </Link>
              <Link to="/graph" className="flex items-center space-x-2 text-lg hover:text-brand-100 transition-colors">
                <Network className="w-5 h-5" />
                <span>Graph</span>
              </Link>
              <Link to="/timeline" className="flex items-center space-x-2 text-lg hover:text-brand-100 transition-colors">
                <Clock className="w-5 h-5" />
                <span>Timeline</span>
              </Link>
              <Link to="/research" className="flex items-center space-x-2 text-lg font-medium bg-brand-500 hover:bg-brand-400 px-4 py-2 rounded-full transition-colors">
                <Sparkles className="w-5 h-5" />
                <span>AI Assistant</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">Preserving Institutional Knowledge</h1>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
                  Explore the collected writings and speeches of Dr. B. R. Ambedkar through an AI-powered semantic search and research assistant.
                </p>
                <div className="flex space-x-4">
                  <Link to="/archive" className="bg-brand-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-800 transition-shadow shadow-md">
                    Browse Archive
                  </Link>
                  <Link to="/research" className="bg-white text-brand-900 border-2 border-brand-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-50 transition-colors shadow-sm">
                    Ask AI Assistant
                  </Link>
                </div>
              </div>
            } />
            <Route path="/archive" element={<Archive />} />
            <Route path="/document/:id" element={<DocumentView />} />
            <Route path="/research" element={<Research />} />
            <Route path="/search" element={<Search />} />
            <Route path="/open-data" element={<OpenData />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/timeline" element={<Timeline />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
