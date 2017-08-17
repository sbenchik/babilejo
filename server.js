const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Set up sanitizer
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

// Connect to MongoDB
mongo.connect('mongodb://127.0.0.1/mongochat', (err, db) => {
    if (err) throw err;
    console.log('MongoDB connected...');

    //Connect to socket.io
    client.on('connection', (socket) => {
        let chat = db.collection('chats');

        // Create function to send status
        const sendStatus = (s) => {
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(100).sort({ _id: 1 }).toArray((err, result) => {
            if (err) throw err;
            // Emit messages
            socket.emit('output', result);
        });

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
                chat.insert(newChat, () => {
                    client.emit('output', [newChat]);
                    sendStatus({
                        message: 'Message Sent',
                        clear: true,
                    });
                });
            }
        });
        // Handle clear
        socket.on('clear', (data) => {
            // Remove chats from collection
            chat.remove({}, () => {
                // Emit cleared
                socket.emit('cleared');
            });
        });
    });
});