import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    customBloodGroup: '',
    allergies: '',
    medicalHistory: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patient/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData({
        dateOfBirth: response.data.dateOfBirth || '',
        gender: response.data.gender || '',
        contactNumber: response.data.contactNumber || '',
        address: response.data.address || '',
        emergencyContact: response.data.emergencyContact || '',
        bloodGroup: response.data.bloodGroup || '',
        customBloodGroup: response.data.customBloodGroup || '',
        allergies: response.data.allergies || '',
        medicalHistory: response.data.medicalHistory || ''
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setIsEditing(true);
      } else {
        console.error('Error fetching profile:', error);
      }
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Format as xxx-xxx-xxxx
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    }
    return limited;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contactNumber' || name === 'emergencyContact') {
      const formattedValue = formatPhoneNumber(value);
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone numbers
    const contactDigits = formData.contactNumber.replace(/\D/g, '');
    const emergencyDigits = formData.emergencyContact.replace(/\D/g, '');
    
    if (contactDigits.length !== 10) {
      setMessage({
        type: 'error',
        text: 'Contact number must be exactly 10 digits'
      });
      return;
    }
    
    if (emergencyDigits.length !== 10) {
      setMessage({
        type: 'error',
        text: 'Emergency contact must be exactly 10 digits'
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const method = profile ? 'put' : 'post';
      const message = profile ? 'Profile updated successfully!' : 'Profile created successfully!';
      
      // Prepare form data with proper blood group handling
      const submitData = {
        ...formData,
        bloodGroup: formData.bloodGroup === 'Other' ? formData.customBloodGroup : formData.bloodGroup
      };
      
      await axios[method]('http://localhost:5000/api/patient/profile', submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: message });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save profile'
      });
    }
  };

  if (!profile && !isEditing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Patient Profile</h3>
            </div>
            <div className="card-body">
              {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                  {message.text}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Date of Birth *</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          className="form-control"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Gender *</label>
                        <select
                          name="gender"
                          className="form-control"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Contact Number *</label>
                        <input
                          type="tel"
                          name="contactNumber"
                          className="form-control"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          placeholder="123-456-7890"
                          maxLength="12"
                          required
                        />
                        <small className="form-text text-muted">Enter 10-digit phone number</small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Blood Group</label>
                        <select
                          name="bloodGroup"
                          className="form-control"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="Other">Other (Rare Blood Type)</option>
                        </select>
                        {formData.bloodGroup === 'Other' && (
                          <input
                            type="text"
                            name="customBloodGroup"
                            className="form-control mt-2"
                            value={formData.customBloodGroup}
                            onChange={handleInputChange}
                            placeholder="Enter your blood group"
                            required
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Emergency Contact *</label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      className="form-control"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="123-456-7890"
                      maxLength="12"
                      required
                    />
                    <small className="form-text text-muted">Enter 10-digit emergency contact number</small>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Address *</label>
                    <textarea
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Allergies</label>
                    <textarea
                      name="allergies"
                      className="form-control"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="List any known allergies"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Medical History</label>
                    <textarea
                      name="medicalHistory"
                      className="form-control"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Brief medical history"
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Save Profile
                    </button>
                    {profile && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div>
                  <div className="row">
                    <div className="col-md-6">
                      <h5>Personal Information</h5>
                      <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                      <p><strong>Email:</strong> {profile.email}</p>
                      <p><strong>Date of Birth:</strong> {new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                      <p><strong>Gender:</strong> {profile.gender}</p>
                      <p><strong>Contact:</strong> {profile.contactNumber}</p>
                      <p><strong>Emergency Contact:</strong> {profile.emergencyContact}</p>
                    </div>
                    <div className="col-md-6">
                      <h5>Medical Information</h5>
                      <p><strong>Blood Group:</strong> {profile.bloodGroup || 'Not specified'}</p>
                      <p><strong>Allergies:</strong> {profile.allergies || 'None reported'}</p>
                      <div className="mt-3">
                        <strong>Medical History:</strong>
                        <p>{profile.medicalHistory || 'No history provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h5>Address</h5>
                    <p>{profile.address}</p>
                  </div>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;