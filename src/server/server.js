const WebSocket = require('ws');

// Settings Constants
const NOT_PRESENT = 'NOT_PRESENT';
const HELLO = 'HELLO';
const INFO = 'INFO';
const MESSAGE = 'MESSAGE';
const clients = [];
const nickNames = [];

// New WebSocket server
const webSocketServer = new WebSocket.Server(
  {
    port: 3000,
  },
  () => {
    console.log(
      `
WebSocket backend server is running on PORT: 3000.

To use a web-server for clients. Complete these steps:
1) run web-server: "http-server ./src/public" or "npm run public"
2) in browser go to url: "http://localhost:8080"
  `,
    );
  },
);

// Connection
webSocketServer.on('connection', (ws, req) => {
  const id = clients.length;
  let nickName = NOT_PRESENT;

  clients[id] = ws;
  nickNames[id] = nickName;

  console.log(`New connection #${id}`);

  clients[id].send(
    JSON.stringify({
      type: HELLO,
      message: `Hello! Please setup your nick name for chat:`,
      data: id,
      nickName: NOT_PRESENT,
    }),
  );

  ws.on('message', message => {
    if (nickName === NOT_PRESENT) {
      console.log(`Recieve initial message: ${message} from: #${id}`);
      nickName = message;
      if (nickNames.indexOf(nickName) === -1) {
        nickNames[id] = nickName;
        clients.forEach(elem => {
          elem.send(
            JSON.stringify({
              type: INFO,
              message: `User @${nickName} is now connected`,
              data: id,
              nickName: nickName,
              nickNames: nickNames,
            }),
          );
        });
      } else {
        nickName = NOT_PRESENT;
        clients[id].send(
          JSON.stringify({
            type: HELLO,
            message: `User has alredy exist! Please setup another nick name for chat:`,
            data: id,
            nickName: NOT_PRESENT,
          }),
        );
        return;
      }
    } else {
      clients.forEach(elem => {
        elem.send(
          JSON.stringify({
            type: MESSAGE,
            message: message,
            data: id,
            nickName: nickName,
            nickNames: nickNames,
          }),
        );
      });
    }
  });

  // User disconnect
  ws.on('close', () => {
    console.log(`User @${nickName} is disconnected`);
    delete clients[id];
    delete nickNames[id];
    if (nickName === NOT_PRESENT) return;
    clients.forEach(elem => {
      elem.send(
        JSON.stringify({
          type: INFO,
          message: `User @${nickName} is disconnected`,
          data: id,
          nickName: nickName,
          nickNames: nickNames,
        }),
      );
    });
  });

  // Error
  ws.on('error', err => console.log(err.message));
});
