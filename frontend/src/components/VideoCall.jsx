import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

const VideoCall = ({ appointmentId, onCallEnd }) => {
    const [peer, setPeer] = useState(null);
    const [myPeerId, setMyPeerId] = useState('');
    const [call, setCall] = useState(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [sessionId, setSessionId] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    // Video refs
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const localStreamRef = useRef();
    const peerRef = useRef();
    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('name');
    const MAX_RETRIES = 3;

    // Initialize PeerJS and video session
    useEffect(() => {
        const initializeVideoCall = async () => {
            try {
                setIsConnecting(true);
                setError('');

                // Create or join video session
                const sessionData = await createVideoSession();
                if (!sessionData) return;

                console.log('Session data received:', sessionData);

                setSessionId(sessionData.session_id);
                setRoomId(sessionData.room_id);

                // Initialize media first
                await initializeMedia();

                // Initialize PeerJS and wait for it to be fully ready
                const peerInstance = await initializePeer(sessionData.room_id);

                // Only proceed with room joining after peer is ready
                if (peerInstance) {
                    console.log('Peer fully initialized, proceeding with room join...');
                    await joinSession(sessionData.session_id, sessionData.room_id);
                }

            } catch (error) {
                console.error('Error initializing video call:', error);
                handleError(`Failed to initialize video call: ${error.message}`);
            }
        };

        if (appointmentId) {
            initializeVideoCall();
        }

        // Cleanup on unmount
        return () => {
            cleanup();
        };
    }, [appointmentId]);

    const createVideoSession = async () => {
        try {
            const token = localStorage.getItem('token');

            // First, check if there's already an active session for this appointment
            const checkResponse = await fetch(`https://mediconnect-7v1m.onrender.com/api/appointments/${appointmentId}/video-session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (checkResponse.ok) {
                const existingSession = await checkResponse.json();
                if (existingSession.exists) {
                    console.log('Joining existing session:', existingSession);
                    return {
                        session_id: existingSession.session_id,
                        room_id: existingSession.room_id,
                        status: existingSession.status
                    };
                }
            }

            // If no existing session, create a new one
            console.log('Creating new video session for appointment:', appointmentId);
            const response = await fetch(`https://mediconnect-7v1m.onrender.com/api/video/session/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ appointment_id: appointmentId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create video session: ${response.status} - ${errorText}`);
            }

            const sessionData = await response.json();
            console.log('New session created:', sessionData);
            return sessionData;
        } catch (error) {
            console.error('Session creation/join failed:', error);
            handleError(`Session creation failed: ${error.message}`);
            return null;
        }
    };

    const initializeMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            console.log('Local media initialized');
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            handleError('Failed to access camera/microphone. Please check permissions.');
            throw error;
        }
    };

    const initializePeer = async (currentRoomId) => {
        try {
            // Generate unique peer ID using the passed roomId
            const peerId = `${currentRoomId}_${userRole}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            console.log(`Initializing peer with ID: ${peerId}`);

            const newPeer = new Peer(peerId, {
                host: 'localhost',
                port: 9001,
                path: '/peerjs',
                key: 'mediconnect',
                secure: false,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:stun3.l.google.com:19302' }
                    ],
                    iceCandidatePoolSize: 10
                },
                debug: 1
            });

            peerRef.current = newPeer;

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Peer connection timeout'));
                }, 15000);

                newPeer.on('open', (id) => {
                    clearTimeout(timeout);
                    console.log('Peer connected with ID: ' + id);
                    setMyPeerId(id);
                    setConnectionStatus('connected');
                    setPeer(newPeer);
                    setIsConnecting(false);

                    // Wait a bit more to ensure peer is fully ready
                    setTimeout(() => {
                        console.log('Peer is fully ready for connections');
                        resolve(newPeer);
                    }, 1000);
                });

                newPeer.on('call', (incomingCall) => {
                    console.log('Receiving call...');
                    handleIncomingCall(incomingCall);
                });

                newPeer.on('disconnected', () => {
                    console.log('Peer disconnected');
                    setConnectionStatus('disconnected');
                    setPeer(null);

                    if (!newPeer.destroyed && retryCount < MAX_RETRIES) {
                        console.log(`Attempting to reconnect... (${retryCount + 1}/${MAX_RETRIES})`);
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                            if (!newPeer.destroyed) {
                                try {
                                    newPeer.reconnect();
                                } catch (reconnectError) {
                                    console.error('Reconnection failed:', reconnectError);
                                    handleError('Connection lost. Please refresh and try again.');
                                }
                            }
                        }, 2000);
                    } else if (retryCount >= MAX_RETRIES) {
                        handleError('Connection lost after multiple attempts. Please refresh and try again.');
                    }
                });

                newPeer.on('error', (err) => {
                    clearTimeout(timeout);
                    console.error('PeerJS error:', err);
                    setConnectionStatus('error');
                    setPeer(null);

                    if (err.type === 'peer-unavailable') {
                        handleError('The other participant is not available. Please wait for them to join.');
                    } else if (err.type === 'network') {
                        handleError('Network error. Please check your internet connection.');
                    } else if (err.type === 'server-error') {
                        handleError('Server error. Please try refreshing the page.');
                    } else {
                        handleError(`Connection error: ${err.message}`);
                    }

                    reject(err);
                });
            });
        } catch (error) {
            handleError(`Peer initialization failed: ${error.message}`);
            throw error;
        }
    };

    const handleIncomingCall = (incomingCall) => {
        if (localStreamRef.current) {
            incomingCall.answer(localStreamRef.current);
            setCall(incomingCall);
            setupCallEventHandlers(incomingCall);
        }
    };

    const setupCallEventHandlers = (callInstance, callTimeout = null) => {
        callInstance.on('stream', (remoteStream) => {
            console.log('Received remote stream - call successful!');
            if (callTimeout) clearTimeout(callTimeout);

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
            setIsCallActive(true);
            setIsConnecting(false);
            setConnectionStatus('In Call');
        });

        callInstance.on('close', () => {
            console.log('Call ended by remote peer');
            if (callTimeout) clearTimeout(callTimeout);
            handleCallEnd();
        });

        callInstance.on('error', (error) => {
            console.error('Call error:', error);
            if (callTimeout) clearTimeout(callTimeout);
            setIsConnecting(false);

            if (error.type === 'peer-unavailable') {
                console.log('Peer unavailable, will retry with discovery...');
                setTimeout(() => {
                    startPeerDiscovery(roomId);
                }, 3000);
            } else {
                handleError(`Call error: ${error.message}`);
            }
        });
    };

    const cleanupStaleParticipants = async (currentRoomId) => {
        if (!currentRoomId || !myPeerId) return;

        try {
            console.log('Cleaning up stale participants...');

            await fetch(`http://localhost:9000/api/rooms/${currentRoomId}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ peerId: myPeerId })
            });

            setTimeout(async () => {
                await registerAndDiscoverPeers(currentRoomId);
            }, 1000);

        } catch (error) {
            console.error('Error cleaning up participants:', error);
        }
    };

    const joinSession = async (sessionId, currentRoomId) => {
        try {
            const token = localStorage.getItem('token');

            console.log(`Joining session ${sessionId} with roomId: ${currentRoomId}`);

            // Join video session in backend
            const response = await fetch(`https://mediconnect-7v1m.onrender.com/api/video/session/${sessionId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('Successfully joined video session');
                if (currentRoomId && myPeerId) {
                    await registerAndDiscoverPeers(currentRoomId);
                } else {
                    console.log('Waiting for peer ID to be available...');
                    setTimeout(() => {
                        if (myPeerId) {
                            registerAndDiscoverPeers(currentRoomId);
                        } else {
                            startPeerDiscovery(currentRoomId);
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error joining session:', error);
            handleError(`Failed to join session: ${error.message}`);
        }
    };

    const registerAndDiscoverPeers = async (currentRoomId) => {
        try {
            if (!currentRoomId) {
                console.error('No roomId provided to registerAndDiscoverPeers');
                return;
            }

            if (!peer || !peer.open || !myPeerId) {
                console.log('Waiting for peer to be ready before registration...');
                setTimeout(() => {
                    if (peer && peer.open && myPeerId) {
                        registerAndDiscoverPeers(currentRoomId);
                    } else {
                        console.error('Peer still not ready, starting discovery as fallback');
                        startPeerDiscovery(currentRoomId);
                    }
                }, 1500);
                return;
            }

            console.log(`Registering with room: ${currentRoomId}, peer: ${myPeerId}`);

            const registrationData = {
                peerId: myPeerId,
                userInfo: {
                    name: userName,
                    role: userRole,
                    appointmentId: appointmentId
                }
            };

            const response = await fetch(`http://localhost:9000/api/rooms/${currentRoomId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Successfully registered with room server:', data);
                setParticipants(data.participants || []);

                const otherParticipants = data.otherParticipants || [];
                console.log(`Found ${otherParticipants.length} other participants:`, otherParticipants);

                if (otherParticipants.length > 0) {
                    const recentParticipants = otherParticipants
                        .filter(p => p.role !== userRole)
                        .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

                    if (userRole === 'patient' && recentParticipants.length > 0) {
                        const doctor = recentParticipants.find(p => p.role === 'doctor');
                        if (doctor) {
                            console.log(`Patient will call doctor: ${doctor.peerId}`);
                            setTimeout(() => {
                                makeCall(doctor.peerId);
                            }, 2000);
                        }
                    } else if (userRole === 'doctor') {
                        console.log('Doctor registered, waiting for patient to initiate call');
                    }
                } else {
                    console.log('No other participants found, starting discovery...');
                    startPeerDiscovery(currentRoomId);
                }
            } else {
                const errorText = await response.text();
                console.error('Failed to register with room server:', response.status, errorText);
                handleError(`Room registration failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Error registering with room server:', error);
            handleError(`Room registration error: ${error.message}`);
        }
    };

    const startPeerDiscovery = (currentRoomId) => {
        if (!currentRoomId) {
            console.error('Cannot start peer discovery without roomId');
            setConnectionStatus('error');
            setError('Room ID not available for peer discovery');
            return;
        }

        console.log(`Starting peer discovery for room: ${currentRoomId}`);

        const discoveryInterval = setInterval(async () => {
            try {
                if (!peer || !peer.open) {
                    console.log('Our peer is not ready during discovery, stopping...');
                    clearInterval(discoveryInterval);
                    return;
                }

                console.log(`Checking room ${currentRoomId} for participants...`);
                const response = await fetch(`http://localhost:9000/api/rooms/${currentRoomId}`);

                if (response.ok) {
                    const roomData = await response.json();
                    console.log('Room data:', roomData);

                    const otherParticipants = roomData.participants?.filter(p =>
                        p.peerId !== myPeerId && p.role !== userRole
                    ) || [];

                    console.log(`Discovery found ${otherParticipants.length} other participants`);

                    if (otherParticipants.length > 0) {
                        clearInterval(discoveryInterval);
                        console.log('Found participants, stopping discovery');

                        if (userRole === 'patient') {
                            const doctor = otherParticipants.find(p => p.role === 'doctor');
                            if (doctor) {
                                console.log(`Found doctor: ${doctor.peerId}, initiating call...`);
                                setTimeout(() => {
                                    makeCall(doctor.peerId);
                                }, 1000);
                            }
                        } else {
                            console.log('Doctor found, waiting for patient to call');
                        }
                    }
                } else {
                    console.error(`Discovery API error: ${response.status}`);
                }
            } catch (error) {
                console.error('Error in peer discovery:', error);
            }
        }, 3000);

        // Stop discovery after 2 minutes
        setTimeout(() => {
            clearInterval(discoveryInterval);
            if (!isCallActive) {
                setConnectionStatus('waiting');
                console.log('Peer discovery timeout - no participants found after 2 minutes');
            }
        }, 120000);
    };

    const makeCall = (targetPeerId, retryCount = 0) => {
        const MAX_CALL_RETRIES = 3;

        const checkPeerReady = () => {
            const isPeerReady = peer && !peer.destroyed && peer.open && myPeerId;
            console.log('Peer readiness check:', {
                hasPeer: !!peer,
                peerDestroyed: peer ? peer.destroyed : 'N/A',
                peerOpen: peer ? peer.open : 'N/A',
                hasMyPeerId: !!myPeerId,
                isReady: isPeerReady
            });
            return isPeerReady;
        };

        if (!checkPeerReady()) {
            console.log('Peer not ready yet, waiting...');

            if (retryCount < MAX_CALL_RETRIES) {
                setTimeout(() => {
                    console.log(`Retrying call to ${targetPeerId} (attempt ${retryCount + 1})`);
                    makeCall(targetPeerId, retryCount + 1);
                }, 2000);
            } else {
                console.error('Peer never became ready after retries');
                handleError('Peer connection not ready. Please refresh and try again.');
            }
            return;
        }

        if (!localStreamRef.current) {
            console.error('No local media stream available');
            handleError('Camera/microphone not available. Please check permissions.');
            return;
        }

        if (!targetPeerId) {
            console.error('No target peer ID provided');
            return;
        }

        if (isCallActive) {
            console.log('Call already active, ignoring new call request');
            return;
        }

        console.log(`Making call to ${targetPeerId} (attempt ${retryCount + 1}/${MAX_CALL_RETRIES + 1})`);
        setIsConnecting(true);

        try {
            const outgoingCall = peer.call(targetPeerId, localStreamRef.current);
            setCall(outgoingCall);

            const callTimeout = setTimeout(() => {
                console.error(`Call timeout for peer ${targetPeerId}`);
                if (outgoingCall && !isCallActive) {
                    outgoingCall.close();

                    if (retryCount < MAX_CALL_RETRIES) {
                        console.log(`Retrying call due to timeout...`);
                        setTimeout(() => {
                            makeCall(targetPeerId, retryCount + 1);
                        }, 2000);
                    } else {
                        console.error(`Max retries reached for peer ${targetPeerId}`);
                        setIsConnecting(false);
                        handleError('Failed to connect after multiple attempts. The other participant may have disconnected.');
                    }
                }
            }, 10000);

            setupCallEventHandlers(outgoingCall, callTimeout);

        } catch (error) {
            console.error('Error making call:', error);
            setIsConnecting(false);

            if (retryCount < MAX_CALL_RETRIES) {
                console.log(`Retrying after error...`);
                setTimeout(() => {
                    makeCall(targetPeerId, retryCount + 1);
                }, 2000);
            } else {
                handleError(`Failed to make call: ${error.message}`);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const handleCallEnd = () => {
        setIsCallActive(false);
        setIsConnecting(false);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    };

    const endCall = async () => {
        try {
            if (call) {
                call.close();
                setCall(null);
            }

            if (myPeerId && roomId) {
                try {
                    await fetch(`http://localhost:9000/api/rooms/${roomId}/leave`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ peerId: myPeerId })
                    });
                } catch (error) {
                    console.error('Error unregistering from room server:', error);
                }
            }

            if (sessionId) {
                const token = localStorage.getItem('token');
                await fetch(`https://mediconnect-7v1m.onrender.com/api/video/session/${sessionId}/end`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            cleanup();

            if (onCallEnd) {
                onCallEnd();
            }
        } catch (error) {
            console.error('Error ending call:', error);
        }
    };

    const cleanup = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        if (peerRef.current && !peerRef.current.destroyed) {
            peerRef.current.destroy();
        }

        setIsCallActive(false);
        setConnectionStatus('disconnected');
        setPeer(null);
    };

    const handleError = (errorMessage) => {
        setError(errorMessage);
        setIsConnecting(false);
        setConnectionStatus('error');
    };

    const getConnectionStatusDisplay = () => {
        switch (connectionStatus) {
            case 'connected':
                return isCallActive ? 'In Call' : 'Connected - Waiting for other participant';
            case 'connecting':
                return 'Connecting...';
            case 'error':
                return 'Connection Error';
            case 'waiting':
                return 'Waiting for participants';
            default:
                return 'Disconnected';
        }
    };

    return (
        <div className="video-call-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#1a1a1a',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div className="video-call-header" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h5 className="mb-0">Medical Consultation</h5>
                    <small className="opacity-75">
                        {getConnectionStatusDisplay()}
                    </small>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-white text-dark px-3 py-2">
                        Room: {roomId || 'Loading...'}
                    </span>
                    {participants.length > 0 && (
                        <span className="badge bg-success text-white px-3 py-2">
                            {participants.length} participant{participants.length !== 1 ? 's' : ''}
                        </span>
                    )}
                    <button
                        className="btn btn-danger"
                        onClick={endCall}
                        style={{ borderRadius: '20px' }}
                    >
                        <i className="fas fa-phone-slash me-2"></i>
                        End Call
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger m-3" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button
                        className="btn btn-sm btn-outline-danger ms-3"
                        onClick={() => window.location.reload()}
                    >
                        Reload
                    </button>
                </div>
            )}

            {/* Video Area */}
            <div className="video-area flex-grow-1 position-relative p-3">
                <div className="remote-video-container" style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {isCallActive ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <div className="text-center text-white">
                            {isConnecting ? (
                                <>
                                    <div className="spinner-border mb-3" role="status"></div>
                                    <p>Connecting to video call...</p>
                                    <small className="text-muted">This may take a few moments</small>
                                </>
                            ) : connectionStatus === 'error' ? (
                                <>
                                    <i className="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
                                    <p>Connection failed</p>
                                    <button
                                        className="btn btn-primary mt-3"
                                        onClick={() => window.location.reload()}
                                    >
                                        <i className="fas fa-redo me-2"></i>Retry Connection
                                    </button>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-user-circle fa-5x mb-3 opacity-50"></i>
                                    <p>Waiting for other participant to join...</p>
                                    <small className="text-muted">
                                        Share the room ID: <strong>{roomId}</strong>
                                    </small>
                                </>
                            )}
                        </div>
                    )}

                    {/* Local Video (Picture-in-Picture) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '120px',
                        right: '20px',
                        width: '200px',
                        height: '150px',
                        backgroundColor: '#3a3a3a',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '2px solid #fff'
                    }}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: 'scaleX(-1)'
                            }}
                        />
                        {!isVideoEnabled && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <i className="fas fa-video-slash fa-2x"></i>
                            </div>
                        )}
                        <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '5px',
                            color: 'white',
                            fontSize: '0.8rem',
                            background: 'rgba(0,0,0,0.5)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}>
                            You ({userRole})
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls - Only Camera and Microphone */}
            <div className="video-controls" style={{
                padding: '2rem',
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem'
            }}>
                <button
                    className={`btn ${isVideoEnabled ? 'btn-secondary' : 'btn-danger'} rounded-circle`}
                    onClick={toggleVideo}
                    style={{ width: '60px', height: '60px' }}
                    title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    <i className={`fas ${isVideoEnabled ? 'fa-video' : 'fa-video-slash'} fa-lg`}></i>
                </button>

                <button
                    className={`btn ${isAudioEnabled ? 'btn-secondary' : 'btn-danger'} rounded-circle`}
                    onClick={toggleAudio}
                    style={{ width: '60px', height: '60px' }}
                    title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                    <i className={`fas ${isAudioEnabled ? 'fa-microphone' : 'fa-microphone-slash'} fa-lg`}></i>
                </button>
            </div>

            {/* Connection Info */}
            <div style={{
                position: 'absolute',
                top: '100px',
                left: '20px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.8rem'
            }}>
                <div>Status: {connectionStatus}</div>
                <div>My ID: {myPeerId || 'Generating...'}</div>
                <div>Room: {roomId}</div>
                <div>Participants: {participants.length}</div>
                {isCallActive && <div className="text-success">Call Active</div>}
            </div>
        </div>
    );
};

export default VideoCall;