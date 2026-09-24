import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, ChevronRight } from 'lucide-react';

export default function Archive() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/documents')
      .then(r => r.json())
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Digital Archive</h1>
        <p className="text-lg text-gray-600">Browse the primary sources and historical documents in the collection.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map(doc => (
            <Link to={`/document/${doc.id}`} key={doc.id} className="group flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-200 transition-all duration-300 overflow-hidden">
              <div className="bg-brand-50 p-8 flex justify-center items-center group-hover:bg-brand-100 transition-colors">
                <Book className="w-16 h-16 text-brand-700" />
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-1 rounded-full">{doc.document_type}</span>
                    <span className="text-sm text-gray-400">{doc.language}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif group-hover:text-brand-700 transition-colors">{doc.title}</h3>
                  {doc.volume && <p className="text-sm text-gray-600 font-medium">Volume {doc.volume} {doc.part && `Part ${doc.part}`}</p>}
                </div>
                <div className="mt-6 flex items-center text-brand-600 font-semibold group-hover:text-brand-800">
                  Read Document <ChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
