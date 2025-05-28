import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Para<span className="accent">lagent</span>
            </h1>
            <p className="hero-subtitle">
              Your AI-powered legal assistant that transforms case information into 
              professional documents, saving lawyers valuable time and effort.
            </p>
            <button className="cta-button">
              Sign Up / Log In
            </button>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-header">Legal Document</div>
              <div className="card-lines">
                <div className="line"></div>
                <div className="line short"></div>
                <div className="line"></div>
                <div className="line medium"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Generate comprehensive legal documents in minutes, not hours.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Precision Focused</h3>
              <p>AI-powered analysis ensures accuracy and attention to detail.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Confidential</h3>
              <p>Your case information is protected with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
