const { exec } = require('child_process');
const path = require('path');

// Запустить backend
const backendProcess = require('child_process').fork(path.join(__dirname, 'backend/server.js'), [], {
  cwd: __dirname,
  stdio: 'inherit',
});

// Подождать немного, затем открыть браузер
setTimeout(() => {
  exec('start http://localhost:3001', (err) => {
    if (err) {
      console.error('Failed to open browser:', err);
    }
  });
}, 2000); // 2 секунды на запуск backend