import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = ({ toggleForm }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' }); // Clear message on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: "Passwords don't match" });
      return;
    }

    try {
      await axios.post("http://localhost:5000/signup", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setMessage({ type: 'success', text: "Signup successful! Redirecting to login..." });

      setTimeout(() => {
        navigate("/login"); // Redirect to login after 2 seconds
      }, 2000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || "Signup failed. Please try again."
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Join Us</h2>
          <p>Create your account</p>
        </div>

        <div className="auth-body">
          {/* ✅ Success / Error message */}
          {message.text && (
            <div
              className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" name="firstName" className="form-control form-input" value={formData.firstName} onChange={handleInputChange} required placeholder="John" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" name="lastName" className="form-control form-input" value={formData.lastName} onChange={handleInputChange} required placeholder="Doe" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-control form-input" value={formData.email} onChange={handleInputChange} required placeholder="john@example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control form-input" value={formData.password} onChange={handleInputChange} required placeholder="••••••••" />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" name="confirmPassword" className="form-control form-input" value={formData.confirmPassword} onChange={handleInputChange} required placeholder="••••••••" />
            </div>

            <div className="form-group">
  <label className="form-label">I am a</label>
  <select
    name="role"
    className="form-control form-input"
    value={formData.role}
    onChange={handleInputChange}
    required
  >
    <option value="" disabled>Select your role</option>
    <option value="doctor">Doctor</option>
    <option value="patient">Patient</option>
  </select>
</div>

            <button type="submit" className="auth-btn">Create Account</button>
          </form>

          <div className="toggle-form">
            <p>
              Already have an account? <a href="/login" onClick={toggleForm} className="toggle-link">Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;