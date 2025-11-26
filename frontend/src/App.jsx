import { useState, useEffect, useRef } from 'react';
import './index.css';

const translations = {
  ru: {
    title: 'Домашний инвентарь с ИИ',
    langSwitch: 'EN',
    menu: {
      instructions: 'Инструкция по установке',
      ai: 'Беседа с ИИ',
      add: 'Добавление вещей и продуктов',
      locations: 'Управление местами',
      database: 'Просмотреть БД'
    },
    instructions: {
      title: 'Инструкция по установке и запуску',
      ollama: {
        title: '1. Установка Ollama',
        text1: '1.1 Перейдите на сайт ',
        text2: ' и нажмите кнопку «Download».',
        text3: '1.2 Выберите файл под Windows/macOS/Linux и установите его как обычную программу.',
        text4: '1.3 После установки Ollama запустится автоматически и свернётся в трей (иконка значка «О»).',
        check: 'Проверьте, что сервер работает',
        checkText: 'Откройте браузер и введите адрес: ',
        running: 'Если вы видите надпись «Ollama is running», значит всё в порядке.',
        app: 'Зайдите в приложение и в списке моделей выберите нужную. Список моделей находится возле поля ввода текста.'
      },
      assemblyai: {
        title: '2. Получение API ключа AssemblyAI',
        text: 'Зарегистрируйтесь на ',
        text2: ' и получите бесплатный API ключ.'
      },
      env: {
        title: '3. Настройка API ключа',
        text: 'Введите ваш API ключ AssemblyAI ниже и нажмите "Сохранить". Ключ будет записан в файл настроек для работы приложения.',
        placeholder: 'Введите API ключ AssemblyAI',
        save: 'Сохранить API ключ'
      },
      run: {
        title: '4. Запуск desktop-приложения',
        text: 'Скачайте и запустите установщик приложения для вашей ОС. После запуска введите API ключ AssemblyAI в настройках приложения, если требуется. Ollama и модель должны быть установлены предварительно.'
      }
    },
    ai: {
      title: 'Беседа с ИИ',
      modelSelect: 'Выберите модель ИИ: ',
      updateModels: 'Обновить список моделей',
      input: 'Задайте вопрос (Enter - отправить, Ctrl+Enter - новая строка)',
      record: '🎤',
      stop: 'Остановить запись',
      ask: 'Спросить',
      processing: 'Обрабатывается...',
      fragment: 'Фрагмент записан, обрабатывается...',
      answer: 'Ответ:',
      history: 'История бесед',
      dialogs: 'Диалоги',
      details: 'Детали диалога',
      question: 'Вопрос:',
      response: 'Ответ:',
      empty: 'История пуста'
    },
    add: {
      title: 'Добавление вещей и продуктов',
      item: {
        title: 'Добавить вещь',
        name: 'Название вещи',
        location: 'Выберите место',
        add: 'Добавить',
        record: '🎤',
        stop: 'Остановить',
        processing: 'Распознавание речи и анализ...'
      },
      product: {
        title: 'Добавить продукт',
        name: 'Название продукта',
        askAI: 'Спросить ИИ о сроке годности',
        aiResponse: 'Ответ ИИ:',
        aiNote: 'ИИ может ошибаться в зависимости от выбранной модели.',
        location: 'Выберите место',
        quantity: 'Количество',
        unit: 'Единица (шт, кг, л)',
        date: 'Дата истечения',
        open: 'Открыт',
        add: 'Добавить'
      },
      expiring: {
        title: 'Скоро испортится'
      }
    },
    locations: {
      title: 'Управление местами',
      name: 'Название места (гараж, сарай и т.д.)',
      parent: 'Родительское место (опционально)',
      add: 'Добавить место',
      current: 'Текущие места'
    },
    database: {
      title: 'База данных',
      stats: 'Статистика',
      items: 'Всего вещей:',
      products: 'Всего продуктов:',
      expiring: 'Истекающих продуктов:',
      itemsTitle: 'Вещи',
      productsTitle: 'Продукты',
      edit: 'Редактировать срок'
    },
    confirm: {
      title: 'Подтвердите добавление',
      name: 'Название:',
      location: 'Место:',
      quantity: 'Количество:',
      expiry: 'Дата истечения:',
      open: 'Открыт:',
      confirm: 'Подтвердить',
      cancel: 'Отменить'
    },
    edit: {
      title: 'Редактировать срок годности',
      product: 'Продукт:',
      save: 'Сохранить',
      cancel: 'Отменить'
    },
    yes: 'Да',
    no: 'Нет',
    error: {
      recognition: 'Ошибка распознавания: ',
      ai: 'Ошибка при запросе к ИИ.',
      audio: 'Ошибка при отправке аудио.',
      saveApi: 'Ошибка сохранения API ключа',
      saveApiSuccess: 'API ключ сохранен успешно',
      saveApiError: 'Ошибка сохранения API ключа: ',
      emptyQuery: 'Введите вопрос',
      emptyProduct: 'Введите название продукта',
      expiryError: 'Ошибка получения ответа от ИИ',
      tryAgain: 'попробуйте еще раз.'
    }
  },
  en: {
    title: 'Home Inventory with AI',
    langSwitch: 'RU',
    menu: {
      instructions: 'Installation Guide',
      ai: 'AI Chat',
      add: 'Add Items and Products',
      locations: 'Manage Locations',
      database: 'View Database'
    },
    instructions: {
      title: 'Installation and Launch Guide',
      ollama: {
        title: '1. Install Ollama',
        text1: '1.1 Go to the website ',
        text2: ' and click the "Download" button.',
        text3: '1.2 Choose the file for Windows/macOS/Linux and install it like a regular program.',
        text4: '1.3 After installation, Ollama will start automatically and minimize to the tray (icon "O").',
        check: 'Check that the server is running',
        checkText: 'Open your browser and enter the address: ',
        running: 'If you see the message "Ollama is running", everything is fine.',
        app: 'Enter the application and select the desired model from the list. The model list is located next to the text input field.'
      },
      assemblyai: {
        title: '2. Get AssemblyAI API Key',
        text: 'Register on ',
        text2: ' and get a free API key.'
      },
      env: {
        title: '3. Configure API Key',
        text: 'Enter your AssemblyAI API key below and click "Save". The key will be written to the settings file for the application to work.',
        placeholder: 'Enter AssemblyAI API key',
        save: 'Save API Key'
      },
      run: {
        title: '4. Launch Desktop Application',
        text: 'Download and run the application installer for your OS. After launch, enter the AssemblyAI API key in the application settings if required. Ollama and the model must be installed in advance.'
      }
    },
    ai: {
      title: 'AI Chat',
      modelSelect: 'Select AI model: ',
      updateModels: 'Update model list',
      input: 'Ask a question (Enter - send, Ctrl+Enter - new line)',
      record: '🎤',
      stop: 'Stop recording',
      ask: 'Ask',
      processing: 'Processing...',
      fragment: 'Fragment recorded, processing...',
      answer: 'Answer:',
      history: 'Conversation History',
      dialogs: 'Dialogs',
      details: 'Dialog Details',
      question: 'Question:',
      response: 'Response:',
      empty: 'History is empty'
    },
    add: {
      title: 'Adding Items and Products',
      item: {
        title: 'Add Item',
        name: 'Item name',
        location: 'Select location',
        add: 'Add',
        record: '🎤',
        stop: 'Stop',
        processing: 'Speech recognition and analysis...'
      },
      product: {
        title: 'Add Product',
        name: 'Product name',
        askAI: 'Ask AI about expiry date',
        aiResponse: 'AI Response:',
        aiNote: 'AI may make mistakes depending on the selected model.',
        location: 'Select location',
        quantity: 'Quantity',
        unit: 'Unit (pcs, kg, l)',
        date: 'Expiry date',
        open: 'Open',
        add: 'Add'
      },
      expiring: {
        title: 'Expiring Soon'
      }
    },
    locations: {
      title: 'Manage Locations',
      name: 'Location name (garage, shed, etc.)',
      parent: 'Parent location (optional)',
      add: 'Add location',
      current: 'Current locations'
    },
    database: {
      title: 'Database',
      stats: 'Statistics',
      items: 'Total items:',
      products: 'Total products:',
      expiring: 'Expiring products:',
      itemsTitle: 'Items',
      productsTitle: 'Products',
      edit: 'Edit expiry'
    },
    confirm: {
      title: 'Confirm addition',
      name: 'Name:',
      location: 'Location:',
      quantity: 'Quantity:',
      expiry: 'Expiry date:',
      open: 'Open:',
      confirm: 'Confirm',
      cancel: 'Cancel'
    },
    edit: {
      title: 'Edit expiry date',
      product: 'Product:',
      save: 'Save',
      cancel: 'Cancel'
    },
    yes: 'Yes',
    no: 'No',
    error: {
      recognition: 'Recognition error: ',
      ai: 'Error requesting AI.',
      audio: 'Error sending audio.',
      saveApi: 'Error saving API key',
      saveApiSuccess: 'API key saved successfully',
      saveApiError: 'Error saving API key: ',
      emptyQuery: 'Enter a question',
      emptyProduct: 'Enter product name',
      expiryError: 'Error getting AI response',
      tryAgain: 'try again.'
    }
  }
};

