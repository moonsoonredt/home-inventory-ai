const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'home_inventory.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Таблица locations
  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      FOREIGN KEY (parent_id) REFERENCES locations (id)
    )
  `);

  // Таблица items
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location_id INTEGER,
      last_moved DATE DEFAULT CURRENT_DATE,
      FOREIGN KEY (location_id) REFERENCES locations (id)
    )
  `);

  // Таблица products
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location_id INTEGER,
      quantity REAL,
      unit TEXT,
      expiry_date DATE,
      is_open BOOLEAN DEFAULT 0,
      FOREIGN KEY (location_id) REFERENCES locations (id)
    )
  `);

  // Вставить начальные locations, если пусто
  db.get('SELECT COUNT(*) as count FROM locations', [], (err, row) => {
    if (err) return;
    if (row.count === 0) {
      const locations = ['спальня', 'кухня', 'холодильник', 'кладовка', 'ящик стола'];
      locations.forEach(name => {
        db.run('INSERT INTO locations (name) VALUES (?)', [name]);
      });
    }
  });
});

module.exports = db;