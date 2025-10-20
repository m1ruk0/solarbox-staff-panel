const { MongoClient } = require('mongodb');
require('dotenv').config();

// Настройка MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'staff_management';

let client;
let db;

async function connectDB() {
  try {
    // Опции подключения для совместимости с Render и MongoDB Atlas
    const options = {
      tls: true,
      tlsAllowInvalidCertificates: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };
    
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db(dbName);
    
    console.log('✅ Подключено к MongoDB');
    
    // Создаем коллекции и индексы
    await setupCollections();
    
    return db;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    throw error;
  }
}

async function setupCollections() {
  // Коллекция персонала
  const staffCollection = db.collection('staff');
  await staffCollection.createIndex({ discord: 1 }, { unique: true });
  await staffCollection.createIndex({ minecraft: 1 });
  await staffCollection.createIndex({ position: 1 });
  await staffCollection.createIndex({ status: 1 });
  
  // Коллекция заявок
  const applicationsCollection = db.collection('applications');
  await applicationsCollection.createIndex({ discord: 1 });
  await applicationsCollection.createIndex({ status: 1 });
  await applicationsCollection.createIndex({ timestamp: -1 });
  
  // Коллекция паролей
  const passwordsCollection = db.collection('passwords');
  await passwordsCollection.createIndex({ discord: 1 }, { unique: true });
  
  console.log('✅ Индексы созданы');
}

function getDB() {
  if (!db) {
    throw new Error('База данных не подключена. Вызовите connectDB() сначала.');
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log('✅ Соединение с MongoDB закрыто');
  }
}

module.exports = {
  connectDB,
  getDB,
  closeDB
};
