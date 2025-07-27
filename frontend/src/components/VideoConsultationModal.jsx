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
    const [permissionsChecked, setPermissionsChecked] = useState(false);
    const [mediaPermissions, setMediaPermissions] = useState({
        camera: false,
        microphone: false
    });
    const [systemCheck, setSystemCheck] = useState({
        webrtc: false,
        browser: false,
        connection: false
    });

    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('name');

    useEffect(() => {
        if (isOpen && appointmentId) {
            checkExistingSession();
            performSystemCheck();
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

    const performSystemCheck = async () => {
        try {
            // Check WebRTC support
            const webrtcSupported = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);

            // Check browser compatibility
            const browserSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

            // Check internet connection
            const connectionGood = navigator.onLine;

            setSystemCheck({
                webrtc: webrtcSupported,
                browser: browserSupported,
                connection: connectionGood
            });

            if (webrtcSupported && browserSupported && connectionGood) {
                await checkMediaPermissions();
            }
        } catch (error) {
            console.error('System check failed:', error);
        }
    };

    const checkMediaPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setMediaPermissions({
                camera: true,
                microphone: true
            });

            setPermissionsChecked(true);

            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('Media permissions check failed:', error);

            // Try to get individual permissions
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setMediaPermissions(prev => ({ ...prev, camera: true }));
                videoStream.getTracks().forEach(track => track.stop());
            } catch (videoError) {
                setMediaPermissions(prev => ({ ...prev, camera: false }));
            }

            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setMediaPermissions(prev => ({ ...prev, microphone: true }));
                audioStream.getTracks().forEach(track => track.stop());
            } catch (audioError) {
                setMediaPermissions(prev => ({ ...prev, microphone: false }));
            }

            setPermissionsChecked(true);
        }
    };

    const startVideoConsultation = async () => {
        if (!systemCheck.webrtc || !systemCheck.browser) {
            setError('Your browser does not support video calls. Please use Chrome, Firefox, Safari, or Edge.');
            return;
        }

        if (!mediaPermissions.camera && !mediaPermissions.microphone) {
            setError('Camera and microphone access required for video consultation.');
            return;
        }

        setShowVideoCall(true);
    };

    const endVideoConsultation = () => {
        setShowVideoCall(false);
        onClose();
    };

    const getSystemStatus = () => {
        const issues = [];

        if (!systemCheck.webrtc) issues.push('WebRTC not supported');
        if (!systemCheck.browser) issues.push('Browser not compatible');
        if (!systemCheck.connection) issues.push('No internet connection');
        if (!mediaPermissions.camera) issues.push('Camera access denied');
        if (!mediaPermissions.microphone) issues.push('Microphone access denied');

        return {
            hasIssues: issues.length > 0,
            issues,
            isReady: systemCheck.webrtc && systemCheck.browser && systemCheck.connection && (mediaPermissions.camera || mediaPermissions.microphone)
        };
    };

    const systemStatus = getSystemStatus();

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

                                {/* System Check */}
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fas fa-desktop me-2"></i>
                                            System Compatibility Check
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className={`fas fa-${systemCheck.browser ? 'check text-success' : 'times text-danger'} me-2`}></i>
                                                    <span>Browser compatibility</span>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className={`fas fa-${systemCheck.webrtc ? 'check text-success' : 'times text-danger'} me-2`}></i>
                                                    <span>WebRTC support</span>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className={`fas fa-${systemCheck.connection ? 'check text-success' : 'times text-danger'} me-2`}></i>
                                                    <span>Internet connection</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className={`fas fa-${mediaPermissions.camera ? 'check text-success' : 'times text-danger'} me-2`}></i>
                                                    <span>Camera access</span>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className={`fas fa-${mediaPermissions.microphone ? 'check text-success' : 'times text-danger'} me-2`}></i>
                                                    <span>Microphone access</span>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className={`fas fa-${permissionsChecked ? 'check text-success' : 'clock text-warning'} me-2`}></i>
                                                    <span>Permissions {permissionsChecked ? 'checked' : 'checking...'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {systemStatus.hasIssues && (
                                            <div className="alert alert-warning mt-3">
                                                <h6 className="alert-heading">
                                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                                    Issues Detected
                                                </h6>
                                                <ul className="mb-0">
                                                    {systemStatus.issues.map((issue, index) => (
                                                        <li key={index}>{issue}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>



                                {/* Browser Support Info */}
                                <div className="alert alert-info">
                                    <h6 className="alert-heading">
                                        <i className="fas fa-info-circle me-2"></i>
                                        Browser Requirements
                                    </h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <ul className="mb-0">
                                                <li>Chrome 70+ (Recommended)</li>
                                                <li>Firefox 65+</li>
                                                <li>Safari 14+</li>
                                            </ul>
                                        </div>
                                        <div className="col-md-6">
                                            <ul className="mb-0">
                                                <li>Edge 80+</li>
                                                <li>WebRTC support required</li>
                                                <li>Minimum 1 Mbps internet</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Troubleshooting */}
                                {!systemStatus.isReady && (
                                    <div className="alert alert-warning">
                                        <h6 className="alert-heading">
                                            <i className="fas fa-tools me-2"></i>
                                            Troubleshooting
                                        </h6>
                                        <ul className="mb-0">
                                            <li>Ensure your browser has camera/microphone permissions</li>
                                            <li>Close other applications using camera/microphone</li>
                                            <li>Try refreshing the page</li>
                                            <li>Check your internet connection</li>
                                            <li>Use an incognito/private browsing window</li>
                                        </ul>
                                    </div>
                                )}
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
                                onClick={checkMediaPermissions}
                                disabled={loading}
                            >
                                <i className="fas fa-redo me-2"></i>
                                Recheck System
                            </button>
                            <button
                                type="button"
                                className="btn text-white"
                                onClick={startVideoConsultation}
                                disabled={loading || !systemStatus.isReady}
                                style={{
                                    background: systemStatus.isReady
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : '#6c757d',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 24px'
                                }}
                            >
                                <i className="fas fa-video me-2"></i>
                                {systemStatus.isReady
                                    ? (sessionStatus?.exists ? 'Join Consultation' : 'Start Consultation')
                                    : 'System Check Required'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoConsultationModal;

