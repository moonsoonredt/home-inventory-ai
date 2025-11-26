const { exec } = require('child_process');
const path = require('path');

// Запустить backend
exec(`node "${path.join(__dirname, 'backend/server.js')}"`, { cwd: __dirname }, (err) => {
  if (err) {
    console.error('Failed to start backend:', err);
  }
});

// Подождать немного, затем открыть браузер
setTimeout(() => {
  exec('start http://localhost:3001', (err) => {
    if (err) {
      console.error('Failed to open browser:', err);
    }
  });
}, 3000); // 3 секунды на запуск backend