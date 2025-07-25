import React, { useState, useEffect } from 'react';
import VideoCall from './VideoCall';

const VideoConsultationModal = ({
                                    isOpen,
                                    onClose,
                                    appointmentId,
                                    appointmentData
                                }) => {
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [sessionStatus, setSessionStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('name');

    useEffect(() => {
        if (isOpen && appointmentId) {
            checkExistingSession();
        }
    }, [isOpen, appointmentId]);

    const checkExistingSession = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/video-session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSessionStatus(data);
            }
        } catch (error) {
            console.error('Error checking session:', error);
            setError('Failed to check session status');
        } finally {
            setLoading(false);
        }
    };

    const startVideoConsultation = () => {
        setShowVideoCall(true);
    };

    const endVideoConsultation = () => {
        setShowVideoCall(false);
        onClose();
    };

    if (!isOpen) return null;

    if (showVideoCall) {
        return (
            <VideoCall
                appointmentId={appointmentId}
                onCallEnd={endVideoConsultation}
            />
        );
    }

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    {/* Header */}
                    <div className="modal-header" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '1.5rem 2rem'
                    }}>
                        <div>
                            <h4 className="modal-title mb-1">Video Consultation</h4>
                            <small className="opacity-75">
                                {appointmentData?.doctor_name || appointmentData?.patient_name || 'Medical Appointment'}
                            </small>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                            style={{ fontSize: '1.2rem' }}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary mb-3" role="status"></div>
                                <p>Checking session status...</p>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger" role="alert">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        ) : (
                            <>
                                {/* Appointment Info */}
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <div className="card bg-light h-100">
                                            <div className="card-body">
                                                <h6 className="card-title">
                                                    <i className="fas fa-calendar me-2 text-primary"></i>
                                                    Appointment Details
                                                </h6>
                                                {appointmentData && (
                                                    <div>
                                                        <p className="mb-1">
                                                            <strong>Date:</strong> {appointmentData.date}
                                                        </p>
                                                        <p className="mb-1">
                                                            <strong>Time:</strong> {appointmentData.time}
                                                        </p>
                                                        <p className="mb-0">
                                                            <strong>
                                                                {userRole === 'doctor' ? 'Patient:' : 'Doctor:'}
                                                            </strong> {
                                                            userRole === 'doctor'
                                                                ? appointmentData.patient_name
                                                                : appointmentData.doctor_name
                                                        }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card bg-light h-100">
                                            <div className="card-body">
                                                <h6 className="card-title">
                                                    <i className="fas fa-video me-2 text-success"></i>
                                                    Session Status
                                                </h6>
                                                <div>
                                                    {sessionStatus?.exists ? (
                                                        <div>
                                                            <p className="mb-1 text-success">
                                                                <i className="fas fa-check-circle me-1"></i>
                                                                Active session found
                                                            </p>
                                                            <p className="mb-1">
                                                                <strong>Participants:</strong> {sessionStatus.participants?.length || 0}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="mb-1 text-muted">
                                                            <i className="fas fa-info-circle me-1"></i>
                                                            No active session
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pre-consultation Checklist */}
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-clipboard-check me-2"></i>
                                            Pre-Consultation Checklist
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" defaultChecked />
                                                    <label className="form-check-label">
                                                        Camera and microphone permissions granted
                                                    </label>
                                                </div>
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" defaultChecked />
                                                    <label className="form-check-label">
                                                        Stable internet connection verified
                                                    </label>
                                                </div>
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" />
                                                    <label className="form-check-label">
                                                        Medical documents prepared
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" />
                                                    <label className="form-check-label">
                                                        Quiet environment secured
                                                    </label>
                                                </div>
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" />
                                                    <label className="form-check-label">
                                                        List of symptoms/questions ready
                                                    </label>
                                                </div>
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" />
                                                    <label className="form-check-label">
                                                        Privacy ensured (others won't interrupt)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* System Requirements */}
                                <div className="alert alert-info">
                                    <h6 className="alert-heading">
                                        <i className="fas fa-info-circle me-2"></i>
                                        System Requirements
                                    </h6>
                                    <ul className="mb-0">
                                        <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                                        <li>Stable internet connection (minimum 1 Mbps)</li>
                                        <li>Camera and microphone access</li>
                                        <li>WebRTC support (enabled by default in most browsers)</li>
                                    </ul>
                                </div>

                                {/* Technical Note for Demo */}
                                <div className="alert alert-warning">
                                    <h6 className="alert-heading">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        Demo Note
                                    </h6>
                                    <p className="mb-0">
                                        This is a demonstration of the video consultation feature. In a production environment,
                                        this would connect you with the actual healthcare provider. For the demo, you can
                                        simulate the connection to see the video interface.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-between p-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                        >
                            <i className="fas fa-times me-2"></i>
                            Cancel
                        </button>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => window.open('https://support.zoom.us/hc/en-us/articles/201362153-System-requirements-for-Windows-macOS-and-Linux', '_blank')}
                            >
                                <i className="fas fa-question-circle me-2"></i>
                                Help
                            </button>
                            <button
                                type="button"
                                className="btn text-white"
                                onClick={startVideoConsultation}
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 24px'
                                }}
                            >
                                <i className="fas fa-video me-2"></i>
                                {sessionStatus?.exists ? 'Join Consultation' : 'Start Consultation'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoConsultationModal;