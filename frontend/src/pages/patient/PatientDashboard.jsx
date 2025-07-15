import { useState, useEffect } from 'react';
import axios from 'axios';
import LogOut from '../auth/LogOut.jsx';
import PatientProfile from './PatientProfile.jsx';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../hooks/useMessages';
import { messageService } from '../../services/messageService';


const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [patientName, setPatientName] = useState('Patient');
    const [patientProfile, setPatientProfile] = useState(null);
    const navigate = useNavigate();
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

    useEffect(() => {
        // Get patient's name from localStorage
        const name = localStorage.getItem('name');
        if (name) {
            setPatientName(name);
        }
        
        // Fetch patient profile
        fetchPatientProfile();
    }, []);

    const fetchPatientProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/patient/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatientProfile(response.data);
        } catch (error) {
            console.error('Error fetching patient profile:', error);
        }
    };

    // Dynamic patient data
    const patientData = {
        name: patientName,
        email: patientProfile?.email || localStorage.getItem('email') || "Not specified",
        phone: patientProfile?.contactNumber || "Not specified",
        dateOfBirth: patientProfile?.dateOfBirth || "Not specified",
        bloodType: patientProfile?.bloodGroup || "Not specified",
        emergencyContact: patientProfile?.emergencyContact || "Not specified"
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

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Selected image:', file.name, 'Type:', file.type, 'Size:', file.size);
            
            // Check image type
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert(`File type "${file.type}" not allowed. Only images (PNG, JPG, GIF) are allowed`);
                return;
            }
            
            // Check file size (16MB max)
            if (file.size > 16 * 1024 * 1024) {
                alert('Image size must be less than 16MB');
                return;
            }
            
            console.log('Image validation passed, setting selected image');
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
                console.log('Uploading image:', selectedImage.name, selectedImage.type);
                const uploadResult = await uploadImage(selectedImage);
                console.log('Upload result:', uploadResult);
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
                const imageInput = document.getElementById('image-input');
                if (imageInput) imageInput.value = '';
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setUploading(false);
        }
    };

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
                                        width: '40px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white'
                                    }}>
                                        <i className="fas fa-user-md"></i>
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
                                <small className="text-muted">Messages with doctors will appear here</small>
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
                                        <i className="fas fa-user-md"></i>
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
                                    <i className="fas fa-user-md"></i>
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
                                        const isCurrentUser = message.sender_email === localStorage.getItem('userEmail') || message.sender_role === 'patient';
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
                                                        <i className="fas fa-user-md"></i>
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
                                                        document.getElementById('image-input').value = '';
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
                                            placeholder="Type your message..." 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            style={{ borderRadius: '10px 0 0 0' }} 
                                        />
                                        <input
                                            type="file"
                                            id="image-input"
                                            accept=".png,.jpg,.jpeg,.gif"
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <button 
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => document.getElementById('image-input').click()}
                                            title="Attach image"
                                            style={{ borderRadius: '0' }}
                                        >
                                            🖼️
                                        </button>
                                        <button 
                                            type="submit"
                                            className="btn text-white" 
                                            disabled={(!newMessage.trim() && !selectedImage) || loading || uploading}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                borderRadius: '0 10px 10px 0'
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

    const renderProfile = () => (
        <div className="row g-3 g-md-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                    <h4>My Profile</h4>
                    <LogOut />
                </div>
            </div>
            <div className="col-12">
                <PatientProfile />
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
                            { id: 'messages', icon: 'fa-comments', label: 'Messages', badge: getUnreadCount(), color: '#fa709a' },
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

export default PatientDashboard;