function App() {
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiHistory, setAiHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isProcessingSpeechAI, setIsProcessingSpeechAI] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState('');
  const [activeSection, setActiveSection] = useState('instructions');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('qwen2:1.5b');
  const [expirySuggestion, setExpirySuggestion] = useState('');
  const [productName, setProductName] = useState('');
  const [language, setLanguage] = useState('ru');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchLocations();
    fetchItems();
    fetchProducts();
    fetchExpiringProducts();
    // Загрузить историю из localStorage
    const savedHistory = localStorage.getItem('aiHistory');
    if (savedHistory) {
      setAiHistory(JSON.parse(savedHistory));
    }
    // Загрузить модели Ollama
    fetchOllamaModels();
  }, []);

  useEffect(() => {
    // Сохранить историю в localStorage
    localStorage.setItem('aiHistory', JSON.stringify(aiHistory));
  }, [aiHistory]);

  const fetchLocations = async () => {
    const res = await fetch('/api/locations');
    const data = await res.json();
    setLocations(data);
  };

  const addLocation = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const parent_id = formData.get('parent_id') || null;
    await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parent_id })
    });
    fetchLocations();
    e.target.reset();
  };

  const fetchItems = async () => {
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data);
  };

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const fetchExpiringProducts = async () => {
    const res = await fetch('/api/products/expiring');
    const data = await res.json();
    setExpiringProducts(data);
  };

  const fetchOllamaModels = async () => {
    try {
      const res = await fetch('/api/ollama-models');
      const data = await res.json();
      console.log('Fetched models:', data);
      if (data.length === 0) {
        // Дефолтные модели, если не загружены
        setOllamaModels([{ name: 'qwen2:1.5b' }, { name: 'qwen2:0.5b' }, { name: 'llama3.2:1b' }]);
      } else {
        setOllamaModels(data);
      }
    } catch (err) {
      console.error('Error fetching Ollama models:', err);
      // Дефолтные модели при ошибке
      setOllamaModels([{ name: 'qwen2:1.5b' }, { name: 'qwen2:0.5b' }, { name: 'llama3.2:1b' }]);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const location_id = formData.get('location_id');
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location_id })
    });
    fetchItems();
    e.target.reset();
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const location_id = formData.get('location_id');
    const quantity = formData.get('quantity');
    const unit = formData.get('unit');
    const expiry_date = formData.get('expiry_date');
    const is_open = formData.get('is_open') ? 1 : 0;
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location_id, quantity, unit, expiry_date, is_open })
    });
    fetchProducts();
    fetchExpiringProducts();
    e.target.reset();
  };

  const updateProductExpiry = async () => {
    if (!editingProduct || !editExpiryDate) return;
    await fetch(`/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiry_date: editExpiryDate })
    });
    fetchProducts();
    fetchExpiringProducts();
    setEditingProduct(null);
    setEditExpiryDate('');
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setEditExpiryDate(product.expiry_date);
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditExpiryDate('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudio = async (audioBlob) => {
    setIsProcessingSpeechAI(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      console.log('Sending audio to server...');
      const res = await fetch('/api/speech', {
        method: 'POST',
        body: formData
      });
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      if (data.error) {
        alert(translations[language].error.recognition + data.error);
        return;
      }
      const transcription = data.transcription.trim();
      console.log('Transcription:', transcription);
      if (!transcription) {
        alert(translations[language].error.recognition + ' ' + translations[language].error.tryAgain);
        return;
      }
      console.log('Calling askAI with:', transcription);
      try {
        await askAI(transcription); // Автоматически отправить запрос
        console.log('askAI completed');
      } catch (err) {
        console.error('Error asking AI:', err);
        alert(translations[language].error.ai);
      }
    } catch (err) {
      console.error('Error sending audio:', err);
      alert(translations[language].error.audio);
    } finally {
      setIsProcessingSpeechAI(false);
    }
  };

  const handleVoiceAdd = async (type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessingVoice(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoice(audioBlob, type);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const processVoice = async (audioBlob, type) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const speechRes = await fetch('/api/speech', {
        method: 'POST',
        body: formData
      });
      const speechData = await speechRes.json();
      const transcription = speechData.transcription;

      const parseRes = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription, type, model: selectedModel })
      });
      const parsed = await parseRes.json();

      setParsedData(parsed);
      setConfirmType(type);
      setShowConfirm(true);
      setIsRecording(false);
      setIsProcessingVoice(false);
    } catch (err) {
      console.error('Error processing voice:', err);
      setIsRecording(false);
      setIsProcessingVoice(false);
    }
  };

  const confirmAdd = async () => {
    if (confirmType === 'item') {
      const location = locations.find(loc => loc.name === parsedData.location);
      if (location) {
        await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: parsedData.name, location_id: location.id })
        });
        fetchItems();
      }
    } else if (confirmType === 'product') {
      const location = locations.find(loc => loc.name === parsedData.location);
      if (location) {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: parsedData.name,
            location_id: location.id,
            quantity: parsedData.quantity,
            unit: parsedData.unit,
            expiry_date: parsedData.expiry_date,
            is_open: parsedData.is_open ? 1 : 0
          })
        });
        fetchProducts();
        fetchExpiringProducts();
      }
    }
    setShowConfirm(false);
    setParsedData(null);
  };

  const cancelAdd = () => {
    setShowConfirm(false);
    setParsedData(null);
  };

  const saveApiKey = async () => {
    try {
      const res = await fetch('/api/save-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      const data = await res.json();
      if (res.ok) {
        alert(translations[language].error.saveApiSuccess);
      } else {
        alert(translations[language].error.saveApiError + data.error);
      }
    } catch (err) {
      console.error('Error saving API key:', err);
      alert(translations[language].error.saveApi);
    }
  };

  const askExpiry = async () => {
    if (!productName.trim()) {
      alert(translations[language].error.emptyProduct);
      return;
    }
    const query = `Какой типичный срок годности у продукта "${productName}"? Ответь кратко, в днях или месяцах.`;
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, model: selectedModel })
      });
      const data = await res.json();
      setExpirySuggestion(data.response);
    } catch (err) {
      console.error('Error asking expiry:', err);
      setExpirySuggestion('Ошибка получения ответа от ИИ');
    }
  };


  const askAI = async (query = aiQuery) => {
    console.log('askAI called with query:', query);
    if (!query.trim()) {
      alert(translations[language].error.emptyQuery);
      return;
    }
    console.log('Asking AI with query:', query, 'model:', selectedModel);
    setIsAiLoading(true);
    try {
      console.log('Sending fetch to /api/ai');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 сек timeout
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, model: selectedModel }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log('Fetch response status:', res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log('Response data:', data);
      const response = data.response;
      console.log('AI response:', response);

      // Проверить, содержит ли ответ JSON для добавления
      const jsonMatch = response.match(/\{.*\}/s);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.type === 'item' || parsed.type === 'product') {
            setParsedData(parsed);
            setConfirmType(parsed.type);
            setShowConfirm(true);
            setAiResponse('Предлагаю добавить: ' + (parsed.type === 'item' ? parsed.name : parsed.name + ' (' + parsed.quantity + ' ' + parsed.unit + ')'));
            setAiHistory([...aiHistory, { query, response: 'Предлагаю добавить: ' + (parsed.type === 'item' ? parsed.name : parsed.name + ' (' + parsed.quantity + ' ' + parsed.unit + ')') }]);
            setAiQuery('');
            setIsAiLoading(false);
            return;
          }
        } catch (e) {
          console.log('Not a valid JSON for add');
        }
      }

      setAiResponse(response);
      setAiHistory([...aiHistory, { query, response }]);
      setAiQuery('');
    } catch (err) {
      console.error('Error asking AI:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>{translations[language].title} <button onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} style={{ fontSize: '14px', padding: '4px 8px' }}>{translations[language].langSwitch}</button></h1>
      <div className="menu">
        <button className={activeSection === 'instructions' ? 'active' : ''} onClick={() => setActiveSection('instructions')}>{translations[language].menu.instructions}</button>
        <button className={activeSection === 'ai' ? 'active' : ''} onClick={() => setActiveSection('ai')}>{translations[language].menu.ai}</button>
        <button className={activeSection === 'add' ? 'active' : ''} onClick={() => setActiveSection('add')}>{translations[language].menu.add}</button>
        <button className={activeSection === 'locations' ? 'active' : ''} onClick={() => setActiveSection('locations')}>{translations[language].menu.locations}</button>
        <button className={activeSection === 'database' ? 'active' : ''} onClick={() => setActiveSection('database')}>{translations[language].menu.database}</button>
      </div>


      {activeSection === 'instructions' && (
        <div className="section">
          <h2>{translations[language].instructions.title}</h2>
          <h3>{translations[language].instructions.ollama.title}</h3>
          <p>1.1 {translations[language].instructions.ollama.text1}<a href="https://ollama.ai/" target="_blank" rel="noopener noreferrer">ollama.ai</a>{translations[language].instructions.ollama.text2}</p>
          <p>1.2 {translations[language].instructions.ollama.text3}</p>
          <p>1.3 {translations[language].instructions.ollama.text4}</p>
          <h4>{translations[language].instructions.ollama.check}</h4>
          <p>{translations[language].instructions.ollama.checkText}<a href="http://localhost:11434" target="_blank" rel="noopener noreferrer">http://localhost:11434</a></p>
          <p>{translations[language].instructions.ollama.running}</p>
          <img src="/img/Скриншот1.jpg" alt="Скриншот установки Ollama" style={{ maxWidth: '100%', height: 'auto' }} />
          <p>{translations[language].instructions.ollama.app}</p>

          <h3>{translations[language].instructions.assemblyai.title}</h3>
          <p>{translations[language].instructions.assemblyai.text}<a href="https://www.assemblyai.com/" target="_blank" rel="noopener noreferrer">assemblyai.com</a>{translations[language].instructions.assemblyai.text2}</p>

          <h3>{translations[language].instructions.env.title}</h3>
          <p>{translations[language].instructions.env.text}</p>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={translations[language].instructions.env.placeholder}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button onClick={saveApiKey} style={{ padding: '8px 16px' }}>{translations[language].instructions.env.save}</button>
          <img src="/img/2.jpg" alt="Скриншот настройки API ключа" style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }} />

          <h3>{translations[language].instructions.run.title}</h3>
          <p>{translations[language].instructions.run.text}</p>
        </div>
      )}

      {activeSection === 'ai' && (
        <div className="section">
          <h2>{translations[language].ai.title}</h2>
          <div style={{ marginBottom: '10px' }}>
            <label>{translations[language].ai.modelSelect}</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
              {ollamaModels.length > 0 ? ollamaModels.map(model => (
                <option key={model.name} value={model.name}>{model.name}</option>
              )) : (
                <option disabled>{translations[language].ai.updateModels}</option>
              )}
            </select>
            <button onClick={fetchOllamaModels} style={{ marginLeft: '10px' }}>{translations[language].ai.updateModels}</button>
          </div>
          <textarea
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.ctrlKey) {
                e.preventDefault();
                askAI();
              }
            }}
            placeholder={translations[language].ai.input}
            rows="3"
            style={{ width: '100%', resize: 'vertical' }}
          />
          <button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? translations[language].ai.stop : translations[language].ai.record}
          </button>
          <button onClick={() => askAI()} disabled={isAiLoading || isProcessingSpeechAI}>
            {isAiLoading || isProcessingSpeechAI ? translations[language].ai.processing : translations[language].ai.ask}
          </button>
          {isProcessingSpeechAI && <p>{translations[language].ai.fragment}</p>}
          {aiResponse && <p><strong>{translations[language].ai.answer}</strong> {aiResponse}</p>}
          <div className="history">
            <h3>{translations[language].ai.history}</h3>
            {aiHistory.length > 0 ? (
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <h4>{translations[language].ai.dialogs}</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {aiHistory.map((entry, idx) => (
                      <li key={idx} style={{ marginBottom: '5px' }}>
                        <button
                          onClick={() => setCurrentHistoryIndex(idx)}
                          style={{
                            background: currentHistoryIndex === idx ? '#007bff' : '#f0f0f0',
                            color: currentHistoryIndex === idx ? 'white' : 'black',
                            border: '1px solid #ccc',
                            padding: '8px',
                            width: '100%',
                            textAlign: 'left',
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                        >
                          {entry.query.length > 20 ? entry.query.substring(0, 20) + '...' : entry.query}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ flex: 2 }}>
                  <h4>{translations[language].ai.details}</h4>
                  <p><strong>{translations[language].ai.question}</strong> {aiHistory[currentHistoryIndex].query}</p>
                  <p><strong>{translations[language].ai.response}</strong> {aiHistory[currentHistoryIndex].response}</p>
                </div>
              </div>
            ) : (
              <p>{translations[language].ai.empty}</p>
            )}
          </div>
        </div>
      )}

      {activeSection === 'add' && (
        <div className="section">
          <h2>{translations[language].add.title}</h2>
          <div className="subsection">
            <h3>{translations[language].add.item.title}</h3>
            <form onSubmit={addItem}>
              <input name="name" placeholder={translations[language].add.item.name} required />
              <select name="location_id" required>
                <option value="">{translations[language].add.item.location}</option>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button type="submit">{translations[language].add.item.add}</button>
                <button type="button" onClick={isRecording ? stopRecording : () => handleVoiceAdd('item')} disabled={isProcessingVoice}>
                  {isRecording ? translations[language].add.item.stop : isProcessingVoice ? translations[language].add.item.processing : translations[language].add.item.record}
                </button>
                {isProcessingVoice && <span>{translations[language].add.item.processing}</span>}
              </div>
            </form>
          </div>

          <div className="subsection">
            <h3>{translations[language].add.product.title}</h3>
            <form onSubmit={addProduct}>
              <input name="name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={translations[language].add.product.name} required />
              <button type="button" onClick={askExpiry} style={{ marginLeft: '10px' }}>{translations[language].add.product.askAI}</button>
              {expirySuggestion && <p><strong>{translations[language].add.product.aiResponse}</strong> {expirySuggestion}</p>}
              <p style={{ fontSize: '12px', color: 'gray' }}>{translations[language].add.product.aiNote}</p>
              <select name="location_id" required>
                <option value="">{translations[language].add.product.location}</option>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
              <input name="quantity" type="number" placeholder={translations[language].add.product.quantity} required />
              <input name="unit" placeholder={translations[language].add.product.unit} required />
              <input name="expiry_date" type="date" defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} required />
              <label><input name="is_open" type="checkbox" /> {translations[language].add.product.open}</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button type="submit">{translations[language].add.product.add}</button>
                <button type="button" onClick={isRecording ? stopRecording : () => handleVoiceAdd('product')} disabled={isProcessingVoice}>
                  {isRecording ? translations[language].add.product.stop : isProcessingVoice ? translations[language].add.product.processing : translations[language].add.product.record}
                </button>
                {isProcessingVoice && <span>{translations[language].add.product.processing}</span>}
              </div>
            </form>
          </div>

          <div className="subsection">
            <h3>{translations[language].add.expiring.title}</h3>
            <ul>
              {expiringProducts.map(prod => (
                <li key={prod.id}>{prod.name} — {prod.location}, до {prod.expiry_date}, {prod.quantity} {prod.unit}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeSection === 'database' && (
        <div className="section">
          <h2>{translations[language].database.title}</h2>
          <div style={{ marginBottom: '20px' }}>
            <h3>{translations[language].database.stats}</h3>
            <p>{translations[language].database.items} {items.length}</p>
            <p>{translations[language].database.products} {products.length}</p>
            <p>{translations[language].database.expiring} {expiringProducts.length}</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h3>{translations[language].database.itemsTitle}</h3>
              <ul>
                {items.map(item => (
                  <li key={item.id}>{item.name} — {item.location}</li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <h3>{translations[language].database.productsTitle}</h3>
              <ul>
                {products.map(prod => (
                  <li key={prod.id}>
                    {prod.name} — {prod.location}, {prod.quantity} {prod.unit}, до {prod.expiry_date}, {prod.is_open ? translations[language].yes : translations[language].no}
                    <button onClick={() => startEditing(prod)} style={{ marginLeft: '10px' }}>{translations[language].database.edit}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'locations' && (
        <div className="section">
          <h2>{translations[language].locations.title}</h2>
          <form onSubmit={addLocation}>
            <input name="name" placeholder={translations[language].locations.name} required />
            <select name="parent_id">
              <option value="">{translations[language].locations.parent}</option>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
            <button type="submit">{translations[language].locations.add}</button>
          </form>
          <h3>{translations[language].locations.current}</h3>
          <ul>
            {locations.map(loc => (
              <li key={loc.id}>{loc.name} {loc.parent_id && `(в ${locations.find(p => p.id === loc.parent_id)?.name})`}</li>
            ))}
          </ul>
        </div>
      )}

      {showConfirm && (
        <div className="confirm-modal">
          <h3>{translations[language].confirm.title}</h3>
          {confirmType === 'item' && (
            <div>
              <p>{translations[language].confirm.name} {parsedData.name}</p>
              <p>{translations[language].confirm.location} {parsedData.location}</p>
            </div>
          )}
          {confirmType === 'product' && (
            <div>
              <p>{translations[language].confirm.name} {parsedData.name}</p>
              <p>{translations[language].confirm.location} {parsedData.location}</p>
              <p>{translations[language].confirm.quantity} {parsedData.quantity} {parsedData.unit}</p>
              <p>{translations[language].confirm.expiry} {parsedData.expiry_date}</p>
              <p>{translations[language].confirm.open} {parsedData.is_open ? translations[language].yes : translations[language].no}</p>
            </div>
          )}
          <button onClick={confirmAdd}>{translations[language].confirm.confirm}</button>
          <button onClick={cancelAdd}>{translations[language].confirm.cancel}</button>
        </div>
      )}

      {editingProduct && (
        <div className="confirm-modal">
          <h3>{translations[language].edit.title}</h3>
          <p>{translations[language].edit.product} {editingProduct.name}</p>
          <input
            type="date"
            value={editExpiryDate}
            onChange={(e) => setEditExpiryDate(e.target.value)}
          />
          <button onClick={updateProductExpiry}>{translations[language].edit.save}</button>
          <button onClick={cancelEditing}>{translations[language].edit.cancel}</button>
        </div>
      )}
    </div>
  );
}

export default App;