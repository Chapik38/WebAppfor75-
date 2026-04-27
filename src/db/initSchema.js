const { getPool } = require('../config/db');

const schema = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS components (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('CPU','MOTHERBOARD','RAM','GPU','PSU','STORAGE','COOLER') NOT NULL,
    name VARCHAR(120) NOT NULL,
    socket VARCHAR(30),
    ram_type VARCHAR(20),
    storage_interface VARCHAR(20),
    tdp INT,
    wattage INT,
    perf_score INT DEFAULT 0,
    release_year INT,
    metadata_json JSON
  )`,
  `CREATE TABLE IF NOT EXISTS configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(120) NOT NULL,
    config_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`
];

const seed = [
  ['CPU', 'AMD Ryzen 5 5600', 'AM4', null, null, 65, null, 260, 2020, JSON.stringify({ cores: 6 })],
  ['CPU', 'Intel Core i5-12400F', 'LGA1700', null, null, 65, null, 280, 2022, JSON.stringify({ cores: 6 })],
  ['MOTHERBOARD', 'MSI B550 Tomahawk', 'AM4', 'DDR4', 'SATA/NVME', null, null, 180, 2021, JSON.stringify({})],
  ['MOTHERBOARD', 'ASUS PRIME B660M-A', 'LGA1700', 'DDR4', 'SATA/NVME', null, null, 170, 2022, JSON.stringify({})],
  ['RAM', 'Corsair Vengeance 16GB', null, 'DDR4', null, null, null, 110, 2021, JSON.stringify({ speedMhz: 3200 })],
  ['GPU', 'NVIDIA RTX 3060', null, null, null, 170, null, 350, 2021, JSON.stringify({ recommendedPsu: 550 })],
  ['GPU', 'AMD RX 7800 XT', null, null, null, 263, null, 520, 2023, JSON.stringify({ recommendedPsu: 700 })],
  ['PSU', 'Seasonic 550W', null, null, null, null, 550, 100, 2021, JSON.stringify({})],
  ['PSU', 'Corsair RM750x', null, null, null, null, 750, 160, 2022, JSON.stringify({})],
  ['STORAGE', 'Samsung 970 EVO Plus 1TB', null, null, 'NVME', null, null, 230, 2021, JSON.stringify({})],
  ['COOLER', 'Cooler Master Hyper 212', null, null, null, null, null, 80, 2019, JSON.stringify({ maxTdp: 150 })]
];

async function initializeDatabase() {
  const pool = await getPool();
  for (const q of schema) {
    await pool.query(q);
  }
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM components');
  if (rows[0].count === 0) {
    const sql = 'INSERT INTO components (category,name,socket,ram_type,storage_interface,tdp,wattage,perf_score,release_year,metadata_json) VALUES (?,?,?,?,?,?,?,?,?,?)';
    for (const row of seed) {
      await pool.query(sql, row);
    }
  }
}

module.exports = { initializeDatabase };
