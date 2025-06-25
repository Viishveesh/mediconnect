import React, { useState, useEffect } from 'react';

export default function Navbar () {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-light fixed-top transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg' : 'bg-white bg-opacity-95'
    }`} style={{ backdropFilter: 'blur(10px)' }}>
      <div className="container">
        <a className="navbar-brand fw-bold fs-3" href="#" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
          <i className="fas fa-heartbeat me-2"></i>MediConnect
        </a>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link fw-medium" href="#" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium" href="#" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium" href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
            </li>
            <li className="nav-item">
              <a className="nav-link btn btn-outline-primary rounded-pill px-4 ms-2" href="#" >Login</a>
            </li>
            <li className="nav-item">
              <a className="nav-link btn btn-outline-primary rounded-pill px-4 ms-2" href="#" >Sign Up</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
