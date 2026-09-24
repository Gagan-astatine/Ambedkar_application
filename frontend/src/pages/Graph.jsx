import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Link } from 'react-router-dom';
import { Network, Info, BookOpen, AlertTriangle } from 'lucide-react';

export default function Graph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const graphRef = useRef(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/export/entities.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(graphData => {
        if (!graphData || !graphData.nodes) {
          console.error("Invalid graph data:", graphData);
          setLoading(false);
          return;
        }
        const nodes = graphData.nodes.map(n => ({
          ...n,
          val: n.type === 'Person' ? 20 : n.type === 'Event' ? 15 : 10,
          color: getColor(n.type)
        }));
        
        const links = graphData.links.map(l => ({
          ...l,
          source: l.source_id,
          target: l.target_id,
          name: l.relationship_type
        }));

        setData({ nodes, links });
        setLoading(false);
      });
  }, []);

  const getColor = (type) => {
    const colors = {
      'Person': '#2563eb',
      'Event': '#dc2626',
      'Organization': '#16a34a',
      'Topic': '#d97706',
      'Location': '#9333ea',
      'Work': '#0891b2'
    };
    return colors[type] || '#6b7280';
  };

  const handleNodeClick = useCallback(node => {
    // Fetch full entity details including evidence from relations
    fetch(`http://localhost:8000/api/entities/${node.id}`)
      .then(res => res.json())
      .then(fullNode => {
        setSelectedNode(fullNode);
      });
      
    // Center graph on node
    graphRef.current.centerAt(node.x, node.y, 1000);
    graphRef.current.zoom(2, 2000);
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading Graph...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-76px)]">
      {/* Graph Area */}
      <div className="flex-1 bg-gray-50 relative">
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeLabel="name"
          nodeColor="color"
          nodeRelSize={1}
          onNodeClick={handleNodeClick}
          linkColor={() => '#cbd5e1'}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
        />
        <div className="absolute top-4 left-4 bg-white p-3 rounded shadow text-sm font-medium flex gap-4">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>Person</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>Event</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>Org</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-600 mr-2"></div>Topic</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>Location</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-cyan-600 mr-2"></div>Work</div>
        </div>
      </div>

      {/* Side Panel */}
      <div className={`w-96 bg-white shadow-xl border-l overflow-y-auto transition-transform ${selectedNode ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full'}`}>
        {selectedNode && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-serif font-bold">{selectedNode.name}</h2>
              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded mb-4">
              {selectedNode.type} {selectedNode.year && `• ${selectedNode.year}`}
            </div>
            
            <p className="text-gray-700 mb-6">{selectedNode.description}</p>

            <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Relationships</h3>
            
            <div className="space-y-4">
              {selectedNode.relationships?.outgoing.map((rel, idx) => (
                <div key={`out-${idx}`} className="bg-gray-50 p-3 rounded text-sm">
                  <div className="font-medium mb-1">
                    <span className="text-gray-500">{rel.relationship_type.replace(/_/g, ' ')}</span> &rarr; {rel.target.name}
                  </div>
                  {rel.evidence_document_id ? (
                    <Link to={`/document/${rel.evidence_document_id}?page=${rel.evidence_page}`} target="_blank" className="text-xs text-brand-600 hover:underline flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" /> Verified in {rel.evidence_document_id} (p. {rel.evidence_page})
                    </Link>
                  ) : (
                    <span className="text-xs text-orange-600 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Needs Verification
                    </span>
                  )}
                </div>
              ))}
              
              {selectedNode.relationships?.incoming.map((rel, idx) => (
                <div key={`in-${idx}`} className="bg-gray-50 p-3 rounded text-sm border-l-2 border-brand-300">
                  <div className="font-medium mb-1">
                    {rel.source.name} <span className="text-gray-500">&rarr; {rel.relationship_type.replace(/_/g, ' ')}</span>
                  </div>
                  {rel.evidence_document_id ? (
                    <Link to={`/document/${rel.evidence_document_id}?page=${rel.evidence_page}`} target="_blank" className="text-xs text-brand-600 hover:underline flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" /> Verified in {rel.evidence_document_id} (p. {rel.evidence_page})
                    </Link>
                  ) : (
                    <span className="text-xs text-orange-600 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Needs Verification
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
