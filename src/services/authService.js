const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async register({ username, email, password }) {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userModel.findByEmail(email),
      this.userModel.findByUsername(username)
    ]);
    if (existingEmail || existingUsername) {
      const err = new Error('User with this email or username already exists');
      err.status = 409;
      err.expose = true;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const id = await this.userModel.createUser({ username, email, passwordHash });
    return this.buildPayload({ id, username, email });
  }

  async login({ email, password }) {
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      err.expose = true;
      throw err;
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      err.expose = true;
      throw err;
    }
    return this.buildPayload({ id: user.id, username: user.username, email: user.email });
  }

  buildPayload(user) {
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn
    });
    return { user, token };
  }
}

module.exports = { AuthService };
