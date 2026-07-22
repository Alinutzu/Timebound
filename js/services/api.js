const API_BASE = 'https://familyhub.go.ro/api';

function getToken() {
  return localStorage.getItem('arena_token');
}

function setToken(token) {
  localStorage.setItem('arena_token', token);
}

function clearToken() {
  localStorage.removeItem('arena_token');
}

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  const token = getToken();
  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export default {
  getToken,
  setToken,
  clearToken,

  // Auth
  register(username, email, password) {
    return request('POST', '/auth/register', { username, email, password });
  },

  guest() {
    return request('POST', '/auth/guest');
  },

  convertGuest(username, email, password) {
    return request('POST', '/auth/convert', { username, email, password });
  },

  login(username, password) {
    return request('POST', '/auth/login', { username, password });
  },

  // Guardians
  getGuardians() {
    return request('GET', '/guardians');
  },

  summonGuardian() {
    return request('POST', '/guardians/summon');
  },

  levelUpGuardian(id) {
    return request('POST', `/guardians/${id}/levelup`);
  },

  releaseGuardian(id) {
    return request('DELETE', `/guardians/${id}`);
  },

  // Battles
  battlePvE(guardianIds) {
    return request('POST', '/battles/pve', { guardianIds });
  },

  battlePvP(guardianIds, defenderId) {
    return request('POST', '/battles/pvp/challenge', { guardianIds, defenderId });
  },

  // Leaderboard
  getLeaderboard(limit = 50, offset = 0) {
    return request('GET', `/leaderboard?limit=${limit}&offset=${offset}`);
  },

  getMyRank() {
    return request('GET', '/leaderboard/me');
  },

  getOpponents() {
    return request('GET', '/leaderboard/opponents');
  },

  // Save
  saveCloud(state) {
    return request('POST', '/save', { state });
  },

  loadCloud() {
    return request('GET', '/save');
  }
};
