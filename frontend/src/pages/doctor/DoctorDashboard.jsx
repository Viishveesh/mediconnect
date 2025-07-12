import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LogOut from '../auth/LogOut.jsx';
import DoctorProfile from './DoctorProfile.jsx';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [doctorData, setDoctorData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Making API call to fetch doctor profile...');
            const response = await axios.get('http://localhost:5000/api/doctor/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Profile data received:', response.data);
            const profileData = response.data;
            setDoctorData({
                name: `Dr. ${profileData.firstName} ${profileData.lastName}`,
                specialty: profileData.specialization || 'Doctor',
                email: profileData.email,
                phone: profileData.contactNumber || 'N/A',
                clinicName: profileData.clinicName || 'N/A',
                experience: profileData.experience ? `${profileData.experience} years` : 'N/A',
                qualification: profileData.qualification || 'N/A',
                consultationFee: profileData.consultationFee || 0,
                address: profileData.address || 'N/A',
                rating: 4.8, // This would come from ratings API
                totalPatients: 342 // This would come from patients API
            });
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
            console.log('Error details:', error.response?.data);
            
            // If profile doesn't exist (404), get user data from token
            if (error.response?.status === 404) {
                try {
                    const token = localStorage.getItem('token');
                    const decodedToken = JSON.parse(atob(token.split('.')[1]));
                    console.log('Using token data for fallback:', decodedToken);
                    
                    setDoctorData({
                        name: "Doctor",
                        specialty: "Doctor",
                        email: decodedToken.email || "N/A",
                        phone: "N/A",
                        clinicName: "N/A",
                        experience: "N/A",
                        qualification: "N/A",
                        consultationFee: 0,
                        address: "N/A",
                        rating: 0,
                        totalPatients: 0
                    });
                } catch (tokenError) {
                    console.error('Error decoding token:', tokenError);
                    setDoctorData({
                        name: "Doctor",
                        specialty: "Doctor",
                        email: "N/A",
                        phone: "N/A",
                        clinicName: "N/A",
                        experience: "N/A",
                        qualification: "N/A",
                        consultationFee: 0,
                        address: "N/A",
                        rating: 0,
                        totalPatients: 0
                    });
                }
            } else {
                // Set default data for other errors
                setDoctorData({
                    name: "Doctor",
                    specialty: "Doctor",
                    email: "N/A",
                    phone: "N/A",
                    clinicName: "N/A",
                    experience: "N/A",
                    qualification: "N/A",
                    consultationFee: 0,
                    address: "N/A",
                    rating: 0,
                    totalPatients: 0
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const todaySchedule = [
        {
            id: 1,
            patient: "Sarah Johnson",
            time: "09:00 AM",
            duration: "30 mins",
            type: "Video Consultation",
            status: "upcoming",
            reason: "Follow-up Cardiology",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 2,
            patient: "Michael Smith",
            time: "10:30 AM",
            duration: "45 mins",
            type: "In-Person Visit",
            status: "in-progress",
            reason: "Chest Pain Evaluation",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 3,
            patient: "Lisa Davis",
            time: "02:00 PM",
            duration: "30 mins",
            type: "Video Consultation",
            status: "upcoming",
            reason: "Blood Pressure Review",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 4,
            patient: "Robert Wilson",
            time: "03:30 PM",
            duration: "60 mins",
            type: "In-Person Visit",
            status: "upcoming",
            reason: "Cardiac Stress Test",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
        }
    ];

    const upcomingAppointments = [
        {
            id: 5,
            patient: "Emma Thompson",
            date: "2025-06-27",
            time: "11:00 AM",
            type: "Video Consultation",
            reason: "Post-surgery Follow-up",
            avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 6,
            patient: "James Wilson",
            date: "2025-06-28",
            time: "09:30 AM",
            type: "In-Person Visit",
            reason: "Initial Consultation",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
        }
    ];

    const patientsList = [
        {
            id: 1,
            name: "Sarah Johnson",
            age: 38,
            gender: "Female",
            lastVisit: "2025-06-20",
            condition: "Hypertension",
            status: "Stable",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 2,
            name: "Michael Smith",
            age: 45,
            gender: "Male",
            lastVisit: "2025-06-22",
            condition: "Arrhythmia",
            status: "Monitoring",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 3,
            name: "Lisa Davis",
            age: 52,
            gender: "Female",
            lastVisit: "2025-06-18",
            condition: "High Cholesterol",
            status: "Improving",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
        }
    ];

    const messages = [
        {
            id: 1,
            patient: "Sarah Johnson",
            lastMessage: "Thank you for the consultation. Should I continue the medication?",
            time: "1 hour ago",
            unread: true,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face"
        },
        {
            id: 2,
            patient: "Michael Smith",
            lastMessage: "I'm experiencing some side effects from the new medication.",
            time: "3 hours ago",
            unread: true,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
        },
        {
            id: 3,
            patient: "Lisa Davis",
            lastMessage: "My blood pressure readings for this week are attached.",
            time: "1 day ago",
            unread: false,
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
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
                                    <i className="fas fa-calendar-day" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h3 className="mb-1 fw-bold">{todaySchedule.length}</h3>
                                <p className="mb-0 small opacity-75">Today's Appointments</p>
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
                                    <i className="fas fa-users" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h3 className="mb-1 fw-bold">{doctorData?.totalPatients || 0}</h3>
                                <p className="mb-0 small opacity-75">Total Patients</p>
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
                                    <i className="fas fa-star" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h3 className="mb-1 fw-bold">{doctorData?.rating || 0}</h3>
                                <p className="mb-0 small opacity-75">Average Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Schedule and Sidebar */}
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
                        <h5 className="mb-0 fw-bold text-dark">Today's Schedule</h5>
                        <span className="badge text-white px-3 py-2" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '20px',
                            fontSize: '0.85rem'
                        }}>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            {todaySchedule.map(appointment => (
                                <div key={appointment.id} className="col-12">
                                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center appointment-card p-3 border rounded gap-3" style={{
                                        borderRadius: '15px',
                                        border: '1px solid #e9ecef',
                                        background: '#fafbfc',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div className="text-center">
                                            <div className="bg-white rounded-3 p-2 shadow-sm" style={{ minWidth: '70px' }}>
                                                <strong className="d-block text-primary">{appointment.time.split(' ')[0]}</strong>
                                                <small className="text-muted">{appointment.time.split(' ')[1]}</small>
                                            </div>
                                        </div>
                                        <img
                                            src={appointment.avatar}
                                            alt={appointment.patient}
                                            className="rounded-circle border border-white"
                                            style={{ 
                                                width: '50px', 
                                                height: '50px', 
                                                objectFit: 'cover',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1 fw-bold">{appointment.patient}</h6>
                                            <p className="mb-1 text-muted small">{appointment.reason}</p>
                                            <small className="text-muted">
                                                <i className={`fas ${appointment.type === 'Video Consultation' ? 'fa-video' : 'fa-hospital'} me-1 text-primary`}></i>
                                                {appointment.type} • {appointment.duration}
                                            </small>
                                        </div>
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <span className={`badge px-3 py-1 ${
                                                appointment.status === 'upcoming' ? 'text-white' :
                                                appointment.status === 'in-progress' ? 'text-white' : 'text-white'
                                            }`} style={{
                                                background: appointment.status === 'upcoming' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                                                          appointment.status === 'in-progress' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 
                                                          'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                                                borderRadius: '20px'
                                            }}>
                                                {appointment.status}
                                            </span>
                                            <div className="btn-group-sm">
                                                <button className="btn btn-sm me-1" style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    padding: '6px 12px'
                                                }}>
                                                    <i className="fas fa-video"></i>
                                                </button>
                                                <button className="btn btn-outline-secondary btn-sm" style={{
                                                    borderRadius: '8px',
                                                    padding: '6px 12px'
                                                }}>
                                                    <i className="fas fa-user-md"></i>
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

            <div className="col-12 col-xl-4">
                <div className="row g-3">
                    {/* Quick Actions */}
                    <div className="col-12 col-md-6 col-xl-12">
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
                                <h6 className="mb-0 fw-bold text-dark">Quick Actions</h6>
                            </div>
                            <div className="card-body p-4">
                                <div className="d-grid gap-3">
                                    <button className="btn text-white fw-semibold" style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                    }}>
                                        <i className="fas fa-plus me-2"></i>Add Appointment
                                    </button>
                                    <button className="btn fw-semibold" style={{
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        color: '#667eea'
                                    }}>
                                        <i className="fas fa-calendar-alt me-2"></i>Manage Schedule
                                    </button>
                                    <button className="btn fw-semibold" style={{
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        color: '#667eea'
                                    }}>
                                        <i className="fas fa-user-plus me-2"></i>Add Patient
                                    </button>
                                    <button className="btn fw-semibold" style={{
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        color: '#667eea'
                                    }}>
                                        <i className="fas fa-chart-line me-2"></i>View Analytics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="col-12 col-md-6 col-xl-12">
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
                                <h6 className="mb-0 fw-bold text-dark">Recent Messages</h6>
                            </div>
                            <div className="card-body p-3">
                                {messages.slice(0, 3).map(message => (
                                    <div key={message.id} className={`d-flex align-items-start message-item p-3 rounded mb-2 ${message.unread ? '' : ''}`} style={{
                                        background: message.unread ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' : 'transparent',
                                        borderRadius: '12px',
                                        border: message.unread ? '1px solid rgba(102, 126, 234, 0.1)' : '1px solid transparent'
                                    }}>
                                        <img
                                            src={message.avatar}
                                            alt={message.patient}
                                            className="rounded-circle me-3 flex-shrink-0"
                                            style={{ 
                                                width: '35px', 
                                                height: '35px', 
                                                objectFit: 'cover',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <div className="flex-grow-1 min-w-0">
                                            <h6 className="mb-1 fs-6 fw-semibold">{message.patient}</h6>
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
                                }}>View All</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAppointments = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                    <h4 className="mb-0">Appointments Management</h4>
                    <button className="btn btn-primary">
                        <i className="fas fa-plus me-2"></i>Schedule Appointment
                    </button>
                </div>
            </div>

            {/* Today's Appointments */}
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Today's Appointments - {new Date().toLocaleDateString()}</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            {todaySchedule.map(appointment => (
                                <div key={appointment.id} className="col-12">
                                    <div className="row align-items-center p-3 border rounded g-3">
                                        <div className="col-12 col-sm-2 text-center">
                                            <strong className="d-block">{appointment.time}</strong>
                                            <small className="text-muted">{appointment.duration}</small>
                                        </div>
                                        <div className="col-12 col-sm-2 text-center">
                                            <img
                                                src={appointment.avatar}
                                                alt={appointment.patient}
                                                className="rounded-circle"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="col-12 col-sm-4">
                                            <h6 className="mb-1">{appointment.patient}</h6>
                                            <p className="mb-1 text-muted small">{appointment.reason}</p>
                                            <span className={`badge ${appointment.type === 'Video Consultation' ? 'bg-info' : 'bg-success'}`}>
                                                {appointment.type}
                                            </span>
                                        </div>
                                        <div className="col-12 col-sm-2 text-center">
                                            <span className={`badge ${
                                                appointment.status === 'upcoming' ? 'bg-primary' :
                                                appointment.status === 'in-progress' ? 'bg-success' : 'bg-secondary'
                                            }`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        <div className="col-12 col-sm-2">
                                            <div className="d-grid gap-1">
                                                <button className="btn btn-primary btn-sm">
                                                    <i className="fas fa-video me-1"></i>Start
                                                </button>
                                                <button className="btn btn-outline-secondary btn-sm">
                                                    <i className="fas fa-edit me-1"></i>Edit
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

            {/* Upcoming Appointments */}
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Upcoming Appointments</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            {upcomingAppointments.map(appointment => (
                                <div key={appointment.id} className="col-12">
                                    <div className="row align-items-center p-3 border rounded g-3">
                                        <div className="col-12 col-sm-2 text-center">
                                            <img
                                                src={appointment.avatar}
                                                alt={appointment.patient}
                                                className="rounded-circle"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <h6 className="mb-1">{appointment.patient}</h6>
                                            <p className="mb-1 text-muted small">{appointment.reason}</p>
                                            <p className="mb-1 small">
                                                <i className="fas fa-calendar me-2"></i>
                                                {appointment.date} at {appointment.time}
                                            </p>
                                            <span className={`badge ${appointment.type === 'Video Consultation' ? 'bg-info' : 'bg-success'}`}>
                                                {appointment.type}
                                            </span>
                                        </div>
                                        <div className="col-12 col-sm-4">
                                            <div className="d-grid d-sm-flex gap-2">
                                                <button className="btn btn-outline-primary btn-sm flex-fill">
                                                    <i className="fas fa-edit me-1"></i>Reschedule
                                                </button>
                                                <button className="btn btn-outline-danger btn-sm flex-fill">
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
        </div>
    );

    const renderPatients = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                    <h4 className="mb-0">Patient Management</h4>
                    <div className="d-flex flex-column flex-sm-row gap-2">
                        <button className="btn btn-outline-primary">
                            <i className="fas fa-download me-2"></i>Export
                        </button>
                        <button className="btn btn-primary">
                            <i className="fas fa-user-plus me-2"></i>Add Patient
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="col-12">
                <div className="card">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fas fa-search"></i>
                                    </span>
                                    <input type="text" className="form-control" placeholder="Search patients..." />
                                </div>
                            </div>
                            <div className="col-6 col-md-2">
                                <select className="form-select">
                                    <option>All Status</option>
                                    <option>Stable</option>
                                    <option>Monitoring</option>
                                    <option>Critical</option>
                                </select>
                            </div>
                            <div className="col-6 col-md-2">
                                <select className="form-select">
                                    <option>All Conditions</option>
                                    <option>Hypertension</option>
                                    <option>Diabetes</option>
                                    <option>Heart Disease</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-2">
                                <button className="btn btn-outline-secondary w-100">
                                    <i className="fas fa-filter me-1"></i>Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patients List */}
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Patient Records</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            {patientsList.map(patient => (
                                <div key={patient.id} className="col-12">
                                    <div className="row align-items-center p-3 border rounded g-3">
                                        <div className="col-12 col-sm-2 text-center">
                                            <img
                                                src={patient.avatar}
                                                alt={patient.name}
                                                className="rounded-circle"
                                                style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="col-12 col-sm-4">
                                            <h6 className="mb-1">{patient.name}</h6>
                                            <p className="mb-1 text-muted small">{patient.age} years • {patient.gender}</p>
                                            <small className="text-muted">
                                                <i className="fas fa-calendar me-1"></i>
                                                Last visit: {patient.lastVisit}
                                            </small>
                                        </div>
                                        <div className="col-12 col-sm-3">
                                            <p className="mb-1 small"><strong>Condition:</strong> {patient.condition}</p>
                                            <span className={`badge ${
                                                patient.status === 'Stable' ? 'bg-success' :
                                                patient.status === 'Monitoring' ? 'bg-warning' : 'bg-danger'
                                            }`}>
                                                {patient.status}
                                            </span>
                                        </div>
                                        <div className="col-12 col-sm-3">
                                            <div className="d-grid gap-1">
                                                <button className="btn btn-primary btn-sm">
                                                    <i className="fas fa-eye me-1"></i>View Records
                                                </button>
                                                <button className="btn btn-outline-primary btn-sm">
                                                    <i className="fas fa-video me-1"></i>Start Call
                                                </button>
                                                <button className="btn btn-outline-secondary btn-sm">
                                                    <i className="fas fa-message me-1"></i>Message
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

    const renderSchedule = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <h4>Schedule Management</h4>
            </div>

            {/* Weekly Schedule */}
            <div className="col-12 col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Weekly Schedule</h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Mon</th>
                                    <th>Tue</th>
                                    <th>Wed</th>
                                    <th>Thu</th>
                                    <th>Fri</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td><small>9:00 AM</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-primary text-white text-center"><small>Sarah J.</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-primary text-white text-center"><small>Michael S.</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                </tr>
                                <tr>
                                    <td><small>10:00 AM</small></td>
                                    <td className="bg-primary text-white text-center"><small>Lisa D.</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-primary text-white text-center"><small>Robert W.</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-primary text-white text-center"><small>Emma T.</small></td>
                                </tr>
                                <tr>
                                    <td><small>11:00 AM</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                </tr>
                                <tr>
                                    <td><small>2:00 PM</small></td>
                                    <td className="bg-primary text-white text-center"><small>James W.</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-primary text-white text-center"><small>Anna K.</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                    <td className="bg-light text-center"><small>Available</small></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Settings */}
            <div className="col-12 col-lg-4">
                <div className="row g-3">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">Schedule Settings</h6>
                            </div>
                            <div className="card-body">
                                <div>
                                    <div className="mb-3">
                                        <label className="form-label">Working Hours</label>
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <input type="time" className="form-control" defaultValue="09:00" />
                                            </div>
                                            <div className="col-6">
                                                <input type="time" className="form-control" defaultValue="17:00" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Working Days</label>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                            <div className="form-check" key={day}>
                                                <input className="form-check-input" type="checkbox" defaultChecked />
                                                <label className="form-check-label">{day}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Consultation Duration</label>
                                        <select className="form-select">
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">60 minutes</option>
                                        </select>
                                    </div>
                                    <button type="button" className="btn btn-primary w-100">
                                        <i className="fas fa-save me-2"></i>Save Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">Quick Actions</h6>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    <button className="btn btn-outline-primary">
                                        <i className="fas fa-calendar-times me-2"></i>Block Time
                                    </button>
                                    <button className="btn btn-outline-warning">
                                        <i className="fas fa-plane me-2"></i>Set Vacation
                                    </button>
                                    <button className="btn btn-outline-info">
                                        <i className="fas fa-copy me-2"></i>Copy Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMessages = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <h4>Patient Messages</h4>
            </div>

            <div className="col-12 col-lg-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Conversations</h5>
                    </div>
                    <div className="card-body p-0">
                        {messages.map(message => (
                            <div key={message.id} className={`d-flex align-items-center p-3 border-bottom ${message.unread ? 'bg-light' : ''}`} style={{ cursor: 'pointer' }}>
                                <img
                                    src={message.avatar}
                                    alt={message.patient}
                                    className="rounded-circle me-3 flex-shrink-0"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1 min-w-0">
                                    <h6 className="mb-1">{message.patient}</h6>
                                    <p className="mb-0 small text-muted text-truncate">{message.lastMessage}</p>
                                    <small className="text-muted">{message.time}</small>
                                </div>
                                {message.unread && <span className="badge bg-primary rounded-pill flex-shrink-0">!</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="col-12 col-lg-8">
                <div className="card h-100">
                    <div className="card-header d-flex align-items-center">
                        <img
                            src={messages[0].avatar}
                            alt={messages[0].patient}
                            className="rounded-circle me-3 flex-shrink-0"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <div>
                            <h6 className="mb-0">{messages[0].patient}</h6>
                            <small className="text-muted">Last seen: 1 hour ago</small>
                        </div>
                    </div>
                    <div className="card-body" style={{ height: '300px', overflowY: 'auto' }}>
                        <div className="d-flex mb-3">
                            <img
                                src={messages[0].avatar}
                                alt={messages[0].patient}
                                className="rounded-circle me-2 flex-shrink-0"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <div className="bg-light p-2 rounded">
                                <p className="mb-0 small">Hello Dr. Chen, I hope you're doing well.</p>
                                <small className="text-muted">2:30 PM</small>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mb-3">
                            <div className="bg-primary text-white p-2 rounded">
                                <p className="mb-0 small">Hello Sarah! How are you feeling today?</p>
                                <small className="text-white-50">2:32 PM</small>
                            </div>
                        </div>
                        <div className="d-flex mb-3">
                            <img
                                src={messages[0].avatar}
                                alt={messages[0].patient}
                                className="rounded-circle me-2 flex-shrink-0"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <div className="bg-light p-2 rounded">
                                <p className="mb-0 small">{messages[0].lastMessage}</p>
                                <small className="text-muted">1 hour ago</small>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Type your response..." />
                            <button className="btn btn-primary">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <h4>Analytics & Insights</h4>
            </div>

            {/* Monthly Stats */}
            <div className="col-12">
                <div className="row g-3">
                    <div className="col-6 col-md-3">
                        <div className="card text-center h-100">
                            <div className="card-body">
                                <i className="fas fa-users fa-2x text-primary mb-3"></i>
                                <h4>342</h4>
                                <p className="text-muted mb-1 small">Total Patients</p>
                                <small className="text-success">+12% this month</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card text-center h-100">
                            <div className="card-body">
                                <i className="fas fa-calendar-check fa-2x text-success mb-3"></i>
                                <h4>156</h4>
                                <p className="text-muted mb-1 small">Consultations</p>
                                <small className="text-success">+8% this month</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card text-center h-100">
                            <div className="card-body">
                                <i className="fas fa-star fa-2x text-warning mb-3"></i>
                                <h4>4.8</h4>
                                <p className="text-muted mb-1 small">Avg Rating</p>
                                <small className="text-success">+0.2 this month</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card text-center h-100">
                            <div className="card-body">
                                <i className="fas fa-dollar-sign fa-2x text-info mb-3"></i>
                                <h4>$12,450</h4>
                                <p className="text-muted mb-1 small">Revenue</p>
                                <small className="text-success">+15% this month</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="col-12 col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Weekly Appointments</h5>
                    </div>
                    <div className="card-body">
                        <div className="text-center py-5">
                            <i className="fas fa-chart-line fa-4x text-muted mb-3"></i>
                            <p className="text-muted">Chart placeholder - Weekly appointment trends</p>
                            <small className="text-muted">Integration with chart library needed</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 col-lg-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Patient Demographics</h5>
                    </div>
                    <div className="card-body">
                        {[
                            { label: 'Age 18-30', percentage: 25, color: 'primary' },
                            { label: 'Age 31-50', percentage: 40, color: 'success' },
                            { label: 'Age 51-70', percentage: 30, color: 'warning' },
                            { label: 'Age 70+', percentage: 5, color: 'danger' }
                        ].map((item, index) => (
                            <div className="mb-3" key={index}>
                                <div className="d-flex justify-content-between">
                                    <span className="small">{item.label}</span>
                                    <span className="small">{item.percentage}%</span>
                                </div>
                                <div className="progress">
                                    <div className={`progress-bar bg-${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                    <h4>Doctor Profile</h4>
                    <LogOut />
                </div>
            </div>
            <div className="col-12">
                <DoctorProfile />
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch(activeTab) {
            case 'overview': return renderOverview();
            case 'appointments': return renderAppointments();
            case 'patients': return renderPatients();
            case 'schedule': return renderSchedule();
            case 'messages': return renderMessages();
            case 'analytics': return renderAnalytics();
            case 'profile': return renderProfile();
            default: return renderOverview();
        }
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ 
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh'
            }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

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
                                        <i className="fas fa-user-md text-primary" style={{ fontSize: '1.5rem' }}></i>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="h3 mb-1 fw-bold text-white">Welcome, {doctorData?.name || 'Doctor'}!</h1>
                                    <p className="text-white-50 mb-0 small">
                                        {doctorData?.clinicName !== 'N/A' ? `${doctorData?.clinicName} • ` : ''}
                                        {doctorData?.specialty || 'Doctor'}
                                    </p>
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
                                    <i className="fas fa-video me-2"></i>
                                    <span className="d-none d-sm-inline">Start </span>Consultation
                                </button>
                                <button className="btn text-white flex-fill flex-sm-grow-0" style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '10px'
                                }}>
                                    <i className="fas fa-calendar-plus me-2"></i>
                                    <span className="d-none d-sm-inline">Add </span>Appointment
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
                            { id: 'overview', icon: 'fa-tachometer-alt', label: 'Overview', color: '#667eea' },
                            { id: 'appointments', icon: 'fa-calendar-check', label: 'Appointments', color: '#f093fb' },
                            { id: 'patients', icon: 'fa-users', label: 'Patients', color: '#4facfe' },
                            { id: 'schedule', icon: 'fa-calendar-alt', label: 'Schedule', color: '#43e97b' },
                            { id: 'messages', icon: 'fa-comments', label: 'Messages', badge: messages.filter(m => m.unread).length, color: '#fa709a' },
                            { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics', color: '#fee140' },
                            { id: 'profile', icon: 'fa-user-md', label: 'Profile', color: '#a8edea' }
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
                                <span className="d-md-none">{tab.label.slice(0, 3)}</span>
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

export default DoctorDashboard;