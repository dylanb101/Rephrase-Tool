import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import ForceGraph3D from 'react-force-graph-3d';
import { Upload, Search, Download, ExternalLink, RefreshCw, Box } from 'lucide-react';
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

  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [state]);

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

  // No longer using cytoscape effect, react-force-graph handles updates via props

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
          <p>Upload a document first to provide context</p>
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

                  <div className="reframe-header">Reframed Point</div>
                  <div className="reframe-block">
                    {res.reframe}
                  </div>

                  {res.strength && (
                    <div className="strength-meter">
                      <div className="strength-label">
                        <span>Structural Strength</span>
                        <span>{(res.strength * 10).toFixed(1)}/10</span>
                      </div>
                      <div className="strength-bar-bg">
                        <div className="strength-bar-fill" style={{ width: `${res.strength * 100}%`, backgroundColor: res.strength > 0.7 ? '#10b981' : (res.strength > 0.4 ? '#f59e0b' : '#ef4444') }}></div>
                      </div>
                      <p className="strength-justification">{res.justification}</p>
                    </div>
                  )}

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

            <div className="graph-container" ref={containerRef}>
              <ForceGraph3D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={{
                  nodes: graphData.nodes,
                  links: graphData.edges.map(e => ({
                    source: e.source,
                    target: e.target,
                    label: e.label,
                    strength: e.strength || 0.5
                  }))
                }}
                nodeLabel={node => `${node.label}${node.strength ? ` (Strength: ${(node.strength * 10).toFixed(1)}/10)` : ''}`}
                nodeColor={node => node.type === 'root' ? '#2563eb' : (fieldColors[node.label] || '#94a3b8')}
                nodeRelSize={8}
                linkColor={() => '#94a3b8'}
                linkWidth={1.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={d => (d.strength || 0.5) * 0.01}
                backgroundColor="#f8fafc"
                cooldownTicks={100}
                onEngineStop={() => {
                  // After initial layout, we can fix positions if we want "depth" to be more apparent
                }}
                onNodeClick={node => {
                  if (node.type === 'analogue') {
                    const cardId = `result-${node.id}`;
                    document.getElementById(cardId)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                // Custom link distance based on strength with more variance
                d3Force={(forceName, force) => {
                  if (forceName === 'link') {
                    force.distance(link => {
                      // Wider range for distance: 50 to 350
                      // Lower strength = much longer distance
                      const baseDist = (1 - (link.strength || 0.5)) * 300 + 50;
                      // Add a small jitter so no two lines are EXACTLY the same length
                      const jitter = (Math.sin(link.index) * 10);
                      return baseDist + jitter;
                    });
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
