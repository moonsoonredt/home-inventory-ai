const nw = require('nw');
const backendApp = require('./backend/server');

backendApp.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
  nw.Window.open('frontend/dist/index.html');
});