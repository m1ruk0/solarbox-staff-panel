const { getDB } = require('./mongodb-setup');
const crypto = require('crypto');

class PasswordsDatabaseMongo {
  constructor() {
    this.collectionName = 'passwords';
  }

  getCollection() {
    return getDB().collection(this.collectionName);
  }

  // Хеширование пароля
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // Добавить пользователя
  async addUser(discord, password, question, answer) {
    try {
      const hashedPassword = this.hashPassword(password);
      const hashedAnswer = this.hashPassword(answer.toLowerCase());

      const result = await this.getCollection().insertOne({
        discord,
        password: hashedPassword,
        question,
        answer: hashedAnswer,
        createdAt: new Date()
      });

      console.log(`✅ Пользователь ${discord} добавлен`);
      return result.acknowledged;
    } catch (error) {
      if (error.code === 11000) {
        console.error('❌ Пользователь уже существует');
        return false;
      }
      console.error('Ошибка добавления пользователя:', error);
      return false;
    }
  }

  // Проверить пароль
  async verifyPassword(discord, password) {
    try {
      const user = await this.getCollection().findOne({
        discord: { $regex: new RegExp(`^${discord}$`, 'i') }
      });

      if (!user) return false;

      const hashedPassword = this.hashPassword(password);
      return user.password === hashedPassword;
    } catch (error) {
      console.error('Ошибка проверки пароля:', error);
      return false;
    }
  }

  // Получить секретный вопрос
  async getSecurityQuestion(discord) {
    try {
      const user = await this.getCollection().findOne(
        { discord: { $regex: new RegExp(`^${discord}$`, 'i') } },
        { projection: { question: 1 } }
      );

      return user ? user.question : null;
    } catch (error) {
      console.error('Ошибка получения вопроса:', error);
      return null;
    }
  }

  // Проверить ответ на секретный вопрос
  async verifySecurityAnswer(discord, answer) {
    try {
      const user = await this.getCollection().findOne({
        discord: { $regex: new RegExp(`^${discord}$`, 'i') }
      });

      if (!user) return false;

      const hashedAnswer = this.hashPassword(answer.toLowerCase());
      return user.answer === hashedAnswer;
    } catch (error) {
      console.error('Ошибка проверки ответа:', error);
      return false;
    }
  }

  // Получить всех пользователей
  async getAllUsers() {
    try {
      const users = await this.getCollection()
        .find({})
        .project({ discord: 1, question: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .toArray();

      return users.map(u => ({
        discord: u.discord,
        question: u.question,
        createdAt: u.createdAt.toLocaleString('ru-RU')
      }));
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      return [];
    }
  }

  // Удалить пользователя
  async deleteUser(discord) {
    try {
      const result = await this.getCollection().deleteOne({
        discord: { $regex: new RegExp(`^${discord}$`, 'i') }
      });

      console.log(`✅ Пользователь ${discord} удален`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      return false;
    }
  }
}

module.exports = new PasswordsDatabaseMongo();
