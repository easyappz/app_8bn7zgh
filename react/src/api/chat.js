import instance from './axios';

/**
 * Get chat messages list.
 *
 * GET /api/chat/messages
 * Protected: requires Authorization: "Token {token}"
 * Optional query params: limit, offset
 * Response: ChatMessage[]
 */
export async function getMessages(token, { limit, offset } = {}) {
  const headers = {
    Authorization: `Token ${token}`,
  };

  const params = {};

  if (typeof limit !== 'undefined') {
    params.limit = limit;
  }

  if (typeof offset !== 'undefined') {
    params.offset = offset;
  }

  const response = await instance.get('/api/chat/messages', {
    headers,
    params,
  });

  return response.data;
}

/**
 * Send a new chat message.
 *
 * POST /api/chat/messages
 * Protected: requires Authorization: "Token {token}"
 * Body: { text }
 * Response: created ChatMessage
 */
export async function sendMessage({ token, text }) {
  const headers = {
    Authorization: `Token ${token}`,
  };

  const payload = {
    text,
  };

  const response = await instance.post('/api/chat/messages', payload, { headers });
  return response.data;
}
