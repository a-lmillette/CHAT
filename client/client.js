$(document).ready(function () {
    let socket = io();
    let user = {};
    let users=[];

    socket.on('serverMessage', msg => {
        updateUI(msg);
    });

    socket.on('refresh', msg => {
        for (let i = 0; i<msg.length; i++){
            updateUI(msg[i]);
        }
    });

    socket.on('userConnected', msg => {
       user = msg;
       $('#currentUser').text(user.name);

    });

    $('form').submit(msg => {
        msg.preventDefault();
        userMessage = $('#userMessage').val();
        socket.emit('userMessage', userMessage);
        $('#userMessage').val('');
        return false;
    });

    function updateUI(msg) {

        let i = users.findIndex(x => {return x.ID === msg.userID});
        let timeDate = new Date(msg.timeDate);
        let name;
        let colour;

        try{
            colour = users[i].colour;
        } catch {
            colour = "#ffffff";
        }

        try {
            name = users[i].name;
        } catch {
            name = "error";
        }

        let format = '<div class="chat_messages""> <span class="format" style="color:' + colour + ';">' + timeDate.getHours() + ':' + ( timeDate.getMinutes() > 9 ? timeDate.getMinutes() : '0' + timeDate.getMinutes()) + "  " + name + '</span> </div> <span ' + ((user.ID === msg.userID) ? 'class="bold"' : '') + '>' + msg.msg + '</span>';

        $('#chat_messages').append($('<div class="msg">').html(format));

        let scroll = document.getElementById("chat_messages");
        if(scroll !== null) {
            scroll.scrollTop = scroll.scrollHeight;
        }
    }
    socket.on('updateUsers', msg => {
        users = msg;
        let activeUsers = [];
        for (let i = 0; i < msg.length; i++) {
            activeUsers.push('<div style="color:' +  msg[i].colour + ';">' + msg[i].name + '</div>');
        }
        $('#users').html(activeUsers.join(''));
    });

});