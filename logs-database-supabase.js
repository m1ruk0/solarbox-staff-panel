const supabase = require('./supabase-setup');

class LogsDatabase {
  // Добавить лог
  async addLog(action, moderator, target = null, details = null) {
    try {
      const { data, error } = await supabase
        .from('logs')
        .insert([{
          action,
          moderator,
          target,
          details
        }]);

      if (error) throw error;
      
      console.log(`📝 Лог добавлен: ${action} от ${moderator}`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления лога:', error.message);
      return false;
    }
  }

  // Получить все логи
  async getAllLogs(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ошибка получения логов:', error.message);
      return [];
    }
  }

  // Получить логи по модератору
  async getLogsByModerator(moderator, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('moderator', moderator)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ошибка получения логов модератора:', error.message);
      return [];
    }
  }
}

module.exports = new LogsDatabase();
