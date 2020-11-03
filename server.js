const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const chats = {};

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'server-index.html'));
});

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/chat/:id', (req, res) => {
  const {id} = req.params;

  if (!id) {
    res.status(500).end('ID de chat inválido');
  }

  if (!chats[id]) {
    chats[id] = new Chat();
  }

  chats[id].toJson(res);
});

app.get('/chat/:id/stream', (req, res) => {
  const { id } = req.params;
  let { member } =  req.query;
  
  if (!req.params.id) {
    res.status(404).end('Chat not found');
    return;
  }
  
  const chat = chats[id];

  if (!chat) {
    res.status(404).end('Chat not found');
    return;
  }

  chat.addConnection(res);
  member = chat.addMember(member);

  console.log('ADDED MEMBER %s TO CHAT %s', member, id);

  res.once('close', () => {
    console.log('Closing connection with member:', member);
    chat.removeMember(member);
    chat.removeConnection(res);
  });
});

app.post('/chat/:id/message', (req, res) => {
  const { id } = req.params;
  const { member, message } = req.body;

  if (!id || !chats[id]) {
    res.status(404).end('Chat não encontrado');
    return;
  }

  const chat = chats[id];

  if (!chat.includes(member)) {
    res.status(401).end('Você não está no chat');
    return;
  }

  console.log('RECEVED MESSAGE:', member, message);
  chat.addMessage({member, message});
  res.status(201).end();
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).end(err.stack);
    next();
  }
})

const server = app.listen(process.env.PORT || '8080', () => 
  console.log('Server listening at:', server.address())
);

function writeEvent(res, ev, data) {
  res.write(`event: ${ev}\n`);
  if (data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } else {
    res.write('\n');
  }
}

class Chat {
  constructor() {
    this.messages = [];
    this.members = [];
    this.connections = [];
  }

  toJson(res) {
    const { messages, members } = this;
    res.json({ messages, members });
  }

  addMember(member) {
    member = this.getUniqueMember(member);
    this.members.push(member);
    this.updateMembers();
    return member;
  }

  getUniqueMember(member = 'Anon') {
    if (!/^\w+$|^\w+#\d{4}$/.test(member)) {
      member = 'InvalidMemberName';
    }

    if (this.members.includes(member)) {
      if (member.includes('#')) {
        const memberCombo = member.split('#');
        memberCombo[1] = (Number(memberCombo[1]) + 1).toString(10).padStart(4);
        member = memberCombo.join('#');
      } else {
        member = `${member}#0001`;
      }

      return member;
    }

    return member;
  }

  addConnection(res) {
    this.connections.push(res);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Policy': 'no-cache',
    });

    writeEvent(res, 'ok');
  }

  updateMembers() {
    this.connections.forEach(res => {
      writeEvent(res, 'update-members', this.members);
    })
  }

  removeMember(member) {
    this.members = this.members.filter(m => m !== member);
    this.updateMembers();
  }

  removeConnection(res) {
    this.connections = this.connections.filter(c => c !== res);
  }

  includes(member) {
    return this.members.indexOf(member) !== -1;
  }

  addMessage(message) {
    this.messages.push(message);
    this.newMessage(message);
  }

  newMessage(message) {
    this.connections.forEach(c => {
      writeEvent(c, 'new-message', message);
    });
  }
}