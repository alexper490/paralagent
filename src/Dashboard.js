import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [textContent, setTextContent] = useState('');
  const [caseFiles, setCaseFiles] = useState([]);
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [dragOver, setDragOver] = useState({ case: false, reference: false });

  // Supported file types
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const supportedExtensions = ['.pdf', '.doc', '.docx'];

  // Check if file type is supported
  const isFileSupported = (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return supportedTypes.includes(file.type) || supportedExtensions.includes(fileExtension);
  };

  // Handle file selection
  const handleFileSelect = (files, type) => {
    const validFiles = Array.from(files).filter(file => {
      if (!isFileSupported(file)) {
        alert(`File "${file.name}" is not supported. Please upload PDF or Word documents only.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const fileObjects = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));

      if (type === 'case') {
        setCaseFiles(prev => [...prev, ...fileObjects]);
      } else {
        setReferenceFiles(prev => [...prev, ...fileObjects]);
      }
    }
  };

  // Handle drag events
  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
    const files = e.dataTransfer.files;
    handleFileSelect(files, type);
  };

  // Handle file input change
  const handleFileInputChange = (e, type) => {
    const files = e.target.files;
    handleFileSelect(files, type);
    e.target.value = ''; // Reset input
  };

  // Handle file download/copy
  const handleFileClick = (fileObj) => {
    const url = URL.createObjectURL(fileObj.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileObj.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Remove file
  const removeFile = (fileId, type) => {
    if (type === 'case') {
      setCaseFiles(prev => prev.filter(file => file.id !== fileId));
    } else {
      setReferenceFiles(prev => prev.filter(file => file.id !== fileId));
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">
            Para<span className="accent">lagent</span>
          </h1>
          <p className="dashboard-subtitle">AI Legal Document Generator</p>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-grid">
            {/* First Box - Upload Case Files */}
            <div className="dashboard-box">
              <div className="box-header">
                <h3>Case Documents</h3>
                <p>Upload relevant case files and documents</p>
              </div>
              <div className="box-content">
                <div 
                  className={`upload-area ${dragOver.case ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'case')}
                  onDragLeave={(e) => handleDragLeave(e, 'case')}
                  onDrop={(e) => handleDrop(e, 'case')}
                >
                  <div className="upload-icon">📄</div>
                  <input
                    type="file"
                    id="case-file-input"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileInputChange(e, 'case')}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="upload-button"
                    onClick={() => document.getElementById('case-file-input').click()}
                  >
                    Upload a File
                  </button>
                  <p className="upload-hint">
                    Drag and drop files here or click to browse<br/>
                    <small>Supports: PDF, DOC, DOCX</small>
                  </p>
                </div>
                
                {/* Display uploaded files */}
                {caseFiles.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    {caseFiles.map(file => (
                      <div key={file.id} className="file-item">
                        <span 
                          className="file-name"
                          onClick={() => handleFileClick(file)}
                          title="Click to download"
                        >
                          📄 {file.name}
                        </span>
                        <span className="file-size">({formatFileSize(file.size)})</span>
                        <button 
                          className="remove-file"
                          onClick={() => removeFile(file.id, 'case')}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Second Box - Expanding Text Box */}
            <div className="dashboard-box">
              <div className="box-header">
                <h3>Case Information</h3>
                <p>Provide additional context and details</p>
              </div>
              <div className="box-content">
                <div className="text-area-container">
                  <textarea
                    className="expanding-text-box"
                    placeholder="Enter case details, background information, specific requirements, or any additional context that will help generate your legal document..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows="8"
                  />
                  <div className="text-counter">
                    {textContent.length} characters
                  </div>
                </div>
              </div>
            </div>

            {/* Third Box - Upload Reference Files */}
            <div className="dashboard-box">
              <div className="box-header">
                <h3>Reference Materials</h3>
                <p>Upload templates or reference documents</p>
              </div>
              <div className="box-content">
                <div 
                  className={`upload-area ${dragOver.reference ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'reference')}
                  onDragLeave={(e) => handleDragLeave(e, 'reference')}
                  onDrop={(e) => handleDrop(e, 'reference')}
                >
                  <div className="upload-icon">📋</div>
                  <input
                    type="file"
                    id="reference-file-input"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileInputChange(e, 'reference')}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="upload-button"
                    onClick={() => document.getElementById('reference-file-input').click()}
                  >
                    Upload a File
                  </button>
                  <p className="upload-hint">
                    Templates, precedents, or style guides<br/>
                    <small>Supports: PDF, DOC, DOCX</small>
                  </p>
                </div>
                
                {/* Display uploaded files */}
                {referenceFiles.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    {referenceFiles.map(file => (
                      <div key={file.id} className="file-item">
                        <span 
                          className="file-name"
                          onClick={() => handleFileClick(file)}
                          title="Click to download"
                        >
                          📋 {file.name}
                        </span>
                        <span className="file-size">({formatFileSize(file.size)})</span>
                        <button 
                          className="remove-file"
                          onClick={() => removeFile(file.id, 'reference')}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Create Document Button */}
          <div className="action-section">
            <button className="create-document-button">
              <span className="button-icon">✨</span>
              Create Document
            </button>
            <p className="action-hint">
              Generate your legal document using AI analysis
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 