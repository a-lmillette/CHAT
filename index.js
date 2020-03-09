var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

let messages = [];
let users = [];
let activeUsers = [];
let messageID = 0;
let colour = "#ffffff";

app.use(express.static('client'));
app.get('/', function(req, res){
    res.sendFile(__dirname + 'client/index.html');
});

http.listen(port, () =>{
    console.log('listening on:' + port);
});

io.on('connection', socket => {

    let user = {};

    user.name = 'User' + String(Math.floor((Math.random() * 1000) + 1));

    user.colour = "ffffff";
    user.ID = Math.floor(Math.random()*100000);
    users.push(user);

    socket.emit('userConnected', user);

    if (activeUsers.find(obj => {
        return obj.ID === user.ID;
    }) === undefined) {
        activeUsers.push(user);
    }

    if (users.find(obj => {
        return obj.ID === user.ID;
    }) === undefined) {

        users.push(user);

    }
    io.emit('updateUsers', activeUsers);
    socket.emit('refresh', messages);

    let i = activeUsers.findIndex(obj => {
        return (obj.ID === user.ID);
    });

    socket.on('disconnect', () => {
        activeUsers.splice(i, 1);
        io.emit('updateUsers', activeUsers);
    });

     socket.on('userMessage', msg=> {
        if(messageHandler(msg))
        {
            let objMessage = messageFormat(msg);
            io.emit('serverMessage', objMessage);
        }
    });

    function messageHandler(msg) {

        if (/^\/nickcolor\s[0-9a-f]{6}$/i.test(msg)) {

            msg = msg.replace(/\/nickcolor\s*|/gi, '');
            user.colour = "#" + msg;
            let i = activeUsers.findIndex(obj => {
                return obj.ID === user.ID;
            });
            activeUsers[i].colour = user.colour;
            socket.emit('userConnected', user);
            io.emit('updateUsers', activeUsers)
            return false;
        }
        if (/^\/nick\s/.test(msg)) {
            msg = msg.replace(/\/nick\s*|/gi, '');
            if (!checkIfUserExists(msg)) {
                user.name = msg;
                let i = activeUsers.findIndex(obj => {
                    return obj.ID === user.ID;
                });
                activeUsers[i].name = user.name;

                socket.emit('userConnected', user);
                io.emit('updateUsers', activeUsers);
            }
            return false;
        }
        else {
            return true;
        }
    }

    function messageFormat(msg){

        const now = new Date()
        let fortmatted_msg = {};
        fortmatted_msg.msg = msg;
        fortmatted_msg.colour = user.colour;
        fortmatted_msg.name = user.name;
        fortmatted_msg.userID = user.ID;
        fortmatted_msg.timeDate = now;
        fortmatted_msg.messageID = messageID++;

        messages.push(fortmatted_msg);
        return fortmatted_msg;
    }

    function checkIfUserExists(userName) {
        let i;
        for(i=0; i<users.length; i++){
            if(userName.toString() === users[i].name.toString()){
                return true;
            }
        }
        return false;
    }

});


