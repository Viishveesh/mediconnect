import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientRecords = ({ isOpen, onClose, patientEmail }) => {
    const [activeTab, setActiveTab] = useState('patients'); // Dashboard navigation tab
    const [activeRecordTab, setActiveRecordTab] = useState('overview'); // Patient records tab
    const [doctorName, setDoctorName] = useState('Doctor');
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [visitNotes, setVisitNotes] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [labResults, setLabResults] = useState([]);

    // New prescription form state
    const [showNewPrescription, setShowNewPrescription] = useState(false);
    const [newPrescription, setNewPrescription] = useState({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        refills: 0
    });

    // New visit note form state
    const [showNewNote, setShowNewNote] = useState(false);
    const [newNote, setNewNote] = useState({
        visitType: 'routine',
        chiefComplaint: '',
        diagnosis: '',
        treatment: '',
        followUp: '',
        notes: ''
    });

    // New vital signs form state
    const [showNewVitals, setShowNewVitals] = useState(false);
    const [newVitals, setNewVitals] = useState({
        bloodPressure: { systolic: '', diastolic: '' },
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        respiratoryRate: '',
        oxygenSaturation: ''
    });

    const navigate = useNavigate();

    // Fetch doctor profile
    useEffect(() => {
        const name = localStorage.getItem('name');
        if (name) {
            setDoctorName(`Dr. ${name}`);
        }
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://mediconnect-backend-xe6f.onrender.com/api/doctor/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctorProfile(response.data);
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
            setDoctorProfile({
                specialization: 'Not specified',
                email: localStorage.getItem('email') || 'Not specified',
                contactNumber: 'Not specified',
                medicalLicense: 'Not specified',
                experience: 0,
                rating: 0
            });
        }
    };

    // Debug: Log patientEmail prop
    useEffect(() => {
        console.log('PatientRecords received patientEmail:', patientEmail);
        if (!patientEmail || patientEmail === 'undefined' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
            setError('Patient email is missing or invalid.');
            setLoading(false);
        }
    }, [patientEmail]);

    useEffect(() => {
        if (isOpen && patientEmail && patientEmail !== 'undefined' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
            fetchPatientRecords();
        }
    }, [isOpen, patientEmail]);

    const fetchPatientRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const doctorId = localStorage.getItem('doctorId');
            console.log('Token:', token);
            console.log('Doctor ID:', doctorId);
            console.log('Fetching patient records for email:', patientEmail);

            if (!token || !doctorId) {
                throw new Error('Authentication credentials missing.');
            }

            const normalizedEmail = patientEmail.toLowerCase();

            const patientResponse = await axios.get(
                `https://mediconnect-backend-xe6f.onrender.com/api/doctor/${doctorId}/patient/${encodeURIComponent(normalizedEmail)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const [historyRes, prescriptionsRes, notesRes] = await Promise.all([
                axios.get(`https://mediconnect-backend-xe6f.onrender.com/api/patient/${encodeURIComponent(normalizedEmail)}/medical-history`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: [] })),
                axios.get(`https://mediconnect-backend-xe6f.onrender.com/api/patient/${encodeURIComponent(normalizedEmail)}/prescriptions`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: [] })),
                axios.get(`https://mediconnect-backend-xe6f.onrender.com/api/patient/${encodeURIComponent(normalizedEmail)}/visit-notes`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: [] }))
            ]);

            setPatientData(patientResponse.data);
            setMedicalHistory(historyRes.data || []);
            setPrescriptions(prescriptionsRes.data || []);
            setVisitNotes(notesRes.data || []);
            setVitals([]); // Not implemented in API
            setLabResults([]); // Not implemented in API
        } catch (error) {
            console.error('Error fetching patient records:', error);
            setError(error.response?.data?.error || 'Failed to load patient records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPrescription = async (e) => {
        e.preventDefault();
        if (!patientEmail || patientEmail === 'undefined') {
            alert('Cannot add prescription: Patient email is missing.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `https://mediconnect-backend-xe6f.onrender.com/api/patient/${encodeURIComponent(patientEmail)}/prescriptions`,
                {
                    ...newPrescription,
                    doctorId: localStorage.getItem('doctorId'),
                    prescribedDate: new Date().toISOString()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewPrescription({
                medication: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: '',
                refills: 0
            });
            setShowNewPrescription(false);
            fetchPatientRecords();
            alert('Prescription added successfully!');
        } catch (error) {
            console.error('Error adding prescription:', error);
            alert(error.response?.data?.error || 'Failed to add prescription. Please try again.');
        }
    };

    const handleAddVisitNote = async (e) => {
        e.preventDefault();
        if (!patientEmail || patientEmail === 'undefined') {
            alert('Cannot add visit note: Patient email is missing.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `https://mediconnect-backend-xe6f.onrender.com/api/patient/${encodeURIComponent(patientEmail)}/visit-notes`,
                {
                    ...newNote,
                    doctorId: localStorage.getItem('doctorId'),
                    visitDate: new Date().toISOString()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewNote({
                visitType: 'routine',
                chiefComplaint: '',
                diagnosis: '',
                treatment: '',
                followUp: '',
                notes: ''
            });
            setShowNewNote(false);
            fetchPatientRecords();
            alert('Visit note added successfully!');
        } catch (error) {
            console.error('Error adding visit note:', error);
            alert(error.response?.data?.error || 'Failed to add visit note. Please try again.');
        }
    };

    const handleAddVitals = async (e) => {
        e.preventDefault();
        if (!patientEmail || patientEmail === 'undefined') {
            alert('Cannot add vitals: Patient email is missing.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `https://mediconnect-backend-xe6f.onrender.com/api/patient/${encodeURIComponent(patientEmail)}/vitals`,
                {
                    ...newVitals,
                    doctorId: localStorage.getItem('doctorId'),
                    recordedDate: new Date().toISOString()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewVitals({
                bloodPressure: { systolic: '', diastolic: '' },
                heartRate: '',
                temperature: '',
                weight: '',
                height: '',
                respiratoryRate: '',
                oxygenSaturation: ''
            });
            setShowNewVitals(false);
            fetchPatientRecords();
            alert('Vital signs recorded successfully!');
        } catch (error) {
            console.error('Error recording vitals:', error);
            alert(error.response?.data?.error || 'Failed to record vital signs. Please try again.');
        }
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        navigate('/doctor/dashboard');
    };

    if (!isOpen) return null;

    const renderOverview = () => (
        <div className="row g-4">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0">Patient Information</h6>
                    </div>
                    <div className="card-body">
                        {patientData ? (
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <p><strong>Name:</strong> {patientData.name}</p>
                                    <p><strong>Email:</strong> {patientData.email}</p>
                                    {/* <p><strong>Phone:</strong> {patientData.phone || 'Not provided'}</p> */}
                                </div>
                                <div className="col-md-6">
                                    {/* <p><strong>Date of Birth:</strong> {patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toLocaleDateString() : 'Not provided'}</p> */}
                                    {/* <p><strong>Gender:</strong> {patientData.gender || 'Not specified'}</p> */}
                                    {/* <p><strong>Blood Type:</strong> {patientData.bloodType || 'Not specified'}</p> */}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted">Loading patient information...</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="row g-3">
                    <div className="col-6 col-md-6">
                        <div className="card text-center">
                            <div className="card-body">
                                <i className="fas fa-notes-medical fa-2x text-primary mb-2"></i>
                                <h5>{visitNotes.length}</h5>
                                <small className="text-muted">Visit Notes</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-6">
                        <div className="card text-center">
                            <div className="card-body">
                                <i className="fas fa-pills fa-2x text-success mb-2"></i>
                                <h5>{prescriptions.length}</h5>
                                <small className="text-muted">Prescriptions</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0">Recent Activity</h6>
                    </div>
                    <div className="card-body">
                        {visitNotes.length === 0 && prescriptions.length === 0 && vitals.length === 0 ? (
                            <p className="text-muted text-center py-3">No recent activity</p>
                        ) : (
                            <div className="timeline">
                                {visitNotes.slice(0, 3).map((note, index) => (
                                    <div key={`note-${index}`} className="timeline-item mb-3">
                                        <div className="d-flex">
                                            {/* <div className="timeline-marker bg-primary rounded-circle p-2 me-3">
                                                <i className="fas fa-notes-medical text-white"></i>
                                            </div> */}
                                            <div>
                                                <h6 className="mb-1">Visit Note - {note.visitType}</h6>
                                                <p className="mb-1 small">{note.diagnosis}</p>
                                                <small className="text-muted">
                                                    {new Date(note.visitDate).toLocaleDateString()}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPrescriptions = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="mb-0">Prescriptions</h6>
                <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowNewPrescription(true)}
                >
                    <i className="fas fa-plus me-1"></i>Add Prescription
                </button>
            </div>
            {showNewPrescription && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h6 className="mb-0">New Prescription</h6>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleAddPrescription}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Medication</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newPrescription.medication}
                                        onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Dosage</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newPrescription.dosage}
                                        onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Frequency</label>
                                    <select
                                        className="form-select"
                                        value={newPrescription.frequency}
                                        onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                                        required
                                    >
                                        <option value="">Select frequency</option>
                                        <option value="Once daily">Once daily</option>
                                        <option value="Twice daily">Twice daily</option>
                                        <option value="Three times daily">Three times daily</option>
                                        <option value="Four times daily">Four times daily</option>
                                        <option value="As needed">As needed</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Duration</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 7 days, 2 weeks"
                                        value={newPrescription.duration}
                                        onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Refills</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        max="10"
                                        value={newPrescription.refills}
                                        onChange={(e) => setNewPrescription({...newPrescription, refills: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Instructions</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={newPrescription.instructions}
                                        onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-3">
                                <button type="submit" className="btn btn-primary me-2">
                                    <i className="fas fa-save me-1"></i>Save Prescription
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowNewPrescription(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="row g-3">
                {prescriptions.length === 0 ? (
                    <div className="col-12">
                        <div className="text-center py-4">
                            <i className="fas fa-pills fa-3x text-muted mb-3"></i>
                            <p className="text-muted">No prescriptions found</p>
                        </div>
                    </div>
                ) : (
                    prescriptions.map((prescription, index) => (
                        <div key={index} className="col-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <h6 className="mb-2">{prescription.medication}</h6>
                                            <p className="mb-1"><strong>Dosage:</strong> {prescription.dosage}</p>
                                            <p className="mb-1"><strong>Frequency:</strong> {prescription.frequency}</p>
                                            <p className="mb-1"><strong>Duration:</strong> {prescription.duration}</p>
                                            {prescription.instructions && (
                                                <p className="mb-1"><strong>Instructions:</strong> {prescription.instructions}</p>
                                            )}
                                        </div>
                                        <div className="col-md-4 text-md-end">
                                            <small className="text-muted">
                                                Prescribed: {new Date(prescription.prescribedDate).toLocaleDateString()}
                                            </small>
                                            <br />
                                            <small className="text-muted">
                                                Refills: {prescription.refills || 0}
                                            </small>
                                            <div className="mt-2">
                                                <span className="badge bg-success">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderVisitNotes = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="mb-0">Visit Notes</h6>
                <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowNewNote(true)}
                >
                    <i className="fas fa-plus me-1"></i>Add Visit Note
                </button>
            </div>
            {showNewNote && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h6 className="mb-0">New Visit Note</h6>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleAddVisitNote}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Visit Type</label>
                                    <select
                                        className="form-select"
                                        value={newNote.visitType}
                                        onChange={(e) => setNewNote({...newNote, visitType: e.target.value})}
                                    >
                                        <option value="routine">Routine Checkup</option>
                                        <option value="followup">Follow-up</option>
                                        <option value="urgent">Urgent Care</option>
                                        <option value="consultation">Consultation</option>
                                        <option value="procedure">Procedure</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Chief Complaint</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newNote.chiefComplaint}
                                        onChange={(e) => setNewNote({...newNote, chiefComplaint: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Diagnosis</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        value={newNote.diagnosis}
                                        onChange={(e) => setNewNote({...newNote, diagnosis: e.target.value})}
                                        required
                                    ></textarea>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Treatment Plan</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={newNote.treatment}
                                        onChange={(e) => setNewNote({...newNote, treatment: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Follow-up</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 2 weeks, 1 month"
                                        value={newNote.followUp}
                                        onChange={(e) => setNewNote({...newNote, followUp: e.target.value})}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Additional Notes</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        value={newNote.notes}
                                        onChange={(e) => setNewNote({...newNote, notes: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-3">
                                <button type="submit" className="btn btn-primary me-2">
                                    <i className="fas fa-save me-1"></i>Save Visit Note
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowNewNote(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="row g-3">
                {visitNotes.length === 0 ? (
                    <div className="col-12">
                        <div className="text-center py-4">
                            <i className="fas fa-notes-medical fa-3x text-muted mb-3"></i>
                            <p className="text-muted">No visit notes found</p>
                        </div>
                    </div>
                ) : (
                    visitNotes.map((note, index) => (
                        <div key={index} className="col-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h6 className="mb-1">{note.visitType.charAt(0).toUpperCase() + note.visitType.slice(1)} Visit</h6>
                                            <small className="text-muted">
                                                {new Date(note.visitDate).toLocaleDateString()} at {new Date(note.visitDate).toLocaleTimeString()}
                                            </small>
                                        </div>
                                        <span className="badge bg-primary">{note.visitType}</span>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <p className="mb-2"><strong>Chief Complaint:</strong></p>
                                            <p className="text-muted">{note.chiefComplaint}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-2"><strong>Diagnosis:</strong></p>
                                            <p className="text-muted">{note.diagnosis}</p>
                                        </div>
                                        {note.treatment && (
                                            <div className="col-12">
                                                <p className="mb-2"><strong>Treatment Plan:</strong></p>
                                                <p className="text-muted">{note.treatment}</p>
                                            </div>
                                        )}
                                        {note.followUp && (
                                            <div className="col-md-6">
                                                <p className="mb-2"><strong>Follow-up:</strong></p>
                                                <p className="text-muted">{note.followUp}</p>
                                            </div>
                                        )}
                                        {note.notes && (
                                            <div className="col-md-6">
                                                <p className="mb-2"><strong>Additional Notes:</strong></p>
                                                <p className="text-muted">{note.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="min-vh-100" style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            {/* Include Bootstrap Icons */}
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />

            <style dangerouslySetInnerHTML={{
                __html: `
                    .card:hover {
                        transform: translateY(-2px);
                        transition: all 0.3s ease;
                    }
                    .nav-link:hover {
                        transform: translateY(-1px) !important;
                    }
                    .btn:hover {
                        transform: translateY(-1px);
                        transition: all 0.3s ease;
                    }
                    @media (max-width: 768px) {
                        .nav-link {
                            font-size: 0.85rem;
                            padding: 8px 12px !important;
                        }
                    }
                `
            }} />

            {/* Header */}
            <header className="sticky-top" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <div className="container-fluid px-3 px-md-4">
                    <div className="row align-items-center py-4">
                        <div className="col-12 col-lg-8 mb-3 mb-lg-0">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <div className="bg-white rounded-circle p-2" style={{ width: '50px', height: '50px' }}>
                                        {doctorProfile?.profilePhoto ? (
                                            <img
                                                alt="Profile"
                                                className="rounded-circle"
                                                src={`https://mediconnect-backend-xe6f.onrender.com/api/files/${doctorProfile.profilePhoto}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <i className="fas fa-user-md text-primary" style={{ fontSize: '1.5rem' }}></i>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold text-white">Welcome, {doctorName}!</h1>
                                    <p className="text-white-50 mb-0 small">Viewing patient records for {patientData?.name || patientEmail}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-4">
                            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-lg-end">
                                <button
                                    className="btn text-white flex-fill flex-sm-grow-0"
                                    onClick={() => navigate('/doctor/dashboard')}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '10px'
                                    }}
                                >
                                    <i className="fas fa-arrow-left me-2"></i>
                                    <span className="d-none d-sm-inline">Back to </span>Dashboard
                                </button>
                                <button
                                    className="btn text-white flex-fill flex-sm-grow-0"
                                    onClick={onClose}
                                    style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '10px'
                                    }}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    <span className="d-none d-sm-inline">Close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white" style={{
                borderBottom: '1px solid #e9ecef',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
                <div className="container-fluid px-3 px-md-4">
                    <div className="nav nav-pills d-flex overflow-auto py-3" style={{ minHeight: '4rem' }}>
                        {[
                            { id: 'overview', icon: 'fa-tachometer-alt', label: 'Overview', color: '#667eea' },
                            { id: 'appointments', icon: 'fa-calendar-check', label: 'Appointments', color: '#f093fb' },
                            { id: 'patients', icon: 'fa-users', label: 'Patients', color: '#4facfe' },
                            { id: 'schedule', icon: 'fa-calendar-alt', label: 'Schedule', color: '#43e97b' },
                            { id: 'messages', icon: 'fa-comments', label: 'Messages', color: '#fa709a' },
                            { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics', color: '#fee140' },
                            { id: 'profile', icon: 'fa-user-md', label: 'Profile', color: '#a8edea' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-link d-flex align-items-center text-nowrap me-3 position-relative ${
                                    activeTab === tab.id ? '' : 'text-muted'
                                }`}
                                onClick={() => handleTabClick(tab.id)}
                                style={{
                                    background: activeTab === tab.id
                                        ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)`
                                        : 'transparent',
                                    color: activeTab === tab.id ? 'white' : '#6c757d',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 20px',
                                    fontWeight: activeTab === tab.id ? '600' : '500',
                                    transition: 'all 0.3s ease',
                                    transform: activeTab === tab.id ? 'translateY(-2px)' : 'none',
                                    boxShadow: activeTab === tab.id ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.target.style.background = `linear-gradient(135deg, ${tab.color}20, ${tab.color}10)`;
                                        e.target.style.transform = 'translateY(-1px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.target.style.background = 'transparent';
                                        e.target.style.transform = 'none';
                                    }
                                }}
                            >
                                <i className={`fas ${tab.icon} me-2`} style={{ fontSize: '1.1rem' }}></i>
                                <span className="d-none d-md-inline">{tab.label}</span>
                                <span className="d-md-none">{tab.label.slice(0, 3)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container-fluid px-3 px-md-4 py-4">
                {error && <div className="alert alert-danger">{error}</div>}
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4>Patient Records {patientData ? `- ${patientData.name}` : ''}</h4>
                            {/* <button className="btn btn-secondary" onClick={onClose}>
                                <i className="fas fa-times me-1"></i>Close
                            </button> */}
                        </div>
                        <ul className="nav nav-tabs mb-4">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeRecordTab === 'overview' ? 'active' : ''}`}
                                    onClick={() => setActiveRecordTab('overview')}
                                >
                                    Overview
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeRecordTab === 'prescriptions' ? 'active' : ''}`}
                                    onClick={() => setActiveRecordTab('prescriptions')}
                                >
                                    Prescriptions
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeRecordTab === 'visitNotes' ? 'active' : ''}`}
                                    onClick={() => setActiveRecordTab('visitNotes')}
                                >
                                    Visit Notes
                                </button>
                            </li>
                        </ul>
                        {activeRecordTab === 'overview' && renderOverview()}
                        {activeRecordTab === 'prescriptions' && renderPrescriptions()}
                        {activeRecordTab === 'visitNotes' && renderVisitNotes()}
                    </>
                )}
            </main>
        </div>
    );
}

export default PatientRecords;