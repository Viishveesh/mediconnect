import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const navigate = useNavigate();

    const handleViewSchedule = () => {
        navigate('/doctor/schedule/686972d642b66e848a66cebe');
    };


    // Dummy data
    const doctorData = {
        name: "Dr. Emily Chen",
        specialty: "Cardiologist",
        email: "emily.chen@mediconnect.com",
        phone: "+1 (555) 456-7890",
        license: "MD-12345-CA",
        experience: "12 years",
        rating: 4.8,
        totalPatients: 342
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

    const weeklyStats = {
        appointments: [12, 15, 18, 20, 16, 14, 19],
        consultations: [8, 12, 14, 16, 13, 11, 15],
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };

    const renderOverview = () => (
        <div className="row g-4">
            {/* Quick Stats */}
            <div className="col-12">
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white h-100">
                            <div className="card-body text-center">
                                <i className="fas fa-calendar-day fa-2x mb-3"></i>
                                <h3 className="mb-1">{todaySchedule.length}</h3>
                                <p className="mb-0">Today's Appointments</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white h-100">
                            <div className="card-body text-center">
                                <i className="fas fa-users fa-2x mb-3"></i>
                                <h3 className="mb-1">{doctorData.totalPatients}</h3>
                                <p className="mb-0">Total Patients</p>
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
                                <i className="fas fa-star fa-2x mb-3"></i>
                                <h3 className="mb-1">{doctorData.rating}</h3>
                                <p className="mb-0">Average Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="col-lg-8">
                <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Today's Schedule</h5>
                        <span className="badge bg-primary">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="card-body">
                        {todaySchedule.map(appointment => (
                            <div key={appointment.id} className="d-flex align-items-center p-3 border rounded mb-3">
                                <div className="me-3">
                                    <div className="text-center">
                                        <strong className="d-block">{appointment.time.split(' ')[0]}</strong>
                                        <small className="text-muted">{appointment.time.split(' ')[1]}</small>
                                    </div>
                                </div>
                                <img
                                    src={appointment.avatar}
                                    alt={appointment.patient}
                                    className="rounded-circle me-3"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{appointment.patient}</h6>
                                    <p className="mb-1 text-muted">{appointment.reason}</p>
                                    <small className="text-muted">
                                        <i className={`fas ${appointment.type === 'Video Consultation' ? 'fa-video' : 'fa-hospital'} me-1`}></i>
                                        {appointment.type} • {appointment.duration}
                                    </small>
                                </div>
                                <div className="text-end">
                  <span className={`badge ${
                      appointment.status === 'upcoming' ? 'bg-primary' :
                          appointment.status === 'in-progress' ? 'bg-success' : 'bg-secondary'
                  } mb-2`}>
                    {appointment.status}
                  </span>
                                    <br />
                                    <div className="btn-group-sm">
                                        <button className="btn btn-outline-primary btn-sm me-1">
                                            <i className="fas fa-video"></i>
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm">
                                            <i className="fas fa-user-md"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="col-lg-4">
                <div className="row g-3">
                    {/* Quick Actions */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">Quick Actions</h6>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    <button className="btn btn-primary">
                                        <i className="fas fa-plus me-2"></i>Add Appointment
                                    </button>
                                    <button className="btn btn-outline-primary">
                                        <i className="fas fa-calendar-alt me-2"></i>Manage Schedule
                                    </button>
                                    <button className="btn btn-outline-primary">
                                        <i className="fas fa-user-plus me-2"></i>Add Patient
                                    </button>
                                    <button className="btn btn-outline-primary">
                                        <i className="fas fa-chart-line me-2"></i>View Analytics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">Recent Messages</h6>
                            </div>
                            <div className="card-body">
                                {messages.slice(0, 3).map(message => (
                                    <div key={message.id} className={`d-flex align-items-start p-2 rounded mb-2 ${message.unread ? 'bg-light' : ''}`}>
                                        <img
                                            src={message.avatar}
                                            alt={message.patient}
                                            className="rounded-circle me-2"
                                            style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1 fs-6">{message.patient}</h6>
                                            <p className="mb-1 small text-muted">{message.lastMessage}</p>
                                            <small className="text-muted">{message.time}</small>
                                        </div>
                                        {message.unread && <span className="badge bg-primary rounded-pill">!</span>}
                                    </div>
                                ))}
                                <button className="btn btn-outline-primary btn-sm w-100 mt-2">View All</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAppointments = () => (
        <div className="row g-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4>Appointments Management</h4>
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
                        {todaySchedule.map(appointment => (
                            <div key={appointment.id} className="row align-items-center p-3 border rounded mb-3">
                                <div className="col-md-1 text-center">
                                    <div>
                                        <strong className="d-block">{appointment.time}</strong>
                                        <small className="text-muted">{appointment.duration}</small>
                                    </div>
                                </div>
                                <div className="col-md-2 text-center">
                                    <img
                                        src={appointment.avatar}
                                        alt={appointment.patient}
                                        className="rounded-circle"
                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-5">
                                    <h6 className="mb-1">{appointment.patient}</h6>
                                    <p className="mb-1 text-muted">{appointment.reason}</p>
                                    <span className={`badge ${appointment.type === 'Video Consultation' ? 'bg-info' : 'bg-success'}`}>
                    {appointment.type}
                  </span>
                                </div>
                                <div className="col-md-2 text-center">
                  <span className={`badge ${
                      appointment.status === 'upcoming' ? 'bg-primary' :
                          appointment.status === 'in-progress' ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {appointment.status}
                  </span>
                                </div>
                                <div className="col-md-2">
                                    <div className="btn-group-vertical w-100">
                                        <button className="btn btn-primary btn-sm mb-1">
                                            <i className="fas fa-video me-1"></i>Start
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm">
                                            <i className="fas fa-edit me-1"></i>Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                        {upcomingAppointments.map(appointment => (
                            <div key={appointment.id} className="row align-items-center p-3 border rounded mb-3">
                                <div className="col-md-2 text-center">
                                    <img
                                        src={appointment.avatar}
                                        alt={appointment.patient}
                                        className="rounded-circle"
                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <h6 className="mb-1">{appointment.patient}</h6>
                                    <p className="mb-1 text-muted">{appointment.reason}</p>
                                    <p className="mb-1">
                                        <i className="fas fa-calendar me-2"></i>
                                        {appointment.date} at {appointment.time}
                                    </p>
                                    <span className={`badge ${appointment.type === 'Video Consultation' ? 'bg-info' : 'bg-success'}`}>
                    {appointment.type}
                  </span>
                                </div>
                                <div className="col-md-4">
                                    <div className="btn-group w-100">
                                        <button className="btn btn-outline-primary btn-sm">
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
        </div>
    );

    const renderPatients = () => (
        <div className="row g-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4>Patient Management</h4>
                    <div>
                        <button className="btn btn-outline-primary me-2">
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
                            <div className="col-md-6">
                                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                                    <input type="text" className="form-control" placeholder="Search patients..." />
                                </div>
                            </div>
                            <div className="col-md-2">
                                <select className="form-select">
                                    <option>All Status</option>
                                    <option>Stable</option>
                                    <option>Monitoring</option>
                                    <option>Critical</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <select className="form-select">
                                    <option>All Conditions</option>
                                    <option>Hypertension</option>
                                    <option>Diabetes</option>
                                    <option>Heart Disease</option>
                                </select>
                            </div>
                            <div className="col-md-2">
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
                        {patientsList.map(patient => (
                            <div key={patient.id} className="row align-items-center p-3 border rounded mb-3">
                                <div className="col-md-2 text-center">
                                    <img
                                        src={patient.avatar}
                                        alt={patient.name}
                                        className="rounded-circle"
                                        style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="mb-1">{patient.name}</h6>
                                    <p className="mb-1 text-muted">{patient.age} years • {patient.gender}</p>
                                    <small className="text-muted">
                                        <i className="fas fa-calendar me-1"></i>
                                        Last visit: {patient.lastVisit}
                                    </small>
                                </div>
                                <div className="col-md-3">
                                    <p className="mb-1"><strong>Condition:</strong> {patient.condition}</p>
                                    <span className={`badge ${
                                        patient.status === 'Stable' ? 'bg-success' :
                                            patient.status === 'Monitoring' ? 'bg-warning' : 'bg-danger'
                                    }`}>
                    {patient.status}
                  </span>
                                </div>
                                <div className="col-md-3">
                                    <div className="btn-group-vertical w-100">
                                        <button className="btn btn-primary btn-sm mb-1">
                                            <i className="fas fa-eye me-1"></i>View Records
                                        </button>
                                        <button className="btn btn-outline-primary btn-sm mb-1">
                                            <i className="fas fa-video me-1"></i>Start Call
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm">
                                            <i className="fas fa-message me-1"></i>Message
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

    const renderSchedule = () => (
        <div className="row g-4">
            <div className="col-12">
                <h4>Schedule Management</h4>
            </div>

            {/* Weekly Schedule */}
            <div className="col-lg-8">
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
                                    <th>Monday</th>
                                    <th>Tuesday</th>
                                    <th>Wednesday</th>
                                    <th>Thursday</th>
                                    <th>Friday</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>9:00 AM</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-primary text-white text-center">Sarah J.</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-primary text-white text-center">Michael S.</td>
                                    <td className="bg-light text-center">Available</td>
                                </tr>
                                <tr>
                                    <td>10:00 AM</td>
                                    <td className="bg-primary text-white text-center">Lisa D.</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-primary text-white text-center">Robert W.</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-primary text-white text-center">Emma T.</td>
                                </tr>
                                <tr>
                                    <td>11:00 AM</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-light text-center">Available</td>
                                </tr>
                                <tr>
                                    <td>2:00 PM</td>
                                    <td className="bg-primary text-white text-center">James W.</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-primary text-white text-center">Anna K.</td>
                                    <td className="bg-light text-center">Available</td>
                                    <td className="bg-light text-center">Available</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Settings */}
            <div className="col-lg-4">
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0">Schedule Settings</h6>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="mb-3">
                                <label className="form-label">Working Hours</label>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input type="time" className="form-control" value="09:00" />
                                    </div>
                                    <div className="col-6">
                                        <input type="time" className="form-control" value="17:00" />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Working Days</label>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" checked />
                                    <label className="form-check-label">Monday</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" checked />
                                    <label className="form-check-label">Tuesday</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" checked />
                                    <label className="form-check-label">Wednesday</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" checked />
                                    <label className="form-check-label">Thursday</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" checked />
                                    <label className="form-check-label">Friday</label>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Consultation Duration</label>
                                <select className="form-select">
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary w-100">
                                <i className="fas fa-save me-2"></i>Save Schedule
                            </button>
                        </form>
                    </div>
                </div>

                <div className="card mt-3">
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
    );

    const renderMessages = () => (
        <div className="row g-4">
            <div className="col-12">
                <h4>Patient Messages</h4>
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
                                    alt={message.patient}
                                    className="rounded-circle me-3"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{message.patient}</h6>
                                    <p className="mb-0 small text-muted text-truncate">{message.lastMessage}</p>
                                    <small className="text-muted">{message.time}</small>
                                </div>
                                {message.unread && <span className="badge bg-primary rounded-pill">!</span>}
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
                            alt={messages[0].patient}
                            className="rounded-circle me-3"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <div>
                            <h6 className="mb-0">{messages[0].patient}</h6>
                            <small className="text-muted">Last seen: 1 hour ago</small>
                        </div>
                    </div>
                    <div className="card-body" style={{ height: '400px', overflowY: 'auto' }}>
                        <div className="d-flex mb-3">
                            <img
                                src={messages[0].avatar}
                                alt={messages[0].patient}
                                className="rounded-circle me-2"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <div className="bg-light p-2 rounded">
                                <p className="mb-0">Hello Dr. Chen, I hope you're doing well.</p>
                                <small className="text-muted">2:30 PM</small>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mb-3">
                            <div className="bg-primary text-white p-2 rounded">
                                <p className="mb-0">Hello Sarah! How are you feeling today?</p>
                                <small className="text-white-50">2:32 PM</small>
                            </div>
                        </div>
                        <div className="d-flex mb-3">
                            <img
                                src={messages[0].avatar}
                                alt={messages[0].patient}
                                className="rounded-circle me-2"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <div className="bg-light p-2 rounded">
                                <p className="mb-0">{messages[0].lastMessage}</p>
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
        <div className="row g-4">
            <div className="col-12">
                <h4>Analytics & Insights</h4>
            </div>

            {/* Monthly Stats */}
            <div className="col-12">
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="card text-center">
                            <div className="card-body">
                                <i className="fas fa-users fa-2x text-primary mb-3"></i>
                                <h4>342</h4>
                                <p className="text-muted mb-0">Total Patients</p>
                                <small className="text-success">+12% this month</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center">
                            <div className="card-body">
                                <i className="fas fa-calendar-check fa-2x text-success mb-3"></i>
                                <h4>156</h4>
                                <p className="text-muted mb-0">Consultations</p>
                                <small className="text-success">+8% this month</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center">
                            <div className="card-body">
                                <i className="fas fa-star fa-2x text-warning mb-3"></i>
                                <h4>4.8</h4>
                                <p className="text-muted mb-0">Avg Rating</p>
                                <small className="text-success">+0.2 this month</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center">
                            <div className="card-body">
                                <i className="fas fa-dollar-sign fa-2x text-info mb-3"></i>
                                <h4>$12,450</h4>
                                <p className="text-muted mb-0">Revenue</p>
                                <small className="text-success">+15% this month</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="col-lg-8">
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

            <div className="col-lg-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Patient Demographics</h5>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <span>Age 18-30</span>
                                <span>25%</span>
                            </div>
                            <div className="progress">
                                <div className="progress-bar" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <span>Age 31-50</span>
                                <span>40%</span>
                            </div>
                            <div className="progress">
                                <div className="progress-bar bg-success" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <span>Age 51-70</span>
                                <span>30%</span>
                            </div>
                            <div className="progress">
                                <div className="progress-bar bg-warning" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <span>Age 70+</span>
                                <span>5%</span>
                            </div>
                            <div className="progress">
                                <div className="progress-bar bg-danger" style={{ width: '5%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="row g-4">
            <div className="col-12">
                <h4>Doctor Profile</h4>
            </div>

            <div className="col-lg-4">
                <div className="card text-center">
                    <div className="card-body">
                        <img
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
                            alt="Profile"
                            className="rounded-circle mb-3"
                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                        />
                        <h5>{doctorData.name}</h5>
                        <p className="text-muted">{doctorData.specialty}</p>
                        <p className="text-muted">License: {doctorData.license}</p>
                        <div className="d-flex justify-content-center align-items-center mb-3">
                            <div className="me-3">
                <span className="text-warning">
                  {'★'.repeat(Math.floor(doctorData.rating))}
                    {'☆'.repeat(5 - Math.floor(doctorData.rating))}
                </span>
                                <span className="ms-1">{doctorData.rating}</span>
                            </div>
                        </div>
                        <button className="btn btn-outline-primary">
                            <i className="fas fa-camera me-2"></i>Change Photo
                        </button>
                    </div>
                </div>
            </div>

            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Professional Information</h5>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-control" value={doctorData.name} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Specialty</label>
                                    <input type="text" className="form-control" value={doctorData.specialty} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" value={doctorData.email} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone</label>
                                    <input type="tel" className="form-control" value={doctorData.phone} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Medical License</label>
                                    <input type="text" className="form-control" value={doctorData.license} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Years of Experience</label>
                                    <input type="text" className="form-control" value={doctorData.experience} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Bio</label>
                                    <textarea className="form-control" rows="4" placeholder="Write a brief professional bio..."></textarea>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Specializations</label>
                                    <textarea className="form-control" rows="3" placeholder="List your medical specializations and areas of expertise..."></textarea>
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
            case 'patients': return renderPatients();
            case 'schedule': return renderSchedule();
            case 'messages': return renderMessages();
            case 'analytics': return renderAnalytics();
            case 'profile': return renderProfile();
            default: return renderOverview();
        }
    };

    return (
        <div className="App">

        {/* schedule button */}
        <div className="p-6">
            <button
                onClick={handleViewSchedule}
                className="view-schedule"
            >
                View Schedule
            </button>
        </div>
            {/* Dashboard Header */}
            <section className="py-5 mt-5" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h2 className="mb-2">Welcome, {doctorData.name}!</h2>
                            <p className="text-muted mb-0">Manage your patients and appointments efficiently</p>
                        </div>
                        <div className="col-lg-4 text-end">
                            <button className="btn btn-primary me-2">
                                <i className="fas fa-video me-2"></i>Start Consultation
                            </button>
                            <button className="btn btn-outline-primary">
                                <i className="fas fa-calendar-plus me-2"></i>Add Appointment
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
                                className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
                                onClick={() => setActiveTab('patients')}
                            >
                                <i className="fas fa-users me-2"></i>Patients
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                                onClick={() => setActiveTab('schedule')}
                            >
                                <i className="fas fa-calendar-alt me-2"></i>Schedule
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
                                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('analytics')}
                            >
                                <i className="fas fa-chart-line me-2"></i>Analytics
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <i className="fas fa-user-md me-2"></i>Profile
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

export default DoctorDashboard;