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
    <div className="flex flex-col h-[calc(100vh-76px)]">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">{doc.title}</h1>
          <p className="text-sm text-gray-500">{doc.document_type} &bull; Volume {doc.volume}</p>
        </div>
        <div className="flex items-center space-x-3 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            className="px-3 py-1 bg-white shadow-sm rounded-md hover:bg-gray-50 transition"
          >
            Prev
          </button>
          <span className="text-sm font-medium px-2">Page {pageNumber}</span>
          <button 
            onClick={() => setPageNumber(pageNumber + 1)}
            className="px-3 py-1 bg-white shadow-sm rounded-md hover:bg-gray-50 transition"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-2/3 bg-gray-200 border-r flex flex-col relative">
          {doc.signed_pdf_url ? (
            <iframe 
              key={`${id}#page=${pageNumber}`}
              src={`http://localhost:8000/api/documents/${id}/pdf#page=${pageNumber}&view=FitH`} 
              className="w-full h-full"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p>PDF not available for viewing</p>
            </div>
          )}
        </div>

        {/* Extracted Text Panel */}
        <div className="w-1/3 bg-white flex flex-col">
          <div className="p-4 bg-gray-50 border-b flex items-center text-gray-700 font-medium">
            <Type className="w-5 h-5 mr-2 text-brand-600" /> Extracted Text (Page {pageNumber})
          </div>
          <div className="p-6 overflow-y-auto flex-grow prose prose-sm max-w-none font-serif leading-relaxed text-gray-800">
            {pageData ? (
              pageData.text ? (
                <div className="whitespace-pre-wrap">{pageData.text}</div>
              ) : (
                <p className="text-gray-400 italic">No text extracted for this page.</p>
              )
            ) : (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            )}
            {pageData?.ocr_required && (
              <div className="mt-8 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200 flex items-start">
                <span className="font-bold mr-2">Note:</span> This page was flagged for OCR improvement. Text might be incomplete.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
