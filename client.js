// So it isn't a magic number
const ENTER = 13;

const element = (id) => {
    return document.getElementById(id);
}

// Get Elements
const status = element('status');
const messages = element('messages');
const textarea = element('textarea');
const username = element('username');
const clear = element('clear');

// Set default status
const defaultStatus = status.textContent;

const setStatus = (s) => {
    status.textContent = s;

    if (s !== defaultStatus) {
        const delay = setTimeout(() => {
            setStatus(defaultStatus);
        }, 4000);
    }
}

// Connect to socket.io
const socket = io.connect('http://127.0.0.1:4000');

// Check for connection
if (socket !== undefined) {
    console.log('Connected to socket...');

    // Handle output
    socket.on('output', (data) => {
        if(data.length){
            for(let i = 0; i < data.length; i++){
                // Fill out message div
                const newMessage = document.createElement('div');
                newMessage.setAttribute('class', 'chat-message');
                newMessage.textContent = `${data[i].name}: ${data[i].message}`;
                messages.appendChild(newMessage);
                messages.insertBefore(newMessage, messages.firstChild);
            }
        }
    });

    // Get status from server
    socket.on('status', (data) => {
        // Get message status
        setStatus((typeof data === 'object') ? data.message : data);

        // If status is clear, clear text
        if(data.clear){
            textarea.value = '';
        }
    });

    // Handle input
    textarea.addEventListener('keydown', (ev) => {
        if(ev.which === ENTER && ev.shiftKey == false){
            // Emit to server input
            socket.emit('input', {
                name: username.value,
                message: textarea.value,
            });
            ev.preventDefault();
        }
    });

    // Handle chat clear
    clear.addEventListener('click', () => {
        socket.emit('clear');
    });

    // Clear message
    socket.on('cleared', () => {
        messages.textContent = '';
    });
}