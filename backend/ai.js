const fetch = require('node-fetch');
const db = require('./db');

async function parseText(userText, type, model = 'qwen2:1.5b') {
  // Получить locations
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM locations', [], (err, locations) => {
      if (err) return reject(err);

      const locationsStr = locations.map(loc => loc.name).join(', ');

      let prompt;
      if (type === 'item') {
        prompt = `Ты — помощник по добавлению вещей. Извлеки из текста название вещи и место хранения. Места: [${locationsStr}].
Текст: «${userText}»
Ответь в формате JSON: {"name": "название", "location": "место"}. Если место не указано, выбери подходящее.`;
      } else if (type === 'product') {
        prompt = `Ты — помощник по добавлению продуктов. Извлеки название, место, количество, единицу, дату истечения, открыто ли. Места: [${locationsStr}].
Текст: «${userText}»
Ответь в формате JSON: {"name": "название", "location": "место", "quantity": число, "unit": "единица", "expiry_date": "YYYY-MM-DD", "is_open": true/false}. Дата по умолчанию через 7 дней, если не указано.`;
      }

      fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false
        })
      })
      .then(res => res.json())
      .then(data => {
        try {
          const parsed = JSON.parse(data.response);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      })
      .catch(reject);
    });
  });
}

async function askAI(userQuery, model = 'qwen2:1.5b') {
  console.log('askAI called with query:', userQuery, 'model:', model);
  return new Promise((resolve, reject) => {
    // Получить все items
    db.all('SELECT i.name, l.name as location FROM items i JOIN locations l ON i.location_id = l.id', [], (err, items) => {
      if (err) return reject(err);

      // Получить продукты, срок которых <= сегодня + 7 дней
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      const dateStr = sevenDaysLater.toISOString().split('T')[0];

      db.all('SELECT p.name, l.name as location, p.quantity, p.unit, p.expiry_date FROM products p JOIN locations l ON p.location_id = l.id WHERE p.expiry_date <= ?', [dateStr], (err, products) => {
        if (err) return reject(err);

        // Формировать промт
        const itemsStr = items.map(item => `${item.name} — ${item.location}`).join(', ');
        const productsStr = products.map(prod => `${prod.name} — до ${prod.expiry_date}, ${prod.quantity} ${prod.unit}`).join(', ');

        // Шаг 1: Определить намерение
        const intentPrompt = `Классифицируй запрос пользователя: «${userQuery}».
Если содержит просьбу добавить вещь (item), верни {"intent": "add_item", "confidence": 1}.
Если добавить продукт (product), {"intent": "add_product", "confidence": 1}.
Иначе {"intent": "question", "confidence": 1}.
Верни только JSON без дополнительного текста.`;

        console.log('Step 1: Classifying intent...');
        fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model,
            prompt: intentPrompt,
            stream: false
          })
        })
        .then(res => res.json())
        .then(data => {
          console.log('Intent response:', data.response);
          let intentData;
          try {
            intentData = JSON.parse(data.response.match(/\{.*\}/s)[0]);
          } catch (e) {
            return resolve('Не удалось определить намерение. Пожалуйста, уточните.');
          }

          if (intentData.intent === 'question') {
            // Шаг 2: Ответить на вопрос
            const answerPrompt = `Ты — умный домашний помощник. Отвечай кратко, по делу, на русском языке.
У пользователя есть:
ВЕЩИ: [${itemsStr}]
ПРОДУКТЫ (заканчиваются в ближайшие 7 дней): [${productsStr}]
Вопрос: «${userQuery}»`;

            console.log('Step 2: Answering question...');
            return fetch('http://localhost:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: model,
                prompt: answerPrompt,
                stream: false
              })
            })
            .then(res => res.json())
            .then(data => {
              console.log('Answer response:', data.response);
              resolve(data.response);
            });
          } else if (intentData.intent.startsWith('add_')) {
            // Шаг 2: Извлечь данные для добавления
            const type = intentData.intent === 'add_item' ? 'item' : 'product';
            const extractPrompt = `Извлеки данные из запроса: «${userQuery}».
Верни только JSON: {"type": "${type}", "name": "название", "location": "место"${type === 'product' ? ', "quantity": число, "unit": "ед", "expiry_date": "YYYY-MM-DD"' : ''}}.
Для даты истечения используй ${dateStr}, если не указано.`;

            console.log('Step 2: Extracting data...');
            return fetch('http://localhost:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: model,
                prompt: extractPrompt,
                stream: false
              })
            })
            .then(res => res.json())
            .then(data => {
              console.log('Extract response:', data.response);
              resolve(data.response);
            });
          } else {
            // Неясно, попросить уточнить
            resolve('Пожалуйста, уточните: вы хотите добавить вещь/продукт или задать вопрос?');
          }
        })
        .catch(err => {
          console.error('Ollama error:', err.message);
          reject(err);
        });
      });
    });
  });
}

module.exports = { askAI, parseText };