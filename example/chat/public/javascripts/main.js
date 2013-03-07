var imageSocket = new WebSocket('ws://localhost:3000/images');
var messageSocket = new WebSocket('ws://localhost:3000/messages');

var input = document.getElementById('input');
var messager = document.getElementById('messager');
var messages = document.getElementById('messages');

messager.addEventListener('drop', function(e) {
    e.preventDefault();

    var files = e.dataTransfer.files;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        
        if (!file.type.match(/image.*/))
            return;

        var reader = new FileReader();

        reader.onload = function(e) {
            imageSocket.send(e.target.result);
        };

        reader.readAsDataURL(file);
    }
});

messager.addEventListener('submit', function(e) {
    e.preventDefault();

    messageSocket.send(input.value);

    input.value = '';
});

imageSocket.addEventListener('message', function(message) {
    var li = document.createElement('li');
    var img = document.createElement('img');

    img.src = message.data;

    li.appendChild(img);
    messages.appendChild(li);
});

messageSocket.addEventListener('message', function(message) {
    var li = document.createElement('li');

    li.innerText = message.data;

    messages.appendChild(li);
});
