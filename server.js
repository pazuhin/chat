const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 5000, clientTracking: true });
const messages = [];
const users = [];
const onlineUsers = [];
var connections = 0
function broadcast(data) {
    data = JSON.stringify(data);
    wss.clients.forEach(ws => {
        ws.send(data);
    });
}
wss.on('connection', ws => {
    ws.on('message', data => {
        data = JSON.parse(data);
        switch (data.action) {
            case 'auth' :
                ++connections;
                onlineUsers.push({name: data.data.name, login: data.data.login})
                broadcast({action:'in', connections:connections, users: onlineUsers});
                if (getUser(data)) {
                    data['messages'] = messages;
                }
                data = JSON.stringify(data);
                ws.send(data);
                break;
            case 'message' :
                broadcast(data);
                messages.push({
                    user: {name: data.user.name, login: data.user.login},
                    data: {
                        body: data.data.body,
                        date: data.data.date
                    },
                });
                break;
        }
    });
    ws.on('close', () => {
        --connections;
        broadcast({action:'out', connections:connections});
    });
});
function getUser(data) {
    const allUsers = getAllUsers(messages);

    for (const user of allUsers) {
        if ((user.name == data.data.name) && (user.login == data.data.login)) {
            return true;
        }
    }

    return false;
}
function getAllUsers(messages) {
    for (let i = 0; i < messages.length; i++) {
        if (messages[i] && messages[i+1] == undefined) {
            users.push({
                name: messages[i].user.name,
                login: messages[i].user.login
            });
            continue;
        }
        if ((messages[i].user.name != messages[i+1].user.name) && (messages[i].user.login != messages[i+1].user.login)) {
            users.push({
                name: messages[i].user.name,
                login: messages[i].user.login
            });
        }
    }

    return users;
}


//
// wss.on('message', (data) =>  {
//     switch (data.action) {
//         case 'auth':
//             wss.clients.forEach(function each(client) {
//                     if (client.readyState === WebSocket.OPEN) {
//                         client.send('dfsdfsdf');
//                     }
//                 });
//         case 'message':
//             wss.clients.forEach(function each(client) {
//                 if (client.readyState === WebSocket.OPEN) {
//                     client.send('erewdsfdsf');
//                 }
//             });
//
//     }
    // wss.clients.forEach(function each(client) {
    //     if (client.readyState === WebSocket.OPEN) {
    //         client.send(data, count);
    //     }
    // });
// });
