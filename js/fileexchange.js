function getIPAddress() {
    return fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            return data.ip;
        })
        .catch(error => {
            console.error('Error fetching IP address:', error);
            return null;
        });
}



const dgram = require('dgram');

// Function to send broadcast messages in a loop until a message is received
async function sendBroadcastUntilReceived(port = 41234) {
    const socket = dgram.createSocket('udp4');
    const broadcastAddress = '255.255.255.255';
    const messageBuffer = Buffer.from('Hello, this is a broadcast!');
    
    // Enable broadcast
    socket.bind(() => {
        socket.setBroadcast(true);
    });

    let keepSending = true;

    // Function to send broadcast message in a loop
    const sendMessage = () => {
        if (keepSending) {
            socket.send(messageBuffer, 0, messageBuffer.length, port, broadcastAddress, (err) => {
                if (err) {
                    console.error('Error sending broadcast message:', err);
                } else {
                    console.log(`Broadcast message sent to port ${port}`);
                }
            });
        }
    };

    // Send a message every 2 seconds
    const intervalId = setInterval(sendMessage, 2000);

    // Start listening for incoming broadcast messages
    const receiveSocket = dgram.createSocket('udp4');
    receiveSocket.bind(port, () => {
        receiveSocket.setBroadcast(true);
        console.log(`Listening for broadcast messages on port ${port}`);
    });

    // Event handler for receiving messages
    receiveSocket.on('message', (message, rinfo) => {
        console.log(`Received message: "${message}" from ${rinfo.address}:${rinfo.port}`);
        
        // Stop sending messages once we receive a message
        keepSending = false;
        clearInterval(intervalId);
        console.log('Stopping broadcast message sending.');
        
        // Close sockets after handling the message
        socket.close();
        receiveSocket.close();
    });

    // Error handling
    socket.on('error', (err) => {
        console.error(`Socket error:\n${err.stack}`);
        socket.close();
    });

    receiveSocket.on('error', (err) => {
        console.error(`Receive socket error:\n${err.stack}`);
        receiveSocket.close();
    });
}

// Example usage
sendBroadcastUntilReceived(41234);
