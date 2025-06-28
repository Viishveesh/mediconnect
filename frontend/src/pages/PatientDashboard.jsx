import React, { useState } from 'react';

const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Dummy data
    const patientData = {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 123-4567",
        dateOfBirth: "1985-06-15",
        bloodType: "O+",
        emergencyContact: "John Johnson - +1 (555) 987-6543"
    };

    const upcomingAppointments = [
        {
            id: 1,
            doctor: "Dr. Emily Chen",
            specialty: "Cardiologist",
            date: "2025-06-28",
            time: "10:00 AM",
            type: "Video Consultation",
            status: "confirmed",
            avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 2,
            doctor: "Dr. Michael Rodriguez",
            specialty: "General Practitioner",
            date: "2025-07-02",
            time: "2:30 PM",
            type: "In-Person Visit",
            status: "pending",
            avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face"
        }
    ];

    const pastAppointments = [
        {
            id: 3,
            doctor: "Dr. Lisa Thompson",
            specialty: "Dermatologist",
            date: "2025-06-20",
            time: "3:00 PM",
            type: "Video Consultation",
            status: "completed",
            notes: "Prescribed topical treatment for eczema",
            avatar: "https://images.unsplash.com/photo-1594824596414-779a7c1c8bb6?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 4,
            doctor: "Dr. James Wilson",
            specialty: "Orthopedist",
            date: "2025-06-15",
            time: "11:15 AM",
            type: "In-Person Visit",
            status: "completed",
            notes: "X-ray results normal, continue physical therapy",
            avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face"
        }
    ];

    const medicalRecords = [
        {
            id: 1,
            title: "Blood Test Results",
            date: "2025-06-22",
            doctor: "Dr. Emily Chen",
            type: "Lab Report",
            status: "Normal"
        },
        {
            id: 2,
            title: "Chest X-Ray",
            date: "2025-06-15",
            doctor: "Dr. James Wilson",
            type: "Imaging",
            status: "Normal"
        },
        {
            id: 3,
            title: "Annual Physical Exam",
            date: "2025-06-10",
            doctor: "Dr. Michael Rodriguez",
            type: "Examination",
            status: "Complete"
        }
    ];

    const messages = [
        {
            id: 1,
            doctor: "Dr. Emily Chen",
            lastMessage: "Your test results are in. Everything looks good!",
            time: "2 hours ago",
            unread: true,
            avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=50&h=50&fit=crop&crop=face"
        },
        {
            id: 2,
            doctor: "Dr. Lisa Thompson",
            lastMessage: "Please continue with the prescribed medication for another week.",
            time: "1 day ago",
            unread: false,
            avatar: "https://images.unsplash.com/photo-1594824596414-779a7c1c8bb6?w=50&h=50&fit=crop&crop=face"
        }
    ];

    const renderOverview = () => (
        <div className="row g-4">
            {/* Quick Stats */}
            <div className="col-12">
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white h-100">
                            <div className="card-body text-center">
                                <i className="fas fa-calendar-check fa-2x mb-3"></i>
                                <h3 className="mb-1">{upcomingAppointments.length}</h3>
                                <p className="mb-0">Upcoming Appointments</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white h-100">
                            <div className="card-body text-center">
                                <i className="fas fa-file-medical fa-2x mb-3"></i>
                                <h3 className="mb-1">{medicalRecords.length}</h3>
                                <p className="mb-0">Medical Records</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-info text-white h-100">
                            <div className="card-body text-center">
                                <i className="fas fa-comments fa-2x mb-3"></i>
                                <h3 className="mb-1">{messages.filter(m => m.unread).length}</h3>
                                <p className="mb-0">New Messages</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-warning text-white h-100">
                            <div className="card-body text-center">
                                <i className="fas fa-history fa-2x mb-3"></i>
                                <h3 className="mb-1">{pastAppointments.length}</h3>
                                <p className="mb-0">Past Consultations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-lg-8">
                <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Upcoming Appointments</h5>
                        <button className="btn btn-primary btn-sm">
                            <i className="fas fa-plus me-1"></i>Book New
                        </button>
                    </div>
                    <div className="card-body">
                        {upcomingAppointments.map(appointment => (
                            <div key={appointment.id} className="d-flex align-items-center p-3 border rounded mb-3">
                                <img
                                    src={appointment.avatar}
                                    alt={appointment.doctor}
                                    className="rounded-circle me-3"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{appointment.doctor}</h6>
                                    <p className="mb-1 text-muted">{appointment.specialty}</p>
                                    <small className="text-muted">
                                        <i className="fas fa-calendar me-1"></i>
                                        {appointment.date} at {appointment.time}
                                    </small>
                                </div>
                                <div className="text-end">
                  <span className={`badge ${appointment.status === 'confirmed' ? 'bg-success' : 'bg-warning'} mb-2`}>
                    {appointment.status}
                  </span>
                                    <br />
                                    <button className="btn btn-outline-primary btn-sm">
                                        <i className="fas fa-video me-1"></i>Join Call
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Messages */}
            <div className="col-lg-4">
                <div className="card h-100">
                    <div className="card-header">
                        <h5 className="mb-0">Recent Messages</h5>
                    </div>
                    <div className="card-body">
                        {messages.map(message => (
                            <div key={message.id} className={`d-flex align-items-start p-2 rounded mb-2 ${message.unread ? 'bg-light' : ''}`}>
                                <img
                                    src={message.avatar}
                                    alt={message.doctor}
                                    className="rounded-circle me-2"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 fs-6">{message.doctor}</h6>
                                    <p className="mb-1 small text-muted">{message.lastMessage}</p>
                                    <small className="text-muted">{message.time}</small>
                                </div>
                                {message.unread && <span className="badge bg-primary rounded-pill">1</span>}
                            </div>
                        ))}
                        <button className="btn btn-outline-primary btn-sm w-100 mt-2">View All Messages</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAppointments = () => (
        <div className="row g-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4>My Appointments</h4>
                    <button className="btn btn-primary">
                        <i className="fas fa-plus me-2"></i>Book New Appointment
                    </button>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Upcoming Appointments</h5>
                    </div>
                    <div className="card-body">
                        {upcomingAppointments.map(appointment => (
                            <div key={appointment.id} className="row align-items-center p-3 border rounded mb-3">
                                <div className="col-md-2 text-center">
                                    <img
                                        src={appointment.avatar}
                                        alt={appointment.doctor}
                                        className="rounded-circle"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <h5 className="mb-1">{appointment.doctor}</h5>
                                    <p className="mb-1 text-muted">{appointment.specialty}</p>
                                    <p className="mb-1">
                                        <i className="fas fa-calendar me-2"></i>
                                        {appointment.date} at {appointment.time}
                                    </p>
                                    <span className="badge bg-info">{appointment.type}</span>
                                </div>
                                <div className="col-md-2">
                  <span className={`badge ${appointment.status === 'confirmed' ? 'bg-success' : 'bg-warning'}`}>
                    {appointment.status}
                  </span>
                                </div>
                                <div className="col-md-2">
                                    <div className="btn-group-vertical w-100">
                                        <button className="btn btn-primary btn-sm mb-1">
                                            <i className="fas fa-video me-1"></i>Join
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm mb-1">
                                            <i className="fas fa-edit me-1"></i>Reschedule
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm">
                                            <i className="fas fa-times me-1"></i>Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Past Appointments */}
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Past Appointments</h5>
                    </div>
                    <div className="card-body">
                        {pastAppointments.map(appointment => (
                            <div key={appointment.id} className="row align-items-center p-3 border rounded mb-3">
                                <div className="col-md-2 text-center">
                                    <img
                                        src={appointment.avatar}
                                        alt={appointment.doctor}
                                        className="rounded-circle"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <h5 className="mb-1">{appointment.doctor}</h5>
                                    <p className="mb-1 text-muted">{appointment.specialty}</p>
                                    <p className="mb-1">
                                        <i className="fas fa-calendar me-2"></i>
                                        {appointment.date} at {appointment.time}
                                    </p>
                                    <span className="badge bg-info">{appointment.type}</span>
                                    {appointment.notes && (
                                        <p className="mt-2 mb-0 small">
                                            <strong>Notes:</strong> {appointment.notes}
                                        </p>
                                    )}
                                </div>
                                <div className="col-md-2">
                                    <span className="badge bg-success">{appointment.status}</span>
                                </div>
                                <div className="col-md-2">
                                    <button className="btn btn-outline-primary btn-sm">
                                        <i className="fas fa-download me-1"></i>Download Report
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMedicalRecords = () => (
        <div className="row g-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4>Medical Records</h4>
                    <button className="btn btn-primary">
                        <i className="fas fa-upload me-2"></i>Upload Record
                    </button>
                </div>
            </div>

            {/* Health Profile */}
            <div className="col-lg-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Health Profile</h5>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label text-muted">Blood Type</label>
                            <p className="mb-0">{patientData.bloodType}</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-muted">Date of Birth</label>
                            <p className="mb-0">{patientData.dateOfBirth}</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-muted">Emergency Contact</label>
                            <p className="mb-0">{patientData.emergencyContact}</p>
                        </div>
                        <button className="btn btn-outline-primary w-100">
                            <i className="fas fa-edit me-2"></i>Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Medical Records List */}
            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Records & Documents</h5>
                    </div>
                    <div className="card-body">
                        {medicalRecords.map(record => (
                            <div key={record.id} className="d-flex align-items-center p-3 border rounded mb-3">
                                <div className="me-3">
                                    <i className={`fas ${
                                        record.type === 'Lab Report' ? 'fa-flask' :
                                            record.type === 'Imaging' ? 'fa-x-ray' : 'fa-file-medical'
                                    } fa-2x text-primary`}></i>
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{record.title}</h6>
                                    <p className="mb-1 text-muted">Dr. {record.doctor}</p>
                                    <small className="text-muted">
                                        <i className="fas fa-calendar me-1"></i>
                                        {record.date}
                                    </small>
                                </div>
                                <div className="text-end">
                  <span className={`badge ${record.status === 'Normal' || record.status === 'Complete' ? 'bg-success' : 'bg-warning'} mb-2`}>
                    {record.status}
                  </span>
                                    <br />
                                    <div className="btn-group-sm">
                                        <button className="btn btn-outline-primary btn-sm me-1">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm">
                                            <i className="fas fa-download"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMessages = () => (
        <div className="row g-4">
            <div className="col-12">
                <h4>Messages</h4>
            </div>

            <div className="col-lg-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Conversations</h5>
                    </div>
                    <div className="card-body p-0">
                        {messages.map(message => (
                            <div key={message.id} className={`d-flex align-items-center p-3 border-bottom ${message.unread ? 'bg-light' : ''}`} style={{ cursor: 'pointer' }}>
                                <img
                                    src={message.avatar}
                                    alt={message.doctor}
                                    className="rounded-circle me-3"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{message.doctor}</h6>
                                    <p className="mb-0 small text-muted text-truncate">{message.lastMessage}</p>
                                    <small className="text-muted">{message.time}</small>
                                </div>
                                {message.unread && <span className="badge bg-primary rounded-pill">1</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="col-lg-8">
                <div className="card h-100">
                    <div className="card-header d-flex align-items-center">
                        <img
                            src={messages[0].avatar}
                            alt={messages[0].doctor}
                            className="rounded-circle me-3"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <div>
                            <h6 className="mb-0">{messages[0].doctor}</h6>
                            <small className="text-muted">Online</small>
                        </div>
                    </div>
                    <div className="card-body" style={{ height: '400px', overflowY: 'auto' }}>
                        <div className="d-flex mb-3">
                            <img
                                src={messages[0].avatar}
                                alt={messages[0].doctor}
                                className="rounded-circle me-2"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <div className="bg-light p-2 rounded">
                                <p className="mb-0">Hello! I've reviewed your test results.</p>
                                <small className="text-muted">10:30 AM</small>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mb-3">
                            <div className="bg-primary text-white p-2 rounded">
                                <p className="mb-0">Great! What do they show?</p>
                                <small className="text-white-50">10:32 AM</small>
                            </div>
                        </div>
                        <div className="d-flex mb-3">
                            <img
                                src={messages[0].avatar}
                                alt={messages[0].doctor}
                                className="rounded-circle me-2"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <div className="bg-light p-2 rounded">
                                <p className="mb-0">{messages[0].lastMessage}</p>
                                <small className="text-muted">2 hours ago</small>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Type your message..." />
                            <button className="btn btn-primary">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="row g-4">
            <div className="col-12">
                <h4>My Profile</h4>
            </div>

            <div className="col-lg-4">
                <div className="card text-center">
                    <div className="card-body">
                        <img
                            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
                            alt="Profile"
                            className="rounded-circle mb-3"
                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                        />
                        <h5>{patientData.name}</h5>
                        <p className="text-muted">Patient ID: #P12345</p>
                        <button className="btn btn-outline-primary">
                            <i className="fas fa-camera me-2"></i>Change Photo
                        </button>
                    </div>
                </div>
            </div>

            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Personal Information</h5>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-control" value={patientData.name} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" value={patientData.email} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone</label>
                                    <input type="tel" className="form-control" value={patientData.phone} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Date of Birth</label>
                                    <input type="date" className="form-control" value={patientData.dateOfBirth} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Blood Type</label>
                                    <select className="form-select">
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Emergency Contact</label>
                                    <input type="text" className="form-control" value={patientData.emergencyContact} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Medical Conditions</label>
                                    <textarea className="form-control" rows="3" placeholder="List any current medical conditions, allergies, or medications..."></textarea>
                                </div>
                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-save me-2"></i>Save Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch(activeTab) {
            case 'overview': return renderOverview();
            case 'appointments': return renderAppointments();
            case 'records': return renderMedicalRecords();
            case 'messages': return renderMessages();
            case 'profile': return renderProfile();
            default: return renderOverview();
        }
    };

    return (
        <div className="App">
          

            {/* Dashboard Header */}
            <section className="py-5 mt-5" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h2 className="mb-2">Welcome back, {patientData.name}!</h2>
                            <p className="text-muted mb-0">Manage your healthcare appointments and records</p>
                        </div>
                        <div className="col-lg-4 text-end">
                            <button className="btn btn-primary me-2">
                                <i className="fas fa-plus me-2"></i>Book Appointment
                            </button>
                            <button className="btn btn-outline-primary">
                                <i className="fas fa-video me-2"></i>Join Call
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Navigation */}
            <section className="py-3 bg-white border-bottom">
                <div className="container">
                    <ul className="nav nav-pills">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <i className="fas fa-tachometer-alt me-2"></i>Overview
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('appointments')}
                            >
                                <i className="fas fa-calendar-check me-2"></i>Appointments
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'records' ? 'active' : ''}`}
                                onClick={() => setActiveTab('records')}
                            >
                                <i className="fas fa-file-medical me-2"></i>Medical Records
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
                                onClick={() => setActiveTab('messages')}
                            >
                                <i className="fas fa-comments me-2"></i>Messages
                                {messages.filter(m => m.unread).length > 0 && (
                                    <span className="badge bg-danger ms-1">{messages.filter(m => m.unread).length}</span>
                                )}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <i className="fas fa-user me-2"></i>Profile
                            </button>
                        </li>
                    </ul>
                </div>
            </section>

            <section className="py-5">
                <div className="container">
                    {renderTabContent()}
                </div>
            </section>

      
        </div>
    );
};

export default PatientDashboard;