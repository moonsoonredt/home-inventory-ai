const fetch = require('node-fetch');
const db = require('./db');

async function parseText(userText, type, model = 'qwen2:1.5b', alternative = false, variant = 0) {
  // Получить locations
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM locations', [], (err, locations) => {
      if (err) return reject(err);

      const locationsStr = locations.map(loc => loc.name).join(', ');

      let prompts;
      if (type === 'item') {
        prompts = [
          `Текст: "${userText}". Места: ${locationsStr}.
Найди все отдельные предметы для добавления. Раздели по "и", запятым. Не объединяй в один предмет.
Пример: "добавь яблоко и грушу в спальню" -> [{"name": "яблоко", "location": "спальню"}, {"name": "грушу", "location": "спальню"}].
Верни JSON {"items": [{"name": "вещь", "location": "место"}]}.`,
          `Текст: "${userText}". Места: ${locationsStr}.
Перечисли отдельные предметы. Раздели по "и", запятым. Каждый предмет отдельно.
Пример: "яблоко и грушу в спальню" -> [{"name": "яблоко", "location": "спальню"}, {"name": "грушу", "location": "спальню"}].
Верни {"items": массив}.`,
          `Текст: "${userText}". Места: ${locationsStr}.
Найди предметы, раздели на список. Не объединяй.
Пример: "добавь книгу, ручку в гостиную" -> [{"name": "книга", "location": "гостиную"}, {"name": "ручка", "location": "гостиную"}].
Верни JSON {"items": [...]} .`,
          `Текст: "${userText}". Места: ${locationsStr}.
Раздели на отдельные вещи по разделителям. Прикрепи место.
Пример: "флешку и микрофон в спальню" -> [{"name": "флешку", "location": "спальню"}, {"name": "микрофон", "location": "спальню"}].
Верни {"items": массив}.`
        ];
      } else if (type === 'product') {
        prompts = [
          `Текст: "${userText}". Места: ${locationsStr}.
Найди отдельные продукты. Раздели по "и", запятым. Каждый продукт отдельно.
Пример: "добавь молоко и хлеб на кухню" -> [{"name": "молоко", "location": "кухню"}, {"name": "хлеб", "location": "кухню"}].
Верни {"products": [{"name": "...", "location": "...", "quantity": 1, "unit": "шт", "expiry_date": "2025-12-03", "is_open": false}]}`,
          `Текст: "${userText}". Места: ${locationsStr}.
Перечисли продукты отдельно. Раздели по разделителям.
Пример: "яблоко и грушу в холодильник" -> [{"name": "яблоко", "location": "холодильник"}, {"name": "грушу", "location": "холодильник"}].
Верни JSON {"products": [...]} .`,
          `Текст: "${userText}". Места: ${locationsStr}.
Найди продукты, раздели на список. Не объединяй.
Пример: "добавь сыр, колбасу" -> [{"name": "сыр", "location": "кухня"}, {"name": "колбасу", "location": "кухня"}].
Верни {"products": массив}.`,
          `Текст: "${userText}". Места: ${locationsStr}.
Раздели на отдельные продукты по "и", запятым. Прикрепи место.
Пример: "молоко и хлеб на кухню" -> [{"name": "молоко", "location": "кухню"}, {"name": "хлеб", "location": "кухню"}].
Верни {"products": массив}.`
        ];
      }
      let prompt = alternative ? prompts[variant] : prompts[0];

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
        console.log('AI response:', data.response);
        try {
          const parsed = JSON.parse(data.response);
          console.log('Parsed JSON:', parsed);
          resolve(parsed);
        } catch (e) {
          console.error('JSON parse error:', e);
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