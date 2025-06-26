import React, { useState, useEffect } from 'react';

export default function Navbar({ onLogin, currentUser, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDemoDropdown(false);
      setShowUserDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLogout) {
      onLogout();
    }
    setShowUserDropdown(false);
  };

  const handleDemoLogin = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Demo login clicked:', type);
    if (onLogin) {
      onLogin(type);
    }
    setShowDemoDropdown(false);
  };

  const toggleDemoDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDemoDropdown(!showDemoDropdown);
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserDropdown(!showUserDropdown);
    setShowDemoDropdown(false);
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

              {currentUser ? (
                  <>
                    {/* Logged in user dropdown */}
                    <li className="nav-item position-relative">
                      <button
                          className="btn nav-link dropdown-toggle fw-medium border-0 bg-transparent"
                          onClick={toggleUserDropdown}
                          style={{ cursor: 'pointer' }}
                      >
                        <i className={`fas ${currentUser === 'doctor' ? 'fa-user-md' : 'fa-user'} me-2`}></i>
                        {currentUser === 'doctor' ? 'Dr. Emily Chen' : 'Sarah Johnson'}
                      </button>

                      {/* Custom User Dropdown */}
                      {showUserDropdown && (
                          <div
                              className="position-absolute bg-white border rounded shadow-lg"
                              style={{
                                top: '100%',
                                right: '0',
                                minWidth: '200px',
                                zIndex: 1000,
                                marginTop: '5px'
                              }}
                              onClick={(e) => e.stopPropagation()}
                          >
                            <a className="dropdown-item d-block px-3 py-2 text-decoration-none text-dark" href="#" style={{ borderBottom: '1px solid #eee' }}>
                              <i className="fas fa-user me-2"></i>Profile
                            </a>
                            <a className="dropdown-item d-block px-3 py-2 text-decoration-none text-dark" href="#" style={{ borderBottom: '1px solid #eee' }}>
                              <i className="fas fa-cog me-2"></i>Settings
                            </a>
                            <a
                                className="dropdown-item d-block px-3 py-2 text-decoration-none text-danger"
                                href="#"
                                onClick={handleLogout}
                                style={{ cursor: 'pointer' }}
                            >
                              <i className="fas fa-sign-out-alt me-2"></i>Logout
                            </a>
                          </div>
                      )}
                    </li>
                  </>
              ) : (
                  <>
                    {/* Demo Login Dropdown */}
                    <li className="nav-item position-relative me-2">
                      <button
                          className="btn btn-outline-primary rounded-pill px-4"
                          onClick={toggleDemoDropdown}
                          style={{ cursor: 'pointer' }}
                      >
                        Demo Login <i className="fas fa-chevron-down ms-1"></i>
                      </button>

                      {/* Custom Demo Dropdown */}
                      {showDemoDropdown && (
                          <div
                              className="position-absolute bg-white border rounded shadow-lg"
                              style={{
                                top: '100%',
                                right: '0',
                                minWidth: '200px',
                                zIndex: 1000,
                                marginTop: '5px'
                              }}
                              onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-2 fw-bold text-muted small border-bottom">
                              Try Demo As:
                            </div>
                            <a
                                className="dropdown-item d-block px-3 py-2 text-decoration-none text-dark"
                                href="#"
                                onClick={(e) => handleDemoLogin('patient', e)}
                                style={{ cursor: 'pointer' }}
                            >
                              <i className="fas fa-user me-2 text-primary"></i>Patient
                              <small className="d-block text-muted">View patient dashboard</small>
                            </a>
                            <a
                                className="dropdown-item d-block px-3 py-2 text-decoration-none text-dark"
                                href="#"
                                onClick={(e) => handleDemoLogin('doctor', e)}
                                style={{ cursor: 'pointer' }}
                            >
                              <i className="fas fa-user-md me-2 text-success"></i>Doctor
                              <small className="d-block text-muted">View doctor dashboard</small>
                            </a>
                            <div className="px-3 py-2 border-top">
                              <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>No registration required
                              </small>
                            </div>
                          </div>
                      )}
                    </li>

                    <li className="nav-item">
                      <a className="nav-link btn btn-outline-primary rounded-pill px-4" href="#" >Sign Up</a>
                    </li>
                  </>
              )}
            </ul>
          </div>
        </div>

        <style jsx>{`
        .dropdown-item:hover {
          background-color: #f8f9fa;
        }
      `}</style>
      </nav>
  );
};