import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import { lookupByISBN, searchByText } from '../services/bookLookup';
import { Camera, CheckCircle, XCircle, Search, Loader2, ScanBarcode, BookCopy, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { createWorker } from 'tesseract.js';

export default function CoverScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { books } = useBooks();
  const navigate = useNavigate();
  
  const [mode, setMode]       = useState('barcode'); // 'barcode' or 'cover'
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [msg, setMsg]         = useState(null);
  const [ocrLog, setOcrLog]   = useState('');

  // --- Barcode Scanner ---
  const startBarcodeScanner = useCallback(async () => {
    console.log('[Scanner] Initializing Barcode Scanner...');
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('scanner-view');
    instanceRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { 
          fps: 15, 
          qrbox: { width: 300, height: 180 },
          formatsToSupport: [ 
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A
          ]
        },
        async (decodedText) => {
          console.log('[Scanner] Barcode detected:', decodedText);
          setLoading(true);
          try {
            const book = await lookupByISBN(decodedText);
            setLoading(false);
            if (book) {
              scanner.stop().then(() => navigate('/add', { state: { bookData: book } }));
            } else {
              setMsg({ type: 'error', text: `ISBN ${decodedText} not found in Google/OpenLibrary database.` });
            }
          } catch (e) {
            setLoading(false);
            setMsg({ type: 'error', text: 'Lookup service error. Please try again.' });
          }
        },
        () => {} // Low-level frame error noise
      );
      setRunning(true);
      setMsg(null);
    } catch (err) {
      console.error('[Scanner] Barcode start failed:', err);
      setMsg({ type: 'error', text: `Camera access denied or device busy.` });
    }
  }, [navigate]);

  const stopScanner = useCallback(() => {
    if (instanceRef.current) {
      console.log('[Scanner] Stopping barcode scanner...');
      instanceRef.current.stop().catch(e => console.warn('[Scanner] Stop warning:', e));
      instanceRef.current = null;
    }
    setRunning(false);
  }, []);

  // --- OCR / Cover Scanner ---
  const runOCR = async (imageSource) => {
    setLoading(true);
    setMsg({ type: 'info', text: 'Analyzing text on cover...' });
    setOcrLog('');
    setResults([]);

    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrLog(`Scanning... ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      console.log('[Scanner] Running OCR on source...');
      const { data: { text, confidence } } = await worker.recognize(imageSource);
      await worker.terminate();

      console.log('[Scanner] OCR raw result:', text);
      console.log('[Scanner] OCR confidence:', confidence);

      // Advanced Cleaning: extract potential Title/Authors
      // 1. Filter out short lines, numbers only, or repetitive symbols
      const lines = text.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 2 && !/^\d+$/.test(l));

      if (lines.length === 0) {
        setMsg({ type: 'error', text: 'No readable text found. Use better light or flat cover.' });
        setLoading(false);
        return;
      }

      // 2. Use the first few lines as a query (usually title is top/largest)
      const query = lines.slice(0, 3).join(' ');
      
      const matches = await searchByText(query);
      setResults(matches);
      setLoading(false);
      
      if (matches.length === 0) {
        setMsg({ type: 'error', text: `Found text: "${query.substring(0, 20)}...", but no match in database.` });
      } else {
        setMsg({ type: 'success', text: `Search complete. Found ${matches.length} matches.` });
      }
    } catch (err) {
      console.error('[Scanner] OCR Error:', err);
      setMsg({ type: 'error', text: 'Image processing failed. Try a smaller file or clearer photo.' });
      setLoading(false);
    }
  };

  const captureFromVideo = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Pass the base64 or canvas to OCR
    runOCR(canvas.toDataURL('image/jpeg', 0.8));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        runOCR(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCameraMode = async () => {
    try {
      console.log('[Scanner] Requesting camera stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setRunning(true);
        setMsg(null);
      }
    } catch (err) {
      console.error('[Scanner] Camera stream error:', err);
      setMsg({ type: 'error', text: 'Could not access camera. Check permissions.' });
    }
  };

  const stopCameraMode = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
      stopCameraMode();
    };
  }, [stopScanner, stopCameraMode]);

  const handleModeChange = (newMode) => {
    stopScanner();
    stopCameraMode();
    setMode(newMode);
    setMsg(null);
    setResults([]);
    setOcrLog('');
  };

  return (
    <div className="fade-in scanner-page">
      <div className="page-header">
        <h1>Book Scanner</h1>
        <p>Point your camera at a barcode or cover, or upload an image to test</p>
      </div>

      <div className="scanner-tabs">
        <button 
          className={`btn ${mode === 'barcode' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleModeChange('barcode')}
        >
          <ScanBarcode size={16} /> Barcode / ISBN
        </button>
        <button 
          className={`btn ${mode === 'cover' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleModeChange('cover')}
        >
          <BookCopy size={16} /> Cover Scan (OCR)
        </button>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type}`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : msg.type === 'info' ? <Loader2 className="spin" size={18} /> : <AlertCircle size={18} />}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{msg.text}</span>
            {ocrLog && <small style={{ opacity: 0.8 }}>{ocrLog}</small>}
          </div>
        </div>
      )}

      <div className="scanner-main">
        <div className="scanner-stage glass-card">
          {mode === 'barcode' ? (
            <div id="scanner-view" style={{ width: '100%', minHeight: 300 }} />
          ) : (
            <div className="video-wrap">
              <video ref={videoRef} autoPlay playsInline style={{ display: running ? 'block' : 'none' }} />
              {!running && (
                <div className="scanner-placeholder">
                  <Camera size={48} opacity={0.1} />
                  <p>Camera ready</p>
                  <button className="btn btn-primary" onClick={startCameraMode}>Open Camera</button>
                  
                  <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', color: 'var(--text-dim)' }}>
                    <hr style={{ flex: 1, opacity: 0.1 }} /> OR <hr style={{ flex: 1, opacity: 0.1 }} />
                  </div>

                  <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={16} /> Upload Book Cover
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <input 
                      type="text" 
                      id="manual-test-input"
                      placeholder="Debug: Manual Title Search" 
                      className="form-input" 
                      onKeyPress={(e) => e.key === 'Enter' && searchByText(e.target.value).then(res => setResults(res))}
                    />
                  </div>
                </div>
              )}
              {running && (
                <div className="scanner-overlay">
                  <div className="scan-frame" />
                </div>
              )}
            </div>
          )}
          
          {loading && (
            <div className="scanner-loading-overlay">
              <RefreshCw className="spin" size={40} />
              <p>Fetching Book Data...</p>
            </div>
          )}
        </div>
      </div>

      <div className="scanner-actions">
        {running && (
          <div className="flex gap-2">
            {mode === 'cover' && (
              <button className="btn btn-primary btn-lg" onClick={captureFromVideo} disabled={loading}>
                <Search size={20} /> Capture & Scan
              </button>
            )}
            <button className="btn btn-secondary btn-lg" onClick={mode === 'barcode' ? stopScanner : stopCameraMode}>
              Stop Camera
            </button>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="scan-results fade-in">
          <div className="results-header">
            <h3>Matching Results</h3>
            <span className="badge">{results.length} found</span>
          </div>
          <div className="results-list">
            {results.map(book => (
              <div 
                key={book.id} 
                className="result-item glass-card"
                onClick={() => navigate('/add', { state: { bookData: book } })}
              >
                <div className="result-cover">
                  {book.coverUrl ? <img src={book.coverUrl} alt="" /> : <BookCopy size={20} opacity={0.2} />}
                </div>
                <div className="result-info">
                  <h4>{book.title}</h4>
                  <p className="author">{book.author}</p>
                  <div className="meta">
                    {book.year && <span>{book.year}</span>}
                    {book.isbn && <span className="isbn">ISBN: {book.isbn}</span>}
                  </div>
                </div>
                <div className="result-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
