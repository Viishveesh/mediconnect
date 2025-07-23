import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

const VideoCall = ({ appointmentId, onCallEnd }) => {
    const [peer, setPeer] = useState(null);
    const [myPeerId, setMyPeerId] = useState('');
    const [remotePeerId, setRemotePeerId] = useState('');
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

    // Video refs
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const localStreamRef = useRef();
    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('name');

    // Initialize PeerJS and video session
    useEffect(() => {
        const initializeVideoCall = async () => {
            try {
                setIsConnecting(true);
                setError('');

                // Create or join video session
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/video/session/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ appointment_id: appointmentId })
                });

                if (!response.ok) {
                    throw new Error('Failed to create video session');
                }

                const sessionData = await response.json();
                setSessionId(sessionData.session_id);
                setRoomId(sessionData.room_id);

                // Initialize PeerJS with custom server
                const peerId = `${sessionData.room_id}_${userRole}_${Date.now()}`;
                const newPeer = new Peer(peerId, {
                    host: 'localhost',
                    port: 9001, // Updated port for PeerJS server
                    path: '/peerjs',
                    secure: false, // Set to true in production with HTTPS
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' }
                        ]
                    },
                    debug: 2
                });

                newPeer.on('open', (id) => {
                    console.log('My peer ID is: ' + id);
                    setMyPeerId(id);
                    setConnectionStatus('connected');
                    initializeMedia();
                });

                newPeer.on('call', (incomingCall) => {
                    console.log('Receiving call...');
                    if (localStreamRef.current) {
                        incomingCall.answer(localStreamRef.current);
                        setCall(incomingCall);

                        incomingCall.on('stream', (remoteStream) => {
                            console.log('Received remote stream');
                            if (remoteVideoRef.current) {
                                remoteVideoRef.current.srcObject = remoteStream;
                            }
                            setIsCallActive(true);
                        });

                        incomingCall.on('close', () => {
                            console.log('Call ended by remote peer');
                            endCall();
                        });
                    }
                });

                newPeer.on('disconnected', () => {
                    console.log('Peer disconnected');
                    setConnectionStatus('disconnected');
                });

                newPeer.on('error', (err) => {
                    console.error('PeerJS error:', err);
                    setError(`Connection error: ${err.message}`);
                    setConnectionStatus('error');
                });

                setPeer(newPeer);

                // Join the session
                await joinSession(sessionData.session_id);

            } catch (error) {
                console.error('Error initializing video call:', error);
                setError(`Failed to initialize video call: ${error.message}`);
                setIsConnecting(false);
            }
        };

        if (appointmentId) {
            initializeVideoCall();
        }

        // Cleanup on unmount
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peer) {
                peer.destroy();
            }
        };
    }, [appointmentId]);

    const initializeMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setIsConnecting(false);
            console.log('Local media initialized');
        } catch (error) {
            console.error('Error accessing media devices:', error);
            setError('Failed to access camera/microphone');
            setIsConnecting(false);
        }
    };

    const joinSession = async (sessionId) => {
        try {
            const token = localStorage.getItem('token');

            // Join video session in backend
            const response = await fetch(`http://localhost:5000/api/video/session/${sessionId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('Successfully joined video session');

                // Register with PeerJS server
                await registerWithPeerServer();

                // Start peer discovery
                setTimeout(() => {
                    discoverPeers();
                }, 2000);
            }
        } catch (error) {
            console.error('Error joining session:', error);
        }
    };

    const registerWithPeerServer = async () => {
        try {
            // Register this peer with our custom PeerJS server
            const response = await fetch(`http://localhost:9000/api/rooms/${roomId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    peerId: myPeerId,
                    userInfo: {
                        name: userName,
                        role: userRole,
                        appointmentId: appointmentId
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Registered with PeerJS server:', data);

                // Try to connect to other participants
                if (data.otherParticipants && data.otherParticipants.length > 0) {
                    const otherPeer = data.otherParticipants[0]; // Connect to first available peer
                    if (userRole === 'patient') {
                        // Patient initiates the call
                        makeCall(otherPeer.peerId);
                    }
                }
            }
        } catch (error) {
            console.error('Error registering with PeerJS server:', error);
        }
    };

    const discoverPeers = async () => {
        try {
            // Get room information from PeerJS server
            const response = await fetch(`http://localhost:9000/api/rooms/${roomId}`);

            if (response.ok) {
                const roomData = await response.json();
                console.log('Room data:', roomData);

                // Find other participants
                const otherParticipants = roomData.participants.filter(p =>
                    p.name !== userName && p.role !== userRole
                );

                if (otherParticipants.length > 0) {
                    console.log('Found other participants:', otherParticipants);

                    // If we're a patient, initiate the call
                    if (userRole === 'patient' && otherParticipants.some(p => p.role === 'doctor')) {
                        const doctor = otherParticipants.find(p => p.role === 'doctor');
                        if (doctor) {
                            // Find the doctor's peer ID (would need to be stored/retrieved properly)
                            // For now, we'll construct it based on the pattern
                            const doctorPeerId = `${roomId}_doctor_${doctor.joinedAt?.replace(/[^\d]/g, '')}`;
                            setTimeout(() => makeCall(doctorPeerId), 1000);
                        }
                    }
                } else {
                    console.log('No other participants found, waiting...');
                    // Retry peer discovery after a delay
                    setTimeout(discoverPeers, 5000);
                }
            }
        } catch (error) {
            console.error('Error discovering peers:', error);
            // Fallback to simulation for demo
            simulatePeerDiscovery();
        }
    };

    const simulatePeerDiscovery = () => {
        console.log('Using simulated peer discovery for demo...');

        if (userRole === 'doctor') {
            console.log('Doctor waiting for patient connection...');
        } else {
            console.log('Patient looking for doctor...');
            // For demo, automatically "find" a doctor after delay
            setTimeout(() => {
                console.log('Simulated: Found doctor peer');
                // In demo mode, we'll just mark as connected
                setConnectionStatus('ready');
            }, 3000);
        }
    };

    const makeCall = (targetPeerId) => {
        if (peer && localStreamRef.current && targetPeerId) {
            console.log(`Calling ${targetPeerId}...`);
            const outgoingCall = peer.call(targetPeerId, localStreamRef.current);

            outgoingCall.on('stream', (remoteStream) => {
                console.log('Received stream from callee');
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
                setIsCallActive(true);
            });

            outgoingCall.on('close', () => {
                console.log('Call ended');
                endCall();
            });

            setCall(outgoingCall);
        }
    };

    const endCall = async () => {
        try {
            // End call locally
            if (call) {
                call.close();
                setCall(null);
            }

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }

            // Unregister from PeerJS server
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
                    console.error('Error unregistering from PeerJS server:', error);
                }
            }

            if (peer) {
                peer.destroy();
            }

            setIsCallActive(false);
            setConnectionStatus('disconnected');

            // End session on backend
            if (sessionId) {
                const token = localStorage.getItem('token');
                await fetch(`http://localhost:5000/api/video/session/${sessionId}/end`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            if (onCallEnd) {
                onCallEnd();
            }
        } catch (error) {
            console.error('Error ending call:', error);
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

    // Simulate connecting to demonstrate UI
    const simulateConnection = () => {
        if (!isCallActive && peer && localStreamRef.current) {
            // Simulate remote video for demo
            setTimeout(() => {
                setIsCallActive(true);
                console.log('Simulated connection established');
            }, 1000);
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
                        {connectionStatus === 'connected' ? 'Connected' :
                            connectionStatus === 'connecting' ? 'Connecting...' :
                                connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                    </small>
                </div>
                <div className="d-flex align-items-center gap-3">
          <span className="badge bg-white text-dark px-3 py-2">
            Room: {roomId || 'Loading...'}
          </span>
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
                </div>
            )}

            {/* Video Area */}
            <div className="video-area flex-grow-1 position-relative p-3">
                {/* Remote Video (Main) */}
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
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-user-circle fa-5x mb-3 opacity-50"></i>
                                    <p>Waiting for other participant to join...</p>
                                    {/* Demo button */}
                                    <button
                                        className="btn btn-primary mt-3"
                                        onClick={simulateConnection}
                                    >
                                        <i className="fas fa-video me-2"></i>
                                        Simulate Connection (Demo)
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Local Video (Picture-in-Picture) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
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
                                transform: 'scaleX(-1)' // Mirror local video
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

            {/* Controls */}
            <div className="video-controls" style={{
                padding: '2rem',
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem'
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

                <button
                    className="btn btn-info rounded-circle"
                    style={{ width: '60px', height: '60px' }}
                    title="Chat"
                >
                    <i className="fas fa-comment fa-lg"></i>
                </button>

                <button
                    className="btn btn-warning rounded-circle"
                    style={{ width: '60px', height: '60px' }}
                    title="Screen share"
                >
                    <i className="fas fa-desktop fa-lg"></i>
                </button>

                <button
                    className="btn btn-success rounded-circle"
                    style={{ width: '60px', height: '60px' }}
                    title="Settings"
                >
                    <i className="fas fa-cog fa-lg"></i>
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
                {isCallActive && <div className="text-success">📹 Call Active</div>}
            </div>
        </div>
    );
};

export default VideoCall;