import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import cytoscape from 'cytoscape';
import { Upload, Search, Download, ExternalLink, RefreshCw } from 'lucide-react';
import './App.css';

const API_BASE = "http://localhost:8000";

const fieldColors = {
  "Mathematics": "#e0f2fe",
  "Biology": "#f0fdf4",
  "Physics": "#fef2f2",
  "Sociology": "#fff7ed",
  "Economics": "#f5f3ff",
  "Computer Science": "#ecfeff",
  "Architecture": "#fff1f2",
  "Music": "#faf5ff",
  "defaults": "#f3f4f6"
};

function App() {
  const [state, setState] = useState('UPLOAD'); // UPLOAD, INPUT, RESULTS
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [context, setContext] = useState(null);
  const [point, setPoint] = useState("");
  const [results, setResults] = useState(null);
  const [structure, setStructure] = useState(null);
  const [graphData, setGraphData] = useState(null);

  const cyRef = useRef(null);
  const cyInstance = useRef(null);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setSessionId(data.session_id);
      setContext(data.context);
      setState('INPUT');
    } catch (err) {
      alert("Upload failed. Make sure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleSearch = async () => {
    if (!point.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, point }),
      });
      const data = await response.json();
      setResults(data.results);
      setStructure(data.structure);
      setGraphData(data.graph);
      setState('RESULTS');
    } catch (err) {
      alert("Search failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state === 'RESULTS' && graphData && cyRef.current) {
      cyInstance.current = cytoscape({
        container: cyRef.current,
        elements: [
          ...graphData.nodes.map(n => ({ data: n })),
          ...graphData.edges.map(e => ({ data: e }))
        ],
        style: [
          {
            selector: 'node',
            style: {
              'label': 'data(label)',
              'width': 60,
              'height': 60,
              'background-color': (ele) => ele.data('type') === 'root' ? '#2563eb' : '#94a3b8',
              'color': '#1e293b',
              'font-size': '12px',
              'text-valign': 'center',
              'text-halign': 'center',
              'color': 'white',
              'font-weight': 'bold',
              'text-wrap': 'wrap',
              'text-max-width': '50px'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#cbd5e1',
              'target-arrow-color': '#cbd5e1',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '10px',
              'color': '#64748b'
            }
          }
        ],
        layout: { name: 'cose', animate: true }
      });

      cyInstance.current.on('tap', 'node', (evt) => {
        const node = evt.target;
        if (node.data('type') === 'analogue') {
          const cardId = `result-${node.data('id')}`;
          document.getElementById(cardId)?.scrollIntoView({ behavior: 'smooth' });
          const card = document.getElementById(cardId);
          if (card) {
            card.style.ringColor = "#2563eb";
            card.style.ringWidth = "2px";
          }
        }
      });
    }
  }, [state, graphData]);

  return (
    <div className="app-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing structural analogies...</p>
        </div>
      )}

      {state === 'UPLOAD' && (
        <div className="upload-screen">
          <h1>Structural Analogy</h1>
          <p>Find cross-disciplinary support for your arguments</p>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <Upload size={48} color="var(--primary)" />
            <p>{isDragActive ? "Drop the file here" : "Drag & drop your paper (PDF or Word)"}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maximum 6,000 words extracted</span>
          </div>
        </div>
      )}

      {state === 'INPUT' && (
        <div className="point-input-screen">
          <div className="paper-loaded">
            <h3><Download size={18} inline style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Paper context loaded</h3>
            <p><strong>Domain:</strong> {context.domain}</p>
            <p><strong>Thesis:</strong> {context.thesis}</p>
          </div>
          <h2 style={{ marginTop: '2rem' }}>What point do you want to make?</h2>
          <textarea 
            value={point}
            onChange={(e) => setPoint(e.target.value)}
            placeholder="e.g. Early trauma creates self-reinforcing avoidance loops that produce the rejection they fear"
          />
          <button 
            className="btn-primary" 
            onClick={handleSearch}
            disabled={!point.trim() || loading}
          >
            Find Analogues
          </button>
        </div>
      )}

      {state === 'RESULTS' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Structural Analogies for: <span style={{ color: 'var(--primary)', fontWeight: 400 }}>"{point}"</span></h2>
            <button className="btn-primary" onClick={() => setState('INPUT')} style={{ background: '#f3f4f6', color: '#374151' }}>
              <RefreshCw size={16} style={{ marginRight: '8px' }} /> Search again
            </button>
          </div>
          
          <div className="results-screen">
            <div className="results-list">
              {results.map((res, i) => (
                <div key={i} id={`result-field-${i}`} className="result-card" style={{ borderLeftColor: fieldColors[res.field] || fieldColors.defaults }}>
                  <div className="concept">{res.field}: {res.concept}</div>
                  <div className="why">{res.why}</div>
                  
                  <div className="reframe-block">
                    {res.reframe}
                  </div>
                  
                  <div className="how-to-use">
                    <strong>How to use:</strong> {res.how_to_use}
                  </div>

                  {res.citation && (
                    <div className="citation-block">
                      <span className="citation-title">{res.citation.title}</span>
                      <div className="cit-meta">
                        <span>{res.citation.authors} ({res.citation.year})</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="badge">{res.citation.cited_by_count} citations</span>
                          {res.citation.doi && (
                            <a href={res.citation.doi} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="graph-container">
              <div id="cy" ref={cyRef}></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
