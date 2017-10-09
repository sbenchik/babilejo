const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Set up HTTP server and socket.io
const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

const server = http.createServer(app);

server.listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO.listen(server);

// Set up sanitizer
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

//Connect to socket.io
io.sockets.on('connection', (socket) => {
    
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
            io.emit('output', [newChat]);
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