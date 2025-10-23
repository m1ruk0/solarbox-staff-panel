const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class PasswordsDatabase {
  constructor() {
    this.tableName = 'passwords';
  }

  // Хеширование пароля
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // Добавить пользователя с паролем
  async addUser(discord, password, question, answer) {
    try {
      console.log(`📝 Добавление пользователя ${discord}...`);
      
      const hashedPassword = this.hashPassword(password);
      const hashedAnswer = this.hashPassword(answer.toLowerCase());
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          discord: discord,
          password: hashedPassword,
          question: question,
          answer: hashedAnswer
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Пользователь ${discord} успешно добавлен`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка добавления пользователя:', error.message);
      throw error;
    }
  }

  // Проверить пароль
  async verifyPassword(discord, password) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('discord', discord)
        .single();

      if (error || !data) {
        return { success: false, message: 'Пользователь не найден' };
      }

      const hashedPassword = this.hashPassword(password);
      if (data.password === hashedPassword) {
        return { 
          success: true, 
          question: data.question
        };
      }

      return { success: false, message: 'Неверный пароль' };
    } catch (error) {
      console.error('Ошибка проверки пароля:', error.message);
      return { success: false, message: 'Ошибка сервера' };
    }
  }

  // Получить секретный вопрос
  async getSecurityQuestion(discord) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('question')
        .eq('discord', discord)
        .single();

      if (error || !data) {
        return null;
      }

      return data.question;
    } catch (error) {
      console.error('Ошибка получения вопроса:', error.message);
      return null;
    }
  }

  // Проверить ответ на секретный вопрос
  async verifyAnswer(discord, answer) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('answer')
        .eq('discord', discord)
        .single();

      if (error || !data) {
        return { success: false, message: 'Пользователь не найден' };
      }

      const hashedAnswer = this.hashPassword(answer.toLowerCase());
      if (data.answer === hashedAnswer) {
        return { success: true };
      }

      return { success: false, message: 'Неверный ответ' };
    } catch (error) {
      console.error('Ошибка проверки ответа:', error.message);
      return { success: false, message: 'Ошибка сервера' };
    }
  }

  // Получить всех пользователей
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('discord, question, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(row => ({
        discord: row.discord,
        question: row.question,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Ошибка получения пользователей:', error.message);
      return [];
    }
  }

  // Обновить пароль
  async updatePassword(discord, newPassword) {
    try {
      const hashedPassword = this.hashPassword(newPassword);
      
      const { error } = await supabase
        .from(this.tableName)
        .update({ password: hashedPassword })
        .eq('discord', discord);

      if (error) throw error;

      console.log(`✅ Пароль для ${discord} обновлен`);
      return true;
    } catch (error) {
      console.error('Ошибка обновления пароля:', error.message);
      return false;
    }
  }

  // Удалить пользователя
  async deleteUser(discord) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('discord', discord);

      if (error) throw error;

      console.log(`✅ Пользователь ${discord} удален`);
      return true;
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error.message);
      return false;
    }
  }
}

module.exports = new PasswordsDatabase();
