import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import BrowseDoctors from './pages/BrowseDoctors';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: '70px' }}></div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/doctors" element={<BrowseDoctors />} />
        <Route path="/doctor/:doctorId" element={<DoctorProfile />} />
        <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;


// import React from 'react';
// import LandingPage from './pages/LandingPage';

// function App() {
//   return <LandingPage />;
// }

// export default App;
