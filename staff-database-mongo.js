const { getDB } = require('./mongodb-setup');
const crypto = require('crypto');

class StaffDatabaseMongo {
  constructor() {
    this.collectionName = 'staff';
  }

  getCollection() {
    return getDB().collection(this.collectionName);
  }

  // Получить всех сотрудников
  async getAllStaff() {
    try {
      const staff = await this.getCollection()
        .find({})
        .sort({ hireDate: -1 })
        .toArray();
      
      return staff.map(s => ({
        discord: s.discord,
        minecraft: s.minecraft,
        position: s.position,
        warns: s.warns || 0,
        vacation: s.vacation ? 'Да' : 'Нет',
        status: s.status || 'Активен',
        hireDate: s.hireDate || new Date().toLocaleDateString('ru-RU')
      }));
    } catch (error) {
      console.error('Ошибка получения персонала:', error);
      return [];
    }
  }

  // Добавить сотрудника
  async addStaff(discord, minecraft, position) {
    try {
      const result = await this.getCollection().insertOne({
        discord,
        minecraft,
        position,
        warns: 0,
        vacation: false,
        status: 'Активен',
        hireDate: new Date().toLocaleDateString('ru-RU'),
        createdAt: new Date()
      });

      console.log(`✅ Добавлен сотрудник: ${discord}`);
      return result.acknowledged;
    } catch (error) {
      if (error.code === 11000) {
        console.error('❌ Сотрудник уже существует');
        return false;
      }
      console.error('Ошибка добавления сотрудника:', error);
      return false;
    }
  }

  // Найти сотрудника по Discord
  async getStaffByDiscord(discord) {
    try {
      const staff = await this.getCollection().findOne({
        discord: { $regex: new RegExp(`^${discord}$`, 'i') }
      });
      
      if (!staff) return null;
      
      return {
        discord: staff.discord,
        minecraft: staff.minecraft,
        position: staff.position,
        warns: staff.warns || 0,
        vacation: staff.vacation ? 'Да' : 'Нет',
        status: staff.status || 'Активен',
        hireDate: staff.hireDate || new Date().toLocaleDateString('ru-RU')
      };
    } catch (error) {
      console.error('Ошибка поиска сотрудника:', error);
      return null;
    }
  }

  // Алиас для совместимости
  async findStaff(discord) {
    return await this.getStaffByDiscord(discord);
  }

  // Обновить должность
  async updatePosition(discord, position) {
    try {
      const result = await this.getCollection().updateOne(
        { discord: { $regex: new RegExp(`^${discord}$`, 'i') } },
        { $set: { position, updatedAt: new Date() } }
      );

      console.log(`✅ Должность обновлена для ${discord}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Ошибка обновления должности:', error);
      return false;
    }
  }

  // Добавить варн
  async addWarn(discord, count = 1) {
    try {
      const staff = await this.getStaffByDiscord(discord);
      if (!staff) return false;

      const newWarns = Math.min((staff.warns || 0) + count, 3);
      
      const result = await this.getCollection().updateOne(
        { discord: { $regex: new RegExp(`^${discord}$`, 'i') } },
        { $set: { warns: newWarns, updatedAt: new Date() } }
      );

      console.log(`✅ Варн добавлен для ${discord}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Ошибка добавления варна:', error);
      return false;
    }
  }

  // Снять варн
  async removeWarn(discord, count = 1) {
    try {
      const staff = await this.getStaffByDiscord(discord);
      if (!staff) return false;

      const newWarns = Math.max((staff.warns || 0) - count, 0);
      
      const result = await this.getCollection().updateOne(
        { discord: { $regex: new RegExp(`^${discord}$`, 'i') } },
        { $set: { warns: newWarns, updatedAt: new Date() } }
      );

      console.log(`✅ Варн снят с ${discord}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Ошибка снятия варна:', error);
      return false;
    }
  }

  // Обновить статус
  async updateStatus(discord, status) {
    try {
      const result = await this.getCollection().updateOne(
        { discord: { $regex: new RegExp(`^${discord}$`, 'i') } },
        { $set: { status, updatedAt: new Date() } }
      );

      console.log(`✅ Статус обновлен для ${discord}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      return false;
    }
  }

  // Установить отпуск
  async setVacation(discord, onVacation, days = 0) {
    try {
      const result = await this.getCollection().updateOne(
        { discord: { $regex: new RegExp(`^${discord}$`, 'i') } },
        { 
          $set: { 
            vacation: onVacation,
            vacationDays: days,
            updatedAt: new Date()
          } 
        }
      );

      console.log(`✅ Отпуск обновлен для ${discord}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Ошибка обновления отпуска:', error);
      return false;
    }
  }

  // Уволить сотрудника (изменить статус)
  async deleteStaff(discord, reason) {
    try {
      const result = await this.getCollection().updateOne(
        { discord: { $regex: new RegExp(`^${discord}$`, 'i') } },
        { 
          $set: { 
            status: 'Уволен',
            fireReason: reason,
            firedAt: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      console.log(`✅ Сотрудник ${discord} уволен`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Ошибка увольнения:', error);
      return false;
    }
  }

  // Удалить навсегда
  async permanentDelete(discord, reason) {
    try {
      const result = await this.getCollection().deleteOne({
        discord: { $regex: new RegExp(`^${discord}$`, 'i') }
      });

      console.log(`✅ Сотрудник ${discord} УДАЛЕН из базы`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Ошибка удаления:', error);
      return false;
    }
  }
}

module.exports = new StaffDatabaseMongo();
