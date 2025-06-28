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
import BrowseDoctors from './pages/BrowseDoctors';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return(
     <Router>
      <div className="App" style={{ paddingTop: '70px' }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protected Route */}
        <Route path="/doctor/dashboard" element={ <ProtectedRoute> <DoctorDashboard /> </ProtectedRoute>} />
        <Route path="/patient/dashboard" element={ <ProtectedRoute> <PatientDashboard /> </ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute> <LandingPage /> </ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute><BrowseDoctors /> </ProtectedRoute>} />
        <Route path="/doctor/:doctorId" element={<ProtectedRoute><DoctorProfile /> </ProtectedRoute>} />
        <Route path="/book-appointment/:doctorId" element={<ProtectedRoute> <BookAppointment /> </ProtectedRoute>} />
      </Routes>
      <Footer />
      </div>
    </Router>
  )
}

export default App;