import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {

  const [currentPage, setCurrentPage] = useState('landing');
  const [userType, setUserType] = useState(null); // 'patient' or 'doctor'

  const navigateTo = (page, type = null) => {
    setCurrentPage(page);
    if (type) setUserType(type);
  };

  const handleLogin = (type) => {
    setUserType(type);
    if (type === 'patient') {
      setCurrentPage('patient-dashboard');
    } else if (type === 'doctor') {
      setCurrentPage('doctor-dashboard');
    }
  };

  const handleLogout = () => {
    setUserType(null);
    setCurrentPage('landing');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'landing':
        return <LandingPage
            onLogin={handleLogin}
            onNavigate={navigateTo}
            currentUser={userType}
            onLogout={handleLogout}
        />;
      case 'patient-dashboard':
        return <PatientDashboard
            onNavigate={navigateTo}
            currentUser={userType}
            onLogout={handleLogout}
        />;
      case 'doctor-dashboard':
        return <DoctorDashboard
            onNavigate={navigateTo}
            currentUser={userType}
            onLogout={handleLogout}
        />;
      default:
        return <LandingPage
            onLogin={handleLogin}
            onNavigate={navigateTo}
            currentUser={userType}
            onLogout={handleLogout}
        />;
    }
  };

  return (
      <div className="App">
        {renderPage()}
      </div>
  );
}

export default App;