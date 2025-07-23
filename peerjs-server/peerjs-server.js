const { PeerServer } = require('peer');

const peerServer = PeerServer({
    port: 9000,
    path: '/peerjs',
    key: 'mediconnect',
    allow_discovery: true,
    corsOptions: {
        origin: "http://localhost:3000",
        credentials: true
    }
});

console.log('PeerJS server started on port 9000');