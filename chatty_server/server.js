const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('uuid');
// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

//Broadcast helper function
function broadCast(data){
  wss.clients.forEach((client)=>{
    client.send(JSON.stringify(data))
  });
}

// Generate Random Colour
function randomColour (){
  let colour = "#" + (Math.random()*0xFFFFFF<<0).toString(16)
  return colour;
}
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  let colourAssign = randomColour()
  console.log('Client connected');
  const onlineUsers ={
    type: "updateUserCount",
    userCount: wss.clients.size,
  }
  broadCast(onlineUsers);
  ws.on('message', function incoming(message){
    let outGoing;  
    const messageObj = JSON.parse(message);
    if(messageObj.type === "postMessage"){
      outGoing = {
        type:"incomingMessage",
        id:uuid(),
        userName: messageObj.userName,
        content: messageObj.content,
        userColour: colourAssign
        }
      } else if(messageObj.type === "postNotification"){
          outGoing={type:"incomingNotification",
            id:uuid(),
            content: messageObj.content}
      }
    
      console.log("[Server] Received Message;", messageObj);
      //broadcast to everybody
    broadCast(outGoing);
  
  });
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    
    const onlineUsers ={
      type: "updateUserCount",
      userCount: wss.clients.size
    }
  broadCast(onlineUsers);
  })
});