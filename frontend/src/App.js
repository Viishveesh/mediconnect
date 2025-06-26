import React, { useState } from 'react';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import pages 
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// import css 
import "./assets/css/styles.css"

function App() {
  return(
     <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Protected Route */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
         
      </div>
    </Router>
  )
}

export default App;