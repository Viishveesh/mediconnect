import React, { useState } from 'react';
import LogOut from '../auth/LogOut.jsx';
import { useMessages } from '../../hooks/useMessages';
import { messageService } from '../../services/messageService';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const {
        conversations,
        activeConversation,
        messages,
        loading,
        error,
        sendMessage,
        uploadImage,
        selectConversation,
        getUnreadCount,
        clearError
    } = useMessages();
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);

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

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check image type
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only images (PNG, JPG, GIF) are allowed');
                return;
            }
            
            // Check file size (16MB max)
            if (file.size > 16 * 1024 * 1024) {
                alert('Image size must be less than 16MB');
                return;
            }
            
            setSelectedImage(file);
        }
    };

    // Handle message sending
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || !activeConversation) return;
        
        setUploading(true);
        try {
            let imageAttachment = null;
            
            // Upload image first if selected
            if (selectedImage) {
                const uploadResult = await uploadImage(selectedImage);
                if (uploadResult) {
                    imageAttachment = uploadResult;
                }
            }
            
            const success = await sendMessage(
                activeConversation.conversation_id, 
                newMessage, 
                activeConversation.other_user_email,
                imageAttachment
            );
            
            if (success) {
                setNewMessage('');
                setSelectedImage(null);
                // Reset file input
                const imageInput = document.getElementById('doctor-image-input');
                if (imageInput) imageInput.value = '';
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setUploading(false);
        }
    };

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
                                <h3 className="mb-1 fw-bold">{doctorData.totalPatients}</h3>
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
                                <h3 className="mb-1 fw-bold">{getUnreadCount()}</h3>
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
                                <h3 className="mb-1 fw-bold">{doctorData.rating}</h3>
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
                                {loading ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        <p className="small text-muted mt-2">Loading messages...</p>
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="text-center py-3">
                                        <p className="text-muted">No conversations yet</p>
                                    </div>
                                ) : (
                                    conversations.slice(0, 3).map(conversation => (
                                        <div key={conversation.id} className={`d-flex align-items-start message-item p-3 rounded mb-2`} style={{
                                            background: conversation.unread_count > 0 ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' : 'transparent',
                                            borderRadius: '12px',
                                            border: conversation.unread_count > 0 ? '1px solid rgba(102, 126, 234, 0.1)' : '1px solid transparent',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            selectConversation(conversation);
                                            setActiveTab('messages');
                                        }}>
                                            <div className="rounded-circle me-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{
                                                width: '35px',
                                                height: '35px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white'
                                            }}>
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div className="flex-grow-1 min-w-0" style={{ width: '0', overflow: 'hidden' }}>
                                                <h6 className="mb-1 fs-6 fw-semibold">{conversation.other_user_name}</h6>
                                                <p className="mb-1 small text-muted" style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    width: '100%'
                                                }}>
                                                    {conversation.last_message || 'Start a conversation'}
                                                </p>
                                                <small className="text-muted">
                                                    {messageService.formatTime(conversation.last_message_time)}
                                                </small>
                                            </div>
                                            {conversation.unread_count > 0 && (
                                                <span className="flex-shrink-0" style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%'
                                                }}></span>
                                            )}
                                        </div>
                                    ))
                                )}
                                <button 
                                    className="btn btn-sm w-100 mt-3 fw-semibold" 
                                    onClick={() => setActiveTab('messages')}
                                    style={{
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
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button type="button" className="btn-close" onClick={() => clearError()}></button>
                    </div>
                )}
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
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border" role="status"></div>
                                <p className="text-muted mt-2">Loading conversations...</p>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-4">
                                <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                                <p className="text-muted">No conversations yet</p>
                                <small className="text-muted">Messages with patients will appear here</small>
                            </div>
                        ) : (
                            conversations.map(conversation => (
                                <div 
                                    key={conversation.id} 
                                    className={`d-flex align-items-center p-3 border-bottom ${activeConversation?.id === conversation.id ? 'bg-primary-subtle' : ''}`} 
                                    style={{ 
                                        cursor: 'pointer',
                                        background: conversation.unread_count > 0 && activeConversation?.id !== conversation.id ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' : undefined
                                    }}
                                    onClick={() => selectConversation(conversation)}
                                >
                                    <div className="rounded-circle me-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{
                                        width: '50px',
                                        height: '50px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white'
                                    }}>
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div className="flex-grow-1 min-w-0" style={{ width: '0', overflow: 'hidden' }}>
                                        <h6 className="mb-1 fw-semibold">{conversation.other_user_name}</h6>
                                        <p className="mb-0 small text-muted" style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            width: '100%'
                                        }}>
                                            {conversation.last_message || 'Start a conversation'}
                                        </p>
                                        <small className="text-muted">
                                            {messageService.formatTime(conversation.last_message_time)}
                                        </small>
                                    </div>
                                    {conversation.unread_count > 0 && (
                                        <span className="badge bg-primary rounded-pill">{conversation.unread_count}</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="col-12 col-lg-8">
                <div className="card h-100" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    {activeConversation ? (
                        <>
                            <div className="card-header d-flex align-items-center" style={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                borderRadius: '20px 20px 0 0',
                                border: 'none',
                                padding: '1.5rem'
                            }}>
                                <div className="rounded-circle me-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                }}>
                                    <i className="fas fa-user"></i>
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold text-dark">{activeConversation.other_user_name}</h6>
                                    <small className="text-success">{activeConversation.other_user_role}</small>
                                </div>
                            </div>
                            <div className="card-body" style={{ height: '400px', overflowY: 'auto' }}>
                                {loading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border" role="status"></div>
                                        <p className="text-muted mt-2">Loading messages...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-4">
                                        <i className="fas fa-comment fa-3x text-muted mb-3"></i>
                                        <p className="text-muted">No messages yet</p>
                                        <small className="text-muted">Start the conversation by sending a message</small>
                                    </div>
                                ) : (
                                    messages.map(message => {
                                        const isCurrentUser = message.sender_email === localStorage.getItem('userEmail') || message.sender_role === 'doctor';
                                        return (
                                            <div key={message.id} className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : ''}`}>
                                                {!isCurrentUser && (
                                                    <div className="rounded-circle me-2 flex-shrink-0 d-flex align-items-center justify-content-center" style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: 'white',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        <i className="fas fa-user"></i>
                                                    </div>
                                                )}
                                                <div className={`p-2 rounded ${isCurrentUser ? 'text-white' : 'bg-light'}`} style={{
                                                    background: isCurrentUser ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                                                    maxWidth: '70%'
                                                }}>
                                                    {/* Text message */}
                                                    {message.message && (
                                                        <p className="mb-1 small">
                                                            {typeof message.message === 'string' 
                                                                ? message.message 
                                                                : '[Invalid Message]'
                                                            }
                                                        </p>
                                                    )}
                                                    
                                                    {/* Image attachment */}
                                                    {message.image_attachment && (
                                                        <div className="mb-1">
                                                            <img 
                                                                src={`http://localhost:5000/api/files/${message.image_attachment.file_id}`}
                                                                alt={message.image_attachment.original_name}
                                                                style={{ 
                                                                    maxWidth: '200px', 
                                                                    maxHeight: '200px', 
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => window.open(`http://localhost:5000/api/files/${message.image_attachment.file_id}`, '_blank')}
                                                            />
                                                            <br />
                                                            <small className={isCurrentUser ? 'text-white-50' : 'text-muted'}>
                                                                {message.image_attachment.original_name}
                                                            </small>
                                                        </div>
                                                    )}
                                                    
                                                    <small className={isCurrentUser ? 'text-white-50' : 'text-muted'}>
                                                        {messageService.formatMessageTime(message.timestamp)}
                                                    </small>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="card-footer" style={{ background: 'white', borderRadius: '0 0 20px 20px' }}>
                                <form onSubmit={handleSendMessage}>
                                    {selectedImage && (
                                        <div className="mb-2 p-2 bg-light rounded">
                                            <small className="text-muted">
                                                🖼️ {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-link text-danger p-0 ms-2"
                                                    onClick={() => {
                                                        setSelectedImage(null);
                                                        document.getElementById('doctor-image-input').value = '';
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </small>
                                        </div>
                                    )}
                                    <div className="input-group">
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Type your response..." 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <input
                                            type="file"
                                            id="doctor-image-input"
                                            accept=".png,.jpg,.jpeg,.gif"
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <button 
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => document.getElementById('doctor-image-input').click()}
                                            title="Attach image"
                                        >
                                            🖼️
                                        </button>
                                        <button 
                                            type="submit"
                                            className="btn text-white" 
                                            disabled={(!newMessage.trim() && !selectedImage) || loading || uploading}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none'
                                            }}
                                        >
                                            {uploading ? (
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                            ) : (
                                                <i className="fas fa-paper-plane"></i>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="card-body d-flex align-items-center justify-content-center" style={{ height: '500px' }}>
                            <div className="text-center">
                                <i className="fas fa-comments fa-4x text-muted mb-3"></i>
                                <h5 className="text-muted">Select a conversation</h5>
                                <p className="text-muted">Choose a conversation from the left to start messaging</p>
                            </div>
                        </div>
                    )}
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

            <div className="col-12 col-lg-4">
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
                        <p className="text-muted small">License: {doctorData.license}</p>
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

            <div className="col-12 col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Professional Information</h5>
                    </div>
                    <div className="card-body">
                        <div>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-control" defaultValue={doctorData.name} />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Specialty</label>
                                    <input type="text" className="form-control" defaultValue={doctorData.specialty} />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" defaultValue={doctorData.email} />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Phone</label>
                                    <input type="tel" className="form-control" defaultValue={doctorData.phone} />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Medical License</label>
                                    <input type="text" className="form-control" defaultValue={doctorData.license} />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Years of Experience</label>
                                    <input type="text" className="form-control" defaultValue={doctorData.experience} />
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
                                    <button type="button" className="btn btn-primary">
                                        <i className="fas fa-save me-2"></i>Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
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
                                    <h1 className="h3 mb-1 fw-bold text-white">Welcome, {doctorData.name}!</h1>
                                    <p className="text-white-50 mb-0 small">Manage your patients and appointments efficiently</p>
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
                            { id: 'messages', icon: 'fa-comments', label: 'Messages', badge: getUnreadCount(), color: '#fa709a' },
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
                                {tab.badge && tab.badge > 0 ? (
                                    <span 
                                        className="position-absolute badge rounded-pill text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                                            fontSize: '0.75rem',
                                            padding: '4px 8px',
                                            top: '4px',
                                            right: '4px',
                                            minWidth: '18px',
                                            height: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            border: '2px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            zIndex: 10
                                        }}
                                    >
                                        {tab.badge}
                                    </span>
                                ) : null}
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