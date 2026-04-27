const request = require('supertest');
const { createApp } = require('../src/app');

function authServiceStub() {
  return {
    async register(payload) {
      if (payload.email === 'exists@test.com') {
        const err = new Error('User with this email or username already exists');
        err.status = 409;
        err.expose = true;
        throw err;
      }
      return { user: { id: 1, username: payload.username, email: payload.email }, token: 'token_1' };
    },
    async login(payload) {
      if (payload.password !== 'correct-password') {
        const err = new Error('Invalid credentials');
        err.status = 401;
        err.expose = true;
        throw err;
      }
      return { user: { id: 1, username: 'demo', email: payload.email }, token: 'token_1' };
    }
  };
}

describe('auth flow', () => {
  const app = createApp({
    authService: authServiceStub(),
    componentModel: { listAll: async () => [], getByIds: async () => [] },
    configurationModel: { saveConfiguration: async () => 1, listByUser: async () => [] }
  });

  test('register success', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'demo',
      email: 'demo@test.com',
      password: 'correct-password'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeTruthy();
  });

  test('login fail wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'demo@test.com',
      password: 'wrong-password'
    });
    expect(res.statusCode).toBe(401);
  });
});
