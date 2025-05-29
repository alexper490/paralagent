import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [textContent, setTextContent] = useState('');

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
            {/* First Box - Upload File */}
            <div className="dashboard-box">
              <div className="box-header">
                <h3>Case Documents</h3>
                <p>Upload relevant case files and documents</p>
              </div>
              <div className="box-content">
                <div className="upload-area">
                  <div className="upload-icon">📄</div>
                  <button className="upload-button">
                    Upload a File
                  </button>
                  <p className="upload-hint">
                    Drag and drop files here or click to browse
                  </p>
                </div>
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

            {/* Third Box - Upload File */}
            <div className="dashboard-box">
              <div className="box-header">
                <h3>Reference Materials</h3>
                <p>Upload templates or reference documents</p>
              </div>
              <div className="box-content">
                <div className="upload-area">
                  <div className="upload-icon">📋</div>
                  <button className="upload-button">
                    Upload a File
                  </button>
                  <p className="upload-hint">
                    Templates, precedents, or style guides
                  </p>
                </div>
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