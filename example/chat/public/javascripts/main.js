var ws = new WebSocket('ws://192.168.178.37:3000');

var input = document.getElementById('input');
var messager = document.getElementById('messager');
var messages = document.getElementById('messages');

messager.addEventListener('submit', function(e) {
    e.preventDefault();

    ws.send(input.value);

    input.value = '';
});

ws.onmessage = function(message) {
    var li = document.createElement('li');

    li.innerText = message.data;

    messages.appendChild(li);
};
