import instance from './axios';

/**
 * Get current member profile.
 *
 * GET /api/profile
 * Protected: requires Authorization: "Token {token}"
 * Response: Member
 */
export async function getProfile(token) {
  const headers = {
    Authorization: `Token ${token}`,
  };

  const response = await instance.get('/api/profile', { headers });
  return response.data;
}

/**
 * Update current member profile.
 *
 * PUT /api/profile
 * Protected: requires Authorization: "Token {token}"
 * Body: optional fields { username?, password? }
 * Response: updated Member
 */
export async function updateProfile({ token, username, password }) {
  const headers = {
    Authorization: `Token ${token}`,
  };

  const payload = {};

  if (typeof username !== 'undefined') {
    payload.username = username;
  }

  if (typeof password !== 'undefined') {
    payload.password = password;
  }

  const response = await instance.put('/api/profile', payload, { headers });
  return response.data;
}
