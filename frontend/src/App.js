import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import pages 
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ProtectedRoute from './components/routes/ProtectedRoute';

// import css 
import "./assets/css/styles.css"
import BrowseDoctors from './pages/patient/BrowseDoctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookAppointment from './pages/patient/BookAppointment';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import encryption test for development
import { runAllTests } from './utils/encryptionTest';
import { quickTest } from './utils/quickTest';
import { clearAllEncryptionKeys } from './utils/clearKeys';

function App() {
  // Run encryption tests in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 MediConnect - End-to-End Encryption Enabled');
      
      // Make clear function available in console
      window.clearAllEncryptionKeys = clearAllEncryptionKeys;
      
      // Run quick test first, then full tests
      setTimeout(() => {
        quickTest().then(() => {
          return runAllTests();
        }).catch(console.error);
      }, 2000);
    }
  }, []);

  return(
     <Router>
      <div className="App" style={{ paddingTop: '70px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Doctor-specific Protected Routes */}
          <Route 
            path="/doctor/dashboard" 
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Patient-specific Protected Routes */}
          <Route 
            path="/patient/dashboard" 
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* General Protected Routes (for both roles) */}
          <Route 
            path="/doctors" 
            element={
              <ProtectedRoute>
                <BrowseDoctors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/:doctorId" 
            element={
              <ProtectedRoute>
                <DoctorProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-appointment/:doctorId" 
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App;