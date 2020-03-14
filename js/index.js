const btn = document.querySelector('.reg-btn');
const btnSendMessage = document.querySelector('.chat__message-btn');
const popap = document.querySelector('.popap');
const popapImg = document.querySelector('.popap-img');
const regName = document.querySelector('#regName');
const regNick = document.querySelector('#regLogin');
const loadImg = document.querySelector('.current-user-img');
const cancel = document.querySelector('.cancel');
const input = document.querySelector('.load-img-form input');
const preview = document.querySelector('.preview');
const msgText = document.querySelector('#msg');
const msgContainer = document.querySelector('.chat__message-aria');
const userCount = document.querySelector('.user_count');
const users = document.querySelector('.other-users-title');
const fileTypes = [
    'image/jpeg',
    'image/pjpeg',
    'image/png'
];

input.addEventListener('change', updateImageDisplay);

function returnFileSize(number) {
    if(number < 1024) {
        return number + 'bytes';
    } else if(number > 1024 && number < 1048576) {
        return (number/1024).toFixed(1) + 'KB';
    } else if(number > 1048576) {
        return (number/1048576).toFixed(1) + 'MB';
    }
}

function validFileType(file) {
    for(var i = 0; i < fileTypes.length; i++) {
        if(file.type === fileTypes[i]) {
            return true;
        }
    }

    return false;
}

function updateImageDisplay() {
    const previewImg = document.querySelector('.current-user-preview-img');
    const previewP = document.querySelector('.preview > p');

    var curFiles = input.files;
    if (curFiles.length === 0) {
        var para = document.createElement('p');
        para.textContent = 'No files currently selected for upload';
        preview.appendChild(para);
    } else {
        var para = document.createElement('p');
        if (validFileType(curFiles[0])) {
            var image = document.createElement('img');
            image.src = window.URL.createObjectURL(curFiles[0]);
            previewImg.style.display = 'block';
            previewP.style.display = 'none';
            previewImg.style.backgroundImage = 'url(' + image.src + ')';
        } else {
            para.textContent = 'File name ' + curFiles[0].name + ': Not a valid file type. Update your selection.';
        }
    }
}

function addMessage(message, currentUser) {
    const messageItem = document.createElement('div');
    const messageImageContainer = document.createElement('div');
    const messageContent = document.createElement('div');
    const messageUser = document.createElement('div');
    const messageUserName = document.createElement('div');
    const messageDate = document.createElement('div');
    const messageText = document.createElement('div');

    messageContent.appendChild(messageUser);
    messageContent.appendChild(messageText);
    messageContent.style.display = 'flex';
    messageContent.style.flexDirection = 'column';
    messageContent.style.justifyContent = 'center';
    messageUser.appendChild(messageUserName);
    messageUser.appendChild(messageDate);
    messageUser.style.display = 'flex';
    messageUser.style.marginBottom = '5px';
    messageImageContainer.classList.add('current-user-img');
    messageText.textContent = message.data.body;
    messageDate.textContent = message.data.date;
    messageDate.style.fontWeight = '100';
    messageUserName.textContent = message.user.name;
    messageUserName.style.marginRight = '10px';
    messageItem.appendChild(messageImageContainer);
    messageItem.appendChild(messageContent);
    messageItem.style.display = 'flex';
    messageImageContainer.style.order = '0';
    if (currentUser[0].name == message.user.name && currentUser[0].login == message.user.login) {
        messageUserName.textContent = currentUser[0].name;
        messageItem.style.justifyContent = 'flex-end';
        messageItem.style.paddingRight = '10px';
        messageImageContainer.style.order = '1';
        messageImageContainer.style.marginLeft = '10px';
    }
    msgContainer.appendChild(messageItem);
}

btn.addEventListener('click', (e) => {
    e.preventDefault();

    if (regName.value && regNick.value) {
        popap.classList.remove('is-active');
        const socket = new WebSocket('ws://localhost:5000');

        socket.onerror = function(e) {
            alert("Ошибка соединения с сервером");
        };

        socket.onopen = function(e) {
            const newUser = {
                "action": "auth",
                "data": {
                    "name": regName.value,
                    "login": regNick.value
                }
            };

            const newUserJson = JSON.stringify(newUser);

            socket.send(newUserJson);
        }
        const currentUser = [];
        socket.addEventListener('message', (e) => {
            const answer = JSON.parse(e.data);
            console.log(answer);
            const actionType = answer['action'];
            switch(actionType) {
                case 'auth':
                    currentUser.push({'name': answer.data.name, 'login': answer.data.login});
                    msgContainer.innerHTML = 'Добро пожаловать, ' + answer.data.name + '!';
                    if (answer.messages) {
                        for (const message of answer.messages) {
                            addMessage(message, currentUser);
                        }
                    }
                    break;
                case 'message':
                    addMessage(answer, currentUser);
                    break;
                case 'out':
                    userCount.textContent = ''
                    userCount.textContent = '(' + answer.connections + ')';
                    break;
                case 'in':
                    userCount.textContent = ''
                    userCount.textContent = '(' + answer.connections + ')';
                    for (const user of answer.users) {
                        if (!document.getElementById(user.name)) {
                            const userContainer = document.createElement('div');
                            const userImageContainer = document.createElement('div');
                            const userName = document.createElement('div');
                            userImageContainer.classList.add('current-user-img');
                            userContainer.classList.add('user_item');
                            userContainer.id = user.name;
                            userContainer.setAttribute('data-user-name', user.name);
                            userImageContainer.style.marginRight = '10px';
                            userName.textContent = user.name;
                            userContainer.appendChild(userImageContainer);
                            userContainer.appendChild(userName);
                            users.appendChild(userContainer);
                        }
                    }
                    break;
            }
        });
        socket.addEventListener('close', (e) => {
            console.log(e);
        })
        btnSendMessage.addEventListener('click', e => {
            e.preventDefault();
            const date = new Date();
            const newMessage = {
                "action":"message",
                "user": {
                    "name": regName.value,
                    "login": regNick.value
                },
                "data": {
                    "body": msgText.value,
                    "date": date.getHours() + ':' + date.getMinutes()
                }};

            const newMessageJson = JSON.stringify(newMessage);
            socket.send(newMessageJson);

            msgText.value = '';
        });
    }

    if (!regName.value) {
        regName.style.borderBottom = '1px solid red';
        regName.placeholder = 'Вы не ввели имя';
    } else {
        regName.style.borderBottom = '1px solid #5288c1';
    }
    if (!regName.value) {
        regNick.style.borderBottom = '1px solid red';
        regNick.placeholder = 'Вы не ввели ник';
    }

})
function checkAttr(name) {
    const elems = document.getElementsByClassName(name);
    console.log(elems)
    for (const elem of elems) {
        if (elem.getAttribute(name)) {
            return true;
        }
    }
    return false;
}

loadImg.addEventListener('click', (e) => {
    popapImg.classList.add('is-active')
});
cancel.addEventListener('click', (e) => {
    e.preventDefault()
    popapImg.classList.remove('is-active')
});



