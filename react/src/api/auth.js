import instance from './axios';

/**
 * Register a new member.
 *
 * POST /api/auth/register
 * Body: { username, password }
 * Response: AuthToken { token, member }
 */
export async function registerMember({ username, password }) {
  const payload = {
    username,
    password,
  };

  const response = await instance.post('/api/auth/register', payload);
  return response.data;
}

/**
 * Login existing member.
 *
 * POST /api/auth/login
 * Body: { username, password }
 * Response: AuthToken { token, member }
 */
export async function login({ username, password }) {
  const payload = {
    username,
    password,
  };

  const response = await instance.post('/api/auth/login', payload);
  return response.data;
}

/**
 * Logout current member.
 *
 * POST /api/auth/logout
 * Protected: requires Authorization: "Token {token}"
 * Response: empty (204 No Content).
 */
export async function logout(token) {
  const headers = {
    Authorization: `Token ${token}`,
  };

  const response = await instance.post('/api/auth/logout', null, { headers });
  return response.data;
}
