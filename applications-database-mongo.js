const { getDB } = require('./mongodb-setup');

class ApplicationsDatabaseMongo {
  constructor() {
    this.collectionName = 'applications';
  }

  getCollection() {
    return getDB().collection(this.collectionName);
  }

  // Получить все заявки
  async getAllApplications() {
    try {
      const applications = await this.getCollection()
        .find({})
        .sort({ timestamp: -1 })
        .toArray();

      return applications.map(app => ({
        id: app._id.toString(),
        discord: app.discord || '',
        minecraft: app.minecraft || '',
        age: app.age || '',
        experience: app.experience || '',
        reason: app.reason || '',
        status: app.status || 'На рассмотрении',
        timestamp: app.timestamp || new Date().toLocaleString('ru-RU'),
        comment: app.comment || ''
      }));
    } catch (error) {
      console.error('Ошибка получения заявок:', error);
      return [];
    }
  }

  // Добавить заявку
  async addApplication(data) {
    try {
      const result = await this.getCollection().insertOne({
        discord: data.discord,
        minecraft: data.minecraft,
        age: data.age,
        experience: data.experience,
        reason: data.reason,
        status: 'На рассмотрении',
        timestamp: new Date().toLocaleString('ru-RU'),
        createdAt: new Date()
      });

      console.log(`✅ Заявка добавлена: ${data.discord}`);
      return result.acknowledged;
    } catch (error) {
      console.error('Ошибка добавления заявки:', error);
      return false;
    }
  }

  // Принять заявку
  async approveApplication(applicationId, comment) {
    try {
      const { ObjectId } = require('mongodb');
      
      const result = await this.getCollection().updateOne(
        { _id: new ObjectId(applicationId) },
        { 
          $set: { 
            status: 'Принята',
            comment: comment || '',
            processedAt: new Date()
          } 
        }
      );

      console.log(`✅ Заявка ${applicationId} принята`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Ошибка принятия заявки:', error);
      return false;
    }
  }

  // Отклонить заявку
  async rejectApplication(applicationId, comment) {
    try {
      const { ObjectId } = require('mongodb');
      
      const result = await this.getCollection().updateOne(
        { _id: new ObjectId(applicationId) },
        { 
          $set: { 
            status: 'Отклонена',
            comment: comment || '',
            processedAt: new Date()
          } 
        }
      );

      console.log(`✅ Заявка ${applicationId} отклонена`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Ошибка отклонения заявки:', error);
      return false;
    }
  }

  // Удалить заявку
  async deleteApplication(applicationId) {
    try {
      const { ObjectId } = require('mongodb');
      
      const result = await this.getCollection().deleteOne({
        _id: new ObjectId(applicationId)
      });

      console.log(`✅ Заявка ${applicationId} удалена`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Ошибка удаления заявки:', error);
      return false;
    }
  }
}

module.exports = new ApplicationsDatabaseMongo();
