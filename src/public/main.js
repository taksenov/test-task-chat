window.onload = function() {
  // Create WebSocket connection
  const ws = new WebSocket('ws://localhost:3000');

  // Settings Constants
  const NOT_PRESENT = 'NOT_PRESENT';
  const CTRL_KEYCODE = 17;
  const ENTER_KEYCODE = 13;
  const HELLO = 'HELLO';
  const INFO = 'INFO';
  const MESSAGE = 'MESSAGE';
  const NO_STATUS = 'NO_STATUS';

  // Get DOM elements
  const introduceForm = document.getElementById('introduce-form');
  const userNameInput = document.getElementById('user-name');
  const chatLogForm = document.getElementById('chat-log');
  const messageForm = document.getElementById('push-form');
  const membersForm = document.getElementById('members');
  const labelForNickName = document.getElementById('hello-message');

  let userID = null;
  let membersList = null;
  let user = NOT_PRESENT;
  let initialText = '';
  let ctrl = false;

  // Common Functions
  // Break text for multi-string messsages
  function breakText() {
    let caret = messageForm.Message.selectionStart;
    let text = messageForm.Message.value;

    messageForm.Message.value =
      text.substring(0, caret) + '\r\n' + text.substring(caret);
  }

  // Submit message
  function submitMessage() {
    const message = messageForm.Message.value.trim();

    if (message) {
      ws.send(messageForm.Message.value);
      messageForm.Message.value = '';
    }
  }

  // Event listeners
  // Key combination for CTRL+ENTER for message send
  messageForm.addEventListener('keyup', e => {
    const { keyCode } = e;

    switch (keyCode) {
      case ENTER_KEYCODE:
        if (!ctrl) {
          submitMessage();
          return false;
        }
        breakText();
        break;
      case CTRL_KEYCODE:
        ctrl = false;
    }
  });
  messageForm.addEventListener('keydown', e => {
    const { keyCode } = e;

    switch (keyCode) {
      case ENTER_KEYCODE:
        return false;
      case CTRL_KEYCODE:
        ctrl = true;
    }
  });

  // Send nickName
  introduceForm.addEventListener('submit', e => {
    e.preventDefault();
    const user = userNameInput.value.trim();

    if (user) {
      ws.send(userNameInput.value);
    }
  });

  // Send Message
  messageForm.addEventListener('submit', e => {
    e.preventDefault();

    submitMessage();
  });

  // WebSocket messages state and DOM
  ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    let text = '';
    initial = HELLO;

    switch (message.type) {
      case HELLO: {
        initial = message.type;
        initialText = message.message;
        userID = message.data;
        break;
      }
      case INFO: {
        initial = message.type;
        membersList = message.nickNames;
        initialText = initialText;
        text = message.message;
        if (userID === message.data) user = message.nickName;
        break;
      }
      case MESSAGE: {
        initial = message.type;
        membersList = message.nickNames;
        initialText = initialText;
        text = `${message.nickName} :
_________
${message.message}`;
        if (userID === message.data) user = message.nickName;
        break;
      }
      default: {
        initial = NO_STATUS;
        break;
      }
    }

    // DOM for Sign-Up form
    if (initial === HELLO && user === NOT_PRESENT) {
      introduceForm.style.display = 'block';
      messageForm.style.display = 'none';
      chatLogForm.style.display = 'none';
      labelForNickName.innerText = initialText;
    }

    // DOM for Chat
    if ((initial === MESSAGE || initial === INFO) && user !== NOT_PRESENT) {
      introduceForm.style.display = 'none';
      messageForm.style.display = 'block';
      chatLogForm.style.display = 'block';

      const messageElem = document.createElement('pre');
      const memberElem = document.createElement('div');
      const membersLabel = document.createElement('label');

      membersLabel.innerText = 'Chat room members:';
      messageElem.innerHTML = text;
      membersForm.innerHTML = '';
      memberElem.innerText = _.compact(
        _.remove(membersList, function(n) {
          return n !== NOT_PRESENT;
        }),
      );
      chatLogForm.appendChild(messageElem);
      membersForm.appendChild(membersLabel);
      membersForm.appendChild(memberElem);
      messageElem.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }
  };
};
