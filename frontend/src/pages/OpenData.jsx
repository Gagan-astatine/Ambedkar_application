import { Download, Database, FileJson, FileText, CheckCircle2 } from 'lucide-react';

export default function OpenData() {
  const endpoints = [
    {
      name: "Documents Catalogue (JSON)",
      description: "Complete catalogue of all ingested documents formatted as Dublin Core metadata.",
      url: "http://localhost:8000/api/export/documents.json",
      icon: <FileJson className="w-5 h-5 text-blue-600" />
    },
    {
      name: "Documents Catalogue (CSV)",
      description: "UTF-8 encoded CSV of the document catalogue. Includes BOM for correct Hindi text rendering in Excel.",
      url: "http://localhost:8000/api/export/documents.csv",
      icon: <FileText className="w-5 h-5 text-green-600" />
    },
    {
      name: "Works (JSON)",
      description: "List of distinct works (volumes/books) available in the archive.",
      url: "http://localhost:8000/api/export/works.json",
      icon: <FileJson className="w-5 h-5 text-blue-600" />
    },
    {
      name: "Entities / Knowledge Graph (JSON)",
      description: "Export of extracted entities (people, places, concepts).",
      url: "http://localhost:8000/api/export/entities.json",
      icon: <FileJson className="w-5 h-5 text-blue-600" />
    },
    {
      name: "Timeline Events (JSON)",
      description: "Chronological events extracted from the archive texts.",
      url: "http://localhost:8000/api/export/timeline.json",
      icon: <FileJson className="w-5 h-5 text-blue-600" />
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 flex items-center">
          <Database className="w-10 h-10 mr-4 text-brand-700" />
          Open Knowledge Data
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          The Ambedkar Digital Archive is committed to open knowledge. We expose our metadata in standard 
          formats mapping to the <strong>Dublin Core (DC)</strong> schema. You can download the complete datasets below.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6">Data Exports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  {ep.icon}
                  <h3 className="font-bold text-gray-900">{ep.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">{ep.description}</p>
              </div>
              <a 
                href={ep.url} 
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-full bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-300 font-medium py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" /> Download
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-brand-50 p-6 rounded-xl border border-brand-100">
          <h3 className="font-bold text-brand-900 mb-4 text-lg">Stable ID Scheme</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-brand-600 mr-2 mt-0.5 flex-shrink-0" /> <code>AMB-EN-V01</code>: English Volume 1</li>
            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-brand-600 mr-2 mt-0.5 flex-shrink-0" /> <code>AMB-EN-V05-PT1</code>: English Vol 5, Part 1</li>
            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-brand-600 mr-2 mt-0.5 flex-shrink-0" /> <code>AMB-DOC-###</code>: Specific Documents</li>
            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-brand-600 mr-2 mt-0.5 flex-shrink-0" /> <code>AMB-EVENT-###</code>: Timeline Events</li>
            <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-brand-600 mr-2 mt-0.5 flex-shrink-0" /> <code>AMB-PERSON-###</code>: Biographical Entities</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Data License</h3>
          <p className="text-sm text-gray-700 mb-4">
            The metadata and knowledge graph exports are provided under the following license terms:
          </p>
          <div className="bg-white border border-gray-300 p-4 rounded text-center font-mono text-sm text-gray-600">
            LICENSE_TO_BE_CONFIRMED
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 border-t pt-6 text-center">
        API Base: <code className="bg-gray-100 px-1 py-0.5 rounded">/api/export/*</code> &bull; Individual Document Metadata: <code className="bg-gray-100 px-1 py-0.5 rounded">/api/documents/{"{id}"}/metadata</code>
      </div>
    </div>
  );
}
