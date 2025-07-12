import React, { useState } from 'react';
import LogOut from '../auth/LogOut.jsx';
import { useNavigate } from 'react-router-dom';


const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();


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

    const availableDoctors = [
        {
            id: 1,
            name: "Dr. Emily Chen",
            specialty: "Cardiologist",
            rating: 4.9,
            experience: "12 years",
            nextAvailable: "Today 2:00 PM",
            avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 2,
            name: "Dr. Michael Rodriguez",
            specialty: "General Practitioner",
            rating: 4.8,
            experience: "8 years",
            nextAvailable: "Tomorrow 9:00 AM",
            avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 3,
            name: "Dr. Lisa Thompson",
            specialty: "Dermatologist",
            rating: 4.7,
            experience: "10 years",
            nextAvailable: "Today 4:30 PM",
            avatar: "https://images.unsplash.com/photo-1594824596414-779a7c1c8bb6?w=100&h=100&fit=crop&crop=face"
        }
    ];

    const renderOverview = () => (
        <div className="row g-3 g-md-4">
            {/* Quick Stats */}
            <div className="col-12">
                <div className="row g-3">
                    <div className="col-6 col-lg-3">
                        <div className="card stat-card text-white h-100" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '15px',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                            transform: 'translateY(0)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div className="card-body text-center p-3">
                                <div className="mb-3" style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto'
                                }}>
                                    <i className="fas fa-calendar-check" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h3 className="mb-1 fw-bold">{upcomingAppointments.length}</h3>
                                <p className="mb-0 small opacity-75">Upcoming Appointments</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-lg-3">
                        <div className="card stat-card text-white h-100" style={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            border: 'none',
                            borderRadius: '15px',
                            boxShadow: '0 8px 25px rgba(17, 153, 142, 0.3)',
                            transform: 'translateY(0)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div className="card-body text-center p-3">
                                <div className="mb-3" style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto'
                                }}>
                                    <i className="fas fa-file-medical" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h3 className="mb-1 fw-bold">{medicalRecords.length}</h3>
                                <p className="mb-0 small opacity-75">Medical Records</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-lg-3">
                        <div className="card stat-card text-white h-100" style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            border: 'none',
                            borderRadius: '15px',
                            boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)',
                            transform: 'translateY(0)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div className="card-body text-center p-3">
                                <div className="mb-3" style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto'
                                }}>
                                    <i className="fas fa-comments" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h3 className="mb-1 fw-bold">{messages.filter(m => m.unread).length}</h3>
                                <p className="mb-0 small opacity-75">New Messages</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-lg-3">
                        <div className="card stat-card text-white h-100" style={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            border: 'none',
                            borderRadius: '15px',
                            boxShadow: '0 8px 25px rgba(250, 112, 154, 0.3)',
                            transform: 'translateY(0)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div className="card-body text-center p-3">
                                <div className="mb-3" style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto'
                                }}>
                                    <i className="fas fa-history" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h3 className="mb-1 fw-bold">{pastAppointments.length}</h3>
                                <p className="mb-0 small opacity-75">Past Consultations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Appointments and Recent Messages */}
            <div className="col-12 col-xl-8">
                <div className="card h-100" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    background: 'white'
                }}>
                    <div className="card-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '1.5rem'
                    }}>
                        <h5 className="mb-0 fw-bold text-dark">Upcoming Appointments</h5>
                        <button className="btn text-white fw-semibold" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '8px 16px'
                        }}>
                            <i className="fas fa-plus me-1"></i>Book New
                        </button>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            {upcomingAppointments.map(appointment => (
                                <div key={appointment.id} className="col-12">
                                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center appointment-card p-3 border rounded gap-3" style={{
                                        borderRadius: '15px',
                                        border: '1px solid #e9ecef',
                                        background: '#fafbfc',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <img
                                            src={appointment.avatar}
                                            alt={appointment.doctor}
                                            className="rounded-circle border border-white"
                                            style={{ 
                                                width: '60px', 
                                                height: '60px', 
                                                objectFit: 'cover',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1 fw-bold">{appointment.doctor}</h6>
                                            <p className="mb-1 text-muted small">{appointment.specialty}</p>
                                            <small className="text-muted">
                                                <i className="fas fa-calendar me-1 text-primary"></i>
                                                {appointment.date} at {appointment.time}
                                            </small>
                                        </div>
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <span className={`badge px-3 py-1 text-white`} style={{
                                                background: appointment.status === 'confirmed' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                borderRadius: '20px'
                                            }}>
                                                {appointment.status}
                                            </span>
                                            <button className="btn btn-sm" style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: 'white',
                                                padding: '6px 12px'
                                            }}>
                                                <i className="fas fa-video me-1"></i>Join Call
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 col-xl-4">
                <div className="card h-100" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    background: 'white'
                }}>
                    <div className="card-header" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '1.5rem 1.5rem 1rem'
                    }}>
                        <h5 className="mb-0 fw-bold text-dark">Recent Messages</h5>
                    </div>
                    <div className="card-body p-3">
                        {messages.map(message => (
                            <div key={message.id} className={`d-flex align-items-start message-item p-3 rounded mb-2`} style={{
                                background: message.unread ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' : 'transparent',
                                borderRadius: '12px',
                                border: message.unread ? '1px solid rgba(102, 126, 234, 0.1)' : '1px solid transparent'
                            }}>
                                <img
                                    src={message.avatar}
                                    alt={message.doctor}
                                    className="rounded-circle me-3 flex-shrink-0"
                                    style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        objectFit: 'cover',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <div className="flex-grow-1 min-w-0">
                                    <h6 className="mb-1 fs-6 fw-semibold">{message.doctor}</h6>
                                    <p className="mb-1 small text-muted text-truncate">{message.lastMessage}</p>
                                    <small className="text-muted">{message.time}</small>
                                </div>
                                {message.unread && (
                                    <span className="flex-shrink-0" style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%'
                                    }}></span>
                                )}
                            </div>
                        ))}
                        <button className="btn btn-sm w-100 mt-3 fw-semibold" style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '10px',
                            color: '#667eea'
                        }}>View All Messages</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAvailableDoctors = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                    <h4 className="mb-0">Available Doctors</h4>
                    <div className="d-flex gap-2">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search doctors..." 
                            style={{ borderRadius: '10px', maxWidth: '200px' }}
                        />
                        <select className="form-select" style={{ borderRadius: '10px', maxWidth: '150px' }}>
                            <option>All Specialties</option>
                            <option>Cardiology</option>
                            <option>Dermatology</option>
                            <option>General Practice</option>
                        </select>
                    </div>
                </div>
            </div>

            {availableDoctors.map(doctor => (
                <div key={doctor.id} className="col-12 col-lg-6">
                    <div className="card h-100" style={{
                        border: 'none',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        background: 'white',
                        transition: 'all 0.3s ease'
                    }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-start gap-3">
                                <img
                                    src={doctor.avatar}
                                    alt={doctor.name}
                                    className="rounded-circle"
                                    style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        objectFit: 'cover',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <div className="flex-grow-1">
                                    <h5 className="mb-1 fw-bold">{doctor.name}</h5>
                                    <p className="text-muted mb-2">{doctor.specialty}</p>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="text-warning me-1">
                                            {'★'.repeat(Math.floor(doctor.rating))}
                                        </span>
                                        <span className="small text-muted">{doctor.rating} • {doctor.experience}</span>
                                    </div>
                                    <p className="small text-success mb-3">
                                        <i className="fas fa-clock me-1"></i>
                                        Next available: {doctor.nextAvailable}
                                    </p>
                                    <div className="d-flex gap-2">
                                        <button onClick={() => navigate("/book-appointment/doc002")} className="btn btn-sm text-white" style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '8px 16px'
                                        }}>
                                            <i className="fas fa-calendar me-1"></i>Book Appointment
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm" style={{
                                            borderRadius: '8px',
                                            padding: '8px 16px'
                                        }}>
                                            <i className="fas fa-user me-1"></i>View Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderAppointments = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                    <h4 className="mb-0">My Appointments</h4>
                    <button className="btn text-white fw-semibold" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px'
                    }}>
                        <i className="fas fa-plus me-2"></i>Book New Appointment
                    </button>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="col-12">
                <div className="card" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <div className="card-header" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '1.5rem'
                    }}>
                        <h5 className="mb-0 fw-bold text-dark">Upcoming Appointments</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            {upcomingAppointments.map(appointment => (
                                <div key={appointment.id} className="col-12">
                                    <div className="row align-items-center p-3 border rounded g-3" style={{
                                        borderRadius: '15px',
                                        border: '1px solid #e9ecef',
                                        background: '#fafbfc'
                                    }}>
                                        <div className="col-12 col-sm-2 text-center">
                                            <img
                                                src={appointment.avatar}
                                                alt={appointment.doctor}
                                                className="rounded-circle"
                                                style={{ 
                                                    width: '80px', 
                                                    height: '80px', 
                                                    objectFit: 'cover',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <h5 className="mb-1 fw-bold">{appointment.doctor}</h5>
                                            <p className="mb-1 text-muted">{appointment.specialty}</p>
                                            <p className="mb-1 small">
                                                <i className="fas fa-calendar me-2 text-primary"></i>
                                                {appointment.date} at {appointment.time}
                                            </p>
                                            <span className="badge text-white" style={{
                                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                borderRadius: '20px'
                                            }}>{appointment.type}</span>
                                        </div>
                                        <div className="col-12 col-sm-2 text-center">
                                            <span className={`badge px-3 py-1 text-white`} style={{
                                                background: appointment.status === 'confirmed' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                borderRadius: '20px'
                                            }}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        <div className="col-12 col-sm-2">
                                            <div className="d-grid gap-1">
                                                <button className="btn btn-sm text-white" style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    borderRadius: '8px'
                                                }}>
                                                    <i className="fas fa-video me-1"></i>Join
                                                </button>
                                                <button className="btn btn-outline-secondary btn-sm" style={{ borderRadius: '8px' }}>
                                                    <i className="fas fa-edit me-1"></i>Reschedule
                                                </button>
                                                <button className="btn btn-outline-danger btn-sm" style={{ borderRadius: '8px' }}>
                                                    <i className="fas fa-times me-1"></i>Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Past Appointments */}
            <div className="col-12">
                <div className="card" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <div className="card-header" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '1.5rem'
                    }}>
                        <h5 className="mb-0 fw-bold text-dark">Past Appointments</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            {pastAppointments.map(appointment => (
                                <div key={appointment.id} className="col-12">
                                    <div className="row align-items-center p-3 border rounded g-3" style={{
                                        borderRadius: '15px',
                                        border: '1px solid #e9ecef',
                                        background: '#fafbfc'
                                    }}>
                                        <div className="col-12 col-sm-2 text-center">
                                            <img
                                                src={appointment.avatar}
                                                alt={appointment.doctor}
                                                className="rounded-circle"
                                                style={{ 
                                                    width: '80px', 
                                                    height: '80px', 
                                                    objectFit: 'cover',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <h5 className="mb-1 fw-bold">{appointment.doctor}</h5>
                                            <p className="mb-1 text-muted">{appointment.specialty}</p>
                                            <p className="mb-1 small">
                                                <i className="fas fa-calendar me-2 text-primary"></i>
                                                {appointment.date} at {appointment.time}
                                            </p>
                                            <span className="badge text-white" style={{
                                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                borderRadius: '20px'
                                            }}>{appointment.type}</span>
                                            {appointment.notes && (
                                                <p className="mt-2 mb-0 small">
                                                    <strong>Notes:</strong> {appointment.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-2 text-center">
                                            <span className="badge text-white px-3 py-1" style={{
                                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                borderRadius: '20px'
                                            }}>{appointment.status}</span>
                                        </div>
                                        <div className="col-12 col-sm-2">
                                            <button className="btn btn-outline-primary btn-sm w-100" style={{ borderRadius: '8px' }}>
                                                <i className="fas fa-download me-1"></i>Download Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMedicalRecords = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                    <h4 className="mb-0">Medical Records</h4>
                    <button className="btn text-white fw-semibold" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px'
                    }}>
                        <i className="fas fa-upload me-2"></i>Upload Record
                    </button>
                </div>
            </div>

            {/* Health Profile */}
            <div className="col-12 col-lg-4">
                <div className="card h-100" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <div className="card-header" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '1.5rem'
                    }}>
                        <h5 className="mb-0 fw-bold text-dark">Health Profile</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="mb-3">
                            <label className="form-label text-muted fw-semibold">Blood Type</label>
                            <p className="mb-0 fw-bold">{patientData.bloodType}</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-muted fw-semibold">Date of Birth</label>
                            <p className="mb-0 fw-bold">{patientData.dateOfBirth}</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-muted fw-semibold">Emergency Contact</label>
                            <p className="mb-0 fw-bold">{patientData.emergencyContact}</p>
                        </div>
                        <button className="btn w-100 fw-semibold" style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '12px',
                            color: '#667eea'
                        }}>
                            <i className="fas fa-edit me-2"></i>Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Medical Records List */}
            <div className="col-12 col-lg-8">
                <div className="card h-100" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <div className="card-header" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '1.5rem'
                    }}>
                        <h5 className="mb-0 fw-bold text-dark">Records & Documents</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            {medicalRecords.map(record => (
                                <div key={record.id} className="col-12">
                                    <div className="d-flex align-items-center p-3 border rounded" style={{
                                        borderRadius: '15px',
                                        border: '1px solid #e9ecef',
                                        background: '#fafbfc',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div className="me-3">
                                            <div className="d-flex align-items-center justify-content-center" style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            }}>
                                                <i className={`fas ${
                                                    record.type === 'Lab Report' ? 'fa-flask' :
                                                    record.type === 'Imaging' ? 'fa-x-ray' : 'fa-file-medical'
                                                } text-white`}></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1 fw-bold">{record.title}</h6>
                                            <p className="mb-1 text-muted">{record.doctor}</p>
                                            <small className="text-muted">
                                                <i className="fas fa-calendar me-1 text-primary"></i>
                                                {record.date}
                                            </small>
                                        </div>
                                        <div className="text-end">
                                            <span className={`badge px-3 py-1 text-white mb-2`} style={{
                                                background: record.status === 'Normal' || record.status === 'Complete' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                borderRadius: '20px'
                                            }}>
                                                {record.status}
                                            </span>
                                            <br />
                                            <div className="btn-group-sm">
                                                <button className="btn btn-outline-primary btn-sm me-1" style={{ borderRadius: '8px' }}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button className="btn btn-outline-secondary btn-sm" style={{ borderRadius: '8px' }}>
                                                    <i className="fas fa-download"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMessages = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <h4>Messages</h4>
            </div>

            <div className="col-12 col-lg-4">
                <div className="card h-100" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <div className="card-header" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '1.5rem'
                    }}>
                        <h5 className="mb-0 fw-bold text-dark">Conversations</h5>
                    </div>
                    <div className="card-body p-0">
                        {messages.map(message => (
                            <div key={message.id} className={`d-flex align-items-center p-3 border-bottom ${message.unread ? '' : ''}`} style={{ 
                                cursor: 'pointer',
                                background: message.unread ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' : 'transparent'
                            }}>
                                <img
                                    src={message.avatar}
                                    alt={message.doctor}
                                    className="rounded-circle me-3 flex-shrink-0"
                                    style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        objectFit: 'cover',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <div className="flex-grow-1 min-w-0">
                                    <h6 className="mb-1 fw-semibold">{message.doctor}</h6>
                                    <p className="mb-0 small text-muted text-truncate">{message.lastMessage}</p>
                                    <small className="text-muted">{message.time}</small>
                                </div>
                                {message.unread && (
                                    <span className="flex-shrink-0" style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%'
                                    }}></span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="col-12 col-lg-8">
                <div className="card h-100" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <div className="card-header d-flex align-items-center" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '1.5rem'
                    }}>
                        <img
                            src={messages[0].avatar}
                            alt={messages[0].doctor}
                            className="rounded-circle me-3 flex-shrink-0"
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                objectFit: 'cover',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        />
                        <div>
                            <h6 className="mb-0 fw-bold text-dark">{messages[0].doctor}</h6>
                            <small className="text-success">Online</small>
                        </div>
                    </div>
                    <div className="card-body" style={{ height: '300px', overflowY: 'auto' }}>
                        <div className="d-flex mb-3">
                            <img
                                src={messages[0].avatar}
                                alt={messages[0].doctor}
                                className="rounded-circle me-2 flex-shrink-0"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <div className="bg-light p-2 rounded">
                                <p className="mb-0 small">Hello! I've reviewed your test results.</p>
                                <small className="text-muted">10:30 AM</small>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mb-3">
                            <div className="text-white p-2 rounded" style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}>
                                <p className="mb-0 small">Great! What do they show?</p>
                                <small className="text-white-50">10:32 AM</small>
                            </div>
                        </div>
                        <div className="d-flex mb-3">
                            <img
                                src={messages[0].avatar}
                                alt={messages[0].doctor}
                                className="rounded-circle me-2 flex-shrink-0"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <div className="bg-light p-2 rounded">
                                <p className="mb-0 small">{messages[0].lastMessage}</p>
                                <small className="text-muted">2 hours ago</small>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer" style={{ background: 'white', borderRadius: '0 0 20px 20px' }}>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Type your message..." style={{ borderRadius: '10px 0 0 10px' }} />
                            <button className="btn text-white" style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '0 10px 10px 0'
                            }}>
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                    <h4>My Profile</h4>
                    <LogOut />
                </div>
            </div>

            <div className="col-12 col-lg-4">
                <div className="card text-center h-100" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <div className="card-body p-4">
                        <img
                            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
                            alt="Profile"
                            className="rounded-circle mb-3"
                            style={{ 
                                width: '120px', 
                                height: '120px', 
                                objectFit: 'cover',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            }}
                        />
                        <h5 className="fw-bold">{patientData.name}</h5>
                        <p className="text-muted">Patient ID: #P12345</p>
                        <button className="btn fw-semibold" style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '12px',
                            color: '#667eea'
                        }}>
                            <i className="fas fa-camera me-2"></i>Change Photo
                        </button>
                    </div>
                </div>
            </div>

            <div className="col-12 col-lg-8">
                <div className="card h-100" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <div className="card-header" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '1.5rem'
                    }}>
                        <h5 className="mb-0 fw-bold text-dark">Personal Information</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Full Name</label>
                                <input type="text" className="form-control" defaultValue={patientData.name} style={{ borderRadius: '10px' }} />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Email</label>
                                <input type="email" className="form-control" defaultValue={patientData.email} style={{ borderRadius: '10px' }} />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Phone</label>
                                <input type="tel" className="form-control" defaultValue={patientData.phone} style={{ borderRadius: '10px' }} />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Date of Birth</label>
                                <input type="date" className="form-control" defaultValue={patientData.dateOfBirth} style={{ borderRadius: '10px' }} />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Blood Type</label>
                                <select className="form-select" style={{ borderRadius: '10px' }}>
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
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Emergency Contact</label>
                                <input type="text" className="form-control" defaultValue={patientData.emergencyContact} style={{ borderRadius: '10px' }} />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-semibold">Medical Conditions</label>
                                <textarea 
                                    className="form-control" 
                                    rows="3" 
                                    placeholder="List any current medical conditions, allergies, or medications..."
                                    style={{ borderRadius: '10px' }}
                                ></textarea>
                            </div>
                            <div className="col-12">
                                <button type="button" className="btn text-white fw-semibold" style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 20px'
                                }}>
                                    <i className="fas fa-save me-2"></i>Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch(activeTab) {
            case 'available': return renderAvailableDoctors();
            case 'overview': return renderOverview();
            case 'appointments': return renderAppointments();
            case 'records': return renderMedicalRecords();
            case 'messages': return renderMessages();
            case 'profile': return renderProfile();
            default: return renderOverview();
        }
    };

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
                    
                    .stat-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4) !important;
                    }
                    
                    .nav-link:hover {
                        transform: translateY(-1px) !important;
                    }
                    
                    .btn:hover {
                        transform: translateY(-1px);
                        transition: all 0.3s ease;
                    }
                    
                    .appointment-card:hover {
                        background: #f8f9fa !important;
                        border-color: #667eea !important;
                        transform: translateX(5px);
                    }
                    
                    .message-item:hover {
                        background: rgba(102, 126, 234, 0.1) !important;
                        border-color: rgba(102, 126, 234, 0.2) !important;
                    }
                    
                    @media (max-width: 768px) {
                        .nav-link {
                            font-size: 0.85rem;
                            padding: 8px 12px !important;
                        }
                    }
                `
            }} />

            {/* Dashboard Header */}
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
                                        <i className="fas fa-user text-primary" style={{ fontSize: '1.5rem' }}></i>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold text-white">Welcome back, {patientData.name}!</h1>
                                    <p className="text-white-50 mb-0 small">Manage your healthcare appointments and records</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-4">
                            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-lg-end">
                                <button className="btn text-white flex-fill flex-sm-grow-0" style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '10px'
                                }}>
                                    <i className="fas fa-plus me-2"></i>
                                    <span className="d-none d-sm-inline">Book </span>Appointment
                                </button>
                                <button className="btn text-white flex-fill flex-sm-grow-0" style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '10px'
                                }}>
                                    <i className="fas fa-video me-2"></i>
                                    <span className="d-none d-sm-inline">Join </span>Call
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Dashboard Navigation */}
            <nav className="bg-white" style={{ 
                borderBottom: '1px solid #e9ecef',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
                <div className="container-fluid px-3 px-md-4">
                    <div className="nav nav-pills d-flex overflow-auto py-3" style={{ minHeight: '4rem' }}>
                        {[
                            { id: 'available', icon: 'fa-user-md', label: 'Available Doctors', color: '#667eea' },
                            { id: 'overview', icon: 'fa-tachometer-alt', label: 'Overview', color: '#f093fb' },
                            { id: 'appointments', icon: 'fa-calendar-check', label: 'Appointments', color: '#4facfe' },
                            { id: 'records', icon: 'fa-file-medical', label: 'Medical Records', color: '#43e97b' },
                            { id: 'messages', icon: 'fa-comments', label: 'Messages', badge: messages.filter(m => m.unread).length, color: '#fa709a' },
                            { id: 'profile', icon: 'fa-user', label: 'Profile', color: '#a8edea' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-link d-flex align-items-center text-nowrap me-3 position-relative ${
                                    activeTab === tab.id ? '' : 'text-muted'
                                }`}
                                onClick={() => setActiveTab(tab.id)}
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
                                <span className="d-md-none">{tab.label.split(' ')[0]}</span>
                                {tab.badge && tab.badge > 0 && (
                                    <span 
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                                        style={{
                                            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                                            fontSize: '0.7rem',
                                            padding: '4px 8px'
                                        }}
                                    >
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container-fluid px-3 px-md-4 py-4">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default PatientDashboard;