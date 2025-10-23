const supabase = require('./supabase-setup');
const crypto = require('crypto');

class PasswordsDatabaseSupabase {
  constructor() {
    this.tableName = 'passwords';
  }

  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async addUser(discord, password, question, answer) {
    try {
      const hashedPassword = this.hashPassword(password);
      const hashedAnswer = this.hashPassword(answer.toLowerCase());

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          discord,
          password: hashedPassword,
          question,
          answer: hashedAnswer
        }])
        .select();

      if (error) {
        if (error.code === '23505') {
          console.error('❌ Пользователь уже существует');
          return false;
        }
        throw error;
      }

      console.log(`✅ Пользователь ${discord} добавлен`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления пользователя:', error);
      return false;
    }
  }

  async verifyPassword(discord, password) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('password')
        .ilike('discord', discord)
        .single();

      if (error) return false;

      const hashedPassword = this.hashPassword(password);
      return data.password === hashedPassword;
    } catch (error) {
      console.error('Ошибка проверки пароля:', error);
      return false;
    }
  }

  async getSecurityQuestion(discord) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('question')
        .ilike('discord', discord)
        .single();

      if (error) return null;

      return data.question;
    } catch (error) {
      console.error('Ошибка получения вопроса:', error);
      return null;
    }
  }

  async verifySecurityAnswer(discord, answer) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('answer')
        .ilike('discord', discord)
        .single();

      if (error) return false;

      const hashedAnswer = this.hashPassword(answer.toLowerCase());
      return data.answer === hashedAnswer;
    } catch (error) {
      console.error('Ошибка проверки ответа:', error);
      return false;
    }
  }

  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('discord, question, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(u => ({
        discord: u.discord,
        question: u.question,
        createdAt: new Date(u.created_at).toLocaleString('ru-RU')
      }));
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      return [];
    }
  }

  async updateUser(discord, password, question, answer) {
    try {
      const hashedPassword = this.hashPassword(password);
      const hashedAnswer = this.hashPassword(answer.toLowerCase());

      const { error } = await supabase
        .from(this.tableName)
        .update({
          password: hashedPassword,
          question,
          answer: hashedAnswer
        })
        .ilike('discord', discord);

      if (error) throw error;

      console.log(`✅ Пароль и секретное слово для ${discord} обновлены`);
      return true;
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      return false;
    }
  }

  async deleteUser(discord) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .ilike('discord', discord);

      if (error) throw error;

      console.log(`✅ Пользователь ${discord} удален`);
      return true;
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      return false;
    }
  }
}

module.exports = new PasswordsDatabaseSupabase();
