import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
// import LandingPage from './LandingPage'; // Removed LandingPage import
import Dashboard from './Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route "/" now renders Dashboard directly */}
          <Route path="/" element={<Dashboard />} /> 
          {/* Keep /dashboard route explicit for clarity or future direct links, though it duplicates "/" now */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
