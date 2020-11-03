const CHAT_BASE_URL = 'http://localhost:8080/chat';

const EVENT_SOURCE_OPEN = 1;
const EVENT_SOURCE_CLOSED = 2;
const EVENT_SOURCE_CONNECTING = 0;

export class ChatEventStream {
  static EVENT_OK = 'ok';
  static EVENT_MEMBER_CHANGE = 'member-change';
  static EVENT_MESSAGE = 'message';

  constructor(id, member) {
    this.es = new EventSource(`${CHAT_BASE_URL}/${id}/stream?member=${member}`);
  }

  on(event, fn) {
    if (ChatEventStream.EVENT_MESSAGE === event) {
      this.es.addEventListener('new-message', ev => {
        fn(JSON.parse(ev.data));
      });
      return;
    }

    if (ChatEventStream.EVENT_MEMBER_CHANGE === event) {
      this.es.addEventListener('update-members', ev => {
        fn(JSON.parse(ev.data));
      });
      return;
    }

    if (ChatEventStream.EVENT_OK === event) {
      this.es.addEventListener('open', () => fn());
      return;
    }

    throw new Error('invalid event');
  }

  get open() {
    return this.es.readyState === EVENT_SOURCE_OPEN; 
  }

  get closed() {
    return this.es.readyState === EVENT_SOURCE_CLOSED;
  }

  get connecting() {
    return this.es.readyState === EVENT_SOURCE_CONNECTING;
  }

  close() {
    this.es.close();
    this.es = null;
  }
}

export async function getChatMessagesAndMembers(id) {
  const res = await fetch(`${CHAT_BASE_URL}/${id}`);
  return await res.json();
}

export async function postMessage(id, message, member) {
  await fetch(`${CHAT_BASE_URL}/${id}/message`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      member
    })
  });
}