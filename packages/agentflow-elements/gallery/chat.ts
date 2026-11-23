import '../src/chat/index.js';

const params = new URLSearchParams(location.search);
const chat = document.createElement('agentflow-chat');
chat.setAttribute('connection', params.get('key') ?? 'pub_gallery');
for (const [param, attribute] of [['api', 'api-base'], ['lang', 'lang']] as const) {
  const value = params.get(param);
  if (value) chat.setAttribute(attribute, value);
}
document.body.append(chat);
