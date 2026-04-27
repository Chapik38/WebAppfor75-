const env = require('./config/env');
const { getPool } = require('./config/db');
const { initializeDatabase } = require('./db/initSchema');
const { createApp } = require('./app');
const { AuthService } = require('./services/authService');

const fallbackComponents = [
  { id: 1, category: 'CPU', name: 'AMD Ryzen 5 5600', socket: 'AM4', tdp: 65, perf_score: 260, metadata_json: { cores: 6 }, release_year: 2020 },
  { id: 2, category: 'CPU', name: 'Intel Core i5-12400F', socket: 'LGA1700', tdp: 65, perf_score: 280, metadata_json: { cores: 6 }, release_year: 2022 },
  { id: 3, category: 'MOTHERBOARD', name: 'MSI B550 Tomahawk', socket: 'AM4', ram_type: 'DDR4', storage_interface: 'SATA/NVME', perf_score: 180, release_year: 2021 },
  { id: 4, category: 'MOTHERBOARD', name: 'ASUS PRIME B660M-A', socket: 'LGA1700', ram_type: 'DDR4', storage_interface: 'SATA/NVME', perf_score: 170, release_year: 2022 },
  { id: 5, category: 'RAM', name: 'Corsair Vengeance 16GB DDR4', ram_type: 'DDR4', perf_score: 110, release_year: 2021 },
  { id: 6, category: 'GPU', name: 'NVIDIA RTX 3060', tdp: 170, perf_score: 350, metadata_json: { recommendedPsu: 550 }, release_year: 2021 },
  { id: 7, category: 'GPU', name: 'AMD RX 7800 XT', tdp: 263, perf_score: 520, metadata_json: { recommendedPsu: 700 }, release_year: 2023 },
  { id: 8, category: 'PSU', name: 'Seasonic 550W', wattage: 550, perf_score: 100, release_year: 2021 },
  { id: 9, category: 'PSU', name: 'Corsair RM750x', wattage: 750, perf_score: 160, release_year: 2022 },
  { id: 10, category: 'STORAGE', name: 'Samsung 970 EVO Plus 1TB', storage_interface: 'NVME', perf_score: 230, release_year: 2021 },
  { id: 11, category: 'COOLER', name: 'Cooler Master Hyper 212', perf_score: 80, metadata_json: { maxTdp: 150 }, release_year: 2019 }
];

class UserModel {
  constructor(pool) {
    this.pool = pool;
  }
  async createUser({ username, email, passwordHash }) {
    const [result] = await this.pool.query('INSERT INTO users (username, email, password_hash) VALUES (?,?,?)', [
      username,
      email,
      passwordHash
    ]);
    return result.insertId;
  }
  async findByEmail(email) {
    const [rows] = await this.pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }
  async findByUsername(username) {
    const [rows] = await this.pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    return rows[0] || null;
  }
}

class ComponentModel {
  constructor(pool) {
    this.pool = pool;
  }
  async listAll() {
    const [rows] = await this.pool.query('SELECT * FROM components ORDER BY category, perf_score DESC');
    return rows;
  }
  async getByIds(ids) {
    if (!ids.length) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await this.pool.query(`SELECT * FROM components WHERE id IN (${placeholders})`, ids);
    return rows;
  }
}

class ConfigurationModel {
  constructor(pool) {
    this.pool = pool;
  }
  async saveConfiguration({ userId, title, configJson }) {
    const [result] = await this.pool.query('INSERT INTO configurations (user_id, title, config_json) VALUES (?,?,?)', [
      userId,
      title,
      JSON.stringify(configJson)
    ]);
    return result.insertId;
  }
  async listByUser(userId) {
    const [rows] = await this.pool.query(
      'SELECT id, title, config_json, created_at, updated_at FROM configurations WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    return rows.map((r) => ({ ...r, config_json: typeof r.config_json === 'string' ? JSON.parse(r.config_json) : r.config_json }));
  }
  async updateConfiguration({ id, userId, title, configJson }) {
    const fields = [];
    const params = [];
    if (title !== undefined) {
      fields.push('title = ?');
      params.push(title);
    }
    if (configJson !== undefined) {
      fields.push('config_json = ?');
      params.push(JSON.stringify(configJson));
    }
    if (!fields.length) return false;
    params.push(id, userId);
    const [result] = await this.pool.query(
      `UPDATE configurations SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );
    return result.affectedRows > 0;
  }
  async deleteConfiguration({ id, userId }) {
    const [result] = await this.pool.query('DELETE FROM configurations WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  }
}

async function bootstrap() {
  let userModel;
  let componentModel;
  let configurationModel;
  let usingFallback = false;

  try {
    await initializeDatabase();
    const pool = await getPool();
    userModel = new UserModel(pool);
    componentModel = new ComponentModel(pool);
    configurationModel = new ConfigurationModel(pool);
  } catch (error) {
    usingFallback = true;
    console.warn('DB is unavailable, switching to in-memory mode.');

    const users = [];
    const configs = [];

    userModel = {
      async createUser({ username, email, passwordHash }) {
        const id = users.length + 1;
        users.push({ id, username, email, password_hash: passwordHash });
        return id;
      },
      async findByEmail(email) {
        return users.find((x) => x.email === email) || null;
      },
      async findByUsername(username) {
        return users.find((x) => x.username === username) || null;
      }
    };

    componentModel = {
      async listAll() {
        return [...fallbackComponents].sort((a, b) => a.category.localeCompare(b.category) || b.perf_score - a.perf_score);
      },
      async getByIds(ids) {
        const set = new Set(ids.map(Number));
        return fallbackComponents.filter((x) => set.has(Number(x.id)));
      }
    };

    configurationModel = {
      async saveConfiguration({ userId, title, configJson }) {
        const id = configs.length + 1;
        configs.push({ id, user_id: userId, title, config_json: configJson, updated_at: new Date() });
        return id;
      },
      async listByUser(userId) {
        return configs
          .filter((x) => x.user_id === userId)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .map((x) => ({
            id: x.id,
            title: x.title,
            config_json: x.config_json,
            updated_at: x.updated_at
          }));
      },
      async updateConfiguration({ id, userId, title, configJson }) {
        const config = configs.find((x) => x.id === id && x.user_id === userId);
        if (!config) return false;
        if (title !== undefined) config.title = title;
        if (configJson !== undefined) config.config_json = configJson;
        config.updated_at = new Date();
        return true;
      },
      async deleteConfiguration({ id, userId }) {
        const idx = configs.findIndex((x) => x.id === id && x.user_id === userId);
        if (idx === -1) return false;
        configs.splice(idx, 1);
        return true;
      }
    };
  }

  const app = createApp({
    authService: new AuthService(userModel),
    componentModel,
    configurationModel
  });

  app.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}${usingFallback ? ' (in-memory mode)' : ''}`);
  });
}

bootstrap().catch((e) => {
  console.error('Failed to start app:', e);
  process.exit(1);
});
