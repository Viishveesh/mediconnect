const { PeerServer } = require('peer');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9000;

// Enable CORS for all routes
app.use(cors({
    origin: ["https://dal-mediconnect.netlify.app"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Store active rooms and participants
const activeRooms = new Map();

console.log('Starting MediConnect PeerJS Server...');

// Create PeerJS server with fixed configuration
const peerServer = PeerServer({
    port: 9001,
    path: '/peerjs',
    key: 'mediconnect',
    allow_discovery: true,
    alive_timeout: 60000,
    corsOptions: {
        origin: ["http://localhost:3000", "http://localhost:3001", "https://mediconnect.vercel.app"],
        credentials: true
    },
    generateClientId: () => {
        return `mc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
});

// Handle PeerJS server events
peerServer.on('connection', (client) => {
    console.log(`Client connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
    console.log(`Client disconnected: ${client.getId()}`);
});

// Room management API endpoints
app.post('/api/rooms/:roomId/join', (req, res) => {
    const { roomId } = req.params;
    const { peerId, userInfo } = req.body;

    console.log(`Join request for room ${roomId} from peer ${peerId}`);

    if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
            participants: [],
            createdAt: new Date()
        });
        console.log(`Created new room: ${roomId}`);
    }

    const room = activeRooms.get(roomId);

    // Check if user already in room
    const existingParticipant = room.participants.find(p => p.peerId === peerId);
    if (!existingParticipant) {
        room.participants.push({
            peerId,
            ...userInfo,
            joinedAt: new Date().toISOString()
        });
        console.log(`Added participant ${peerId} to room ${roomId}`);
    }

    // Return other participants for connection
    const otherParticipants = room.participants.filter(p => p.peerId !== peerId);

    res.json({
        success: true,
        roomId,
        participants: room.participants,
        otherParticipants,
        message: `Joined room ${roomId}`
    });
});

app.post('/api/rooms/:roomId/leave', (req, res) => {
    const { roomId } = req.params;
    const { peerId } = req.body;

    console.log(`Leave request for room ${roomId} from peer ${peerId}`);

    if (activeRooms.has(roomId)) {
        const room = activeRooms.get(roomId);
        room.participants = room.participants.filter(p => p.peerId !== peerId);

        console.log(`Removed participant ${peerId} from room ${roomId}`);

        // Clean up empty rooms
        if (room.participants.length === 0) {
            activeRooms.delete(roomId);
            console.log(`Cleaned up empty room: ${roomId}`);
        }
    }

    res.json({
        success: true,
        message: `Left room ${roomId}`
    });
});

app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;

    const room = activeRooms.get(roomId);
    if (!room) {
        return res.json({
            roomId,
            participants: [],
            exists: false
        });
    }

    res.json({
        roomId,
        participants: room.participants,
        exists: true,
        createdAt: room.createdAt
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        activeRooms: activeRooms.size,
        timestamp: new Date().toISOString(),
        peerServerRunning: true
    });
});

// Debug endpoint to see all rooms
app.get('/api/debug/rooms', (req, res) => {
    const rooms = {};
    for (const [roomId, room] of activeRooms.entries()) {
        rooms[roomId] = {
            participants: room.participants.length,
            createdAt: room.createdAt,
            participantDetails: room.participants
        };
    }
    res.json({
        totalRooms: activeRooms.size,
        rooms
    });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Room management server running on port ${PORT}`);
    console.log(`PeerJS server running on port 9001`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Debug rooms: http://localhost:${PORT}/api/debug/rooms`);
});

// Cleanup old rooms periodically
setInterval(() => {
    const now = new Date();
    let cleanedRooms = 0;

    for (const [roomId, room] of activeRooms.entries()) {
        const roomAge = (now - room.createdAt) / 1000 / 60; // minutes

        // Remove rooms older than 4 hours with no participants
        if (roomAge > 240 && room.participants.length === 0) {
            activeRooms.delete(roomId);
            cleanedRooms++;
        }
    }

    if (cleanedRooms > 0) {
        console.log(`Cleaned up ${cleanedRooms} old room(s)`);
    }
}, 30 * 60 * 1000); // Run every 30 minutes

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down MediConnect PeerJS Server...');
    process.exit(0);
});

module.exports = app;