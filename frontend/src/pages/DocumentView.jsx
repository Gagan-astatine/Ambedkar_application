import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FileText, Type } from 'lucide-react';

export default function DocumentView() {
  const { id } = useParams();
  const location = useLocation();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    // Check if we navigated here with a specific page from citations
    const params = new URLSearchParams(location.search);
    const p = params.get('page');
    if (p) {
      setPageNumber(parseInt(p));
    }

    fetch(`http://localhost:8000/api/documents/${id}`)
      .then(r => r.json())
      .then(data => {
        setDoc(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, location]);

  useEffect(() => {
    if (!doc) return;
    fetch(`http://localhost:8000/api/documents/${id}/pages/${pageNumber}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setPageData(data))
      .catch(err => console.error(err));
  }, [id, pageNumber, doc]);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900"></div></div>;
  if (!doc) return <div className="text-center p-20 text-xl text-gray-500">Document not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] bg-brand-black">
      <div className="bg-brand-black border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-normal text-brand-cream">{doc.title}</h1>
          <p className="text-xs uppercase tracking-widest text-brand-gold mt-1">{doc.document_type} &bull; Volume {doc.volume}</p>
        </div>
        <div className="flex items-center space-x-3 bg-white/5 p-1 rounded-sm border border-white/10">
          <button 
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            className="px-3 py-1 bg-white text-brand-black shadow-sm rounded-sm hover:bg-brand-cream transition-colors text-xs uppercase tracking-widest font-bold"
          >
            Prev
          </button>
          <span className="text-xs uppercase tracking-widest text-brand-cream font-medium px-2">Page {pageNumber}</span>
          <button 
            onClick={() => setPageNumber(pageNumber + 1)}
            className="px-3 py-1 bg-white text-brand-black shadow-sm rounded-sm hover:bg-brand-cream transition-colors text-xs uppercase tracking-widest font-bold"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-2/3 bg-brand-black border-r border-white/10 flex flex-col relative">
          {doc.signed_pdf_url ? (
            <iframe 
              key={`${id}#page=${pageNumber}`}
              src={`http://localhost:8000/api/documents/${id}/pdf#page=${pageNumber}&view=FitH`} 
              className="w-full h-full grayscale-[0.2]"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-brand-cream/30">
              <FileText className="w-16 h-16 mb-4 opacity-50 text-brand-gold" />
              <p className="font-light uppercase tracking-widest text-xs">PDF not available for viewing</p>
            </div>
          )}
        </div>

        {/* Extracted Text Panel */}
        <div className="w-1/3 bg-brand-black flex flex-col">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center text-brand-cream/70 font-medium uppercase tracking-widest text-xs">
            <Type className="w-4 h-4 mr-2 text-brand-gold" /> Extracted Text (Page {pageNumber})
          </div>
          <div className="p-8 overflow-y-auto flex-grow prose prose-sm max-w-none font-serif leading-relaxed text-brand-cream/90 text-lg">
            {pageData ? (
              pageData.text ? (
                <div className="whitespace-pre-wrap">{pageData.text}</div>
              ) : (
                <p className="text-brand-cream/30 italic font-light">No text extracted for this page.</p>
              )
            ) : (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1 opacity-20">
                  <div className="h-2 bg-brand-cream rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-brand-cream rounded"></div>
                    <div className="h-2 bg-brand-cream rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            )}
            {pageData?.ocr_required && (
              <div className="mt-8 p-4 bg-brand-gold/10 text-brand-gold rounded-sm border border-brand-gold/20 flex items-start">
                <span className="font-bold mr-2 uppercase tracking-widest text-xs">Note:</span> <span className="text-sm font-light">This page was flagged for OCR improvement. Text might be incomplete.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
