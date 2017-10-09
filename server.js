const express = require('express');
const app = express();
const server = require('http').createServer(app);
const client = require('socket.io').listen(server);

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Set up HTTP server and socket.io
const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

// Set up sanitizer
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

//Connect to socket.io
client.sockets.on('connection', (socket) => {
    
    // Create function to send status
    const sendStatus = (s) => {
        socket.emit('status', s);
    }
    
    socket.emit('output', result);
    
    // Handle input events
    socket.on('input', (data) => {
        // Sanitize name and message
        let name = DOMPurify.sanitize(data.name);
        let message = DOMPurify.sanitize(data.message);
        // Check for name and message
        if (name === '' || message === '') {
            sendStatus('Please enter a valid name and message');
        } else {
            const newChat = { name: name, message: message };
            client.emit('output', [newChat]);
            sendStatus({
                clear: true,
            });
        }
    });
    // Handle clear
    socket.on('clear', (data) => {
        // Remove chats from collection
        // Emit cleared
        socket.emit('cleared');
    });
});