const supabase = require('./supabase-setup');

class BugsDatabaseSupabase {
  constructor() {
    this.tableName = 'bugs';
  }

  // Получить все баги
  async getAllBugs() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Ошибка получения багов:', error);
      return [];
    }
  }

  // Получить баги по статусу
  async getBugsByStatus(status) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Ошибка получения багов по статусу:', error);
      return [];
    }
  }

  // Добавить баг
  async addBug(bugData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          discord: bugData.discord,
          minecraft: bugData.minecraft || null,
          title: bugData.title,
          description: bugData.description,
          status: 'Новый',
          priority: bugData.priority || 'Средний',
          screenshot: bugData.screenshot || null,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      console.log(`✅ Баг от ${bugData.discord} добавлен`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления бага:', error);
      return false;
    }
  }

  // Обновить статус бага
  async updateBugStatus(id, status, resolvedBy, adminComment) {
    try {
      const updateData = {
        status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'Решен' || status === 'Отклонен') {
        updateData.resolved_by = resolvedBy;
        updateData.resolved_at = new Date().toISOString();
      }

      if (adminComment) {
        updateData.admin_comment = adminComment;
      }

      const { error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      console.log(`✅ Статус бага #${id} обновлен: ${status}`);
      return true;
    } catch (error) {
      console.error('Ошибка обновления статуса бага:', error);
      return false;
    }
  }

  // Обновить приоритет
  async updateBugPriority(id, priority) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          priority: priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      console.log(`✅ Приоритет бага #${id} обновлен: ${priority}`);
      return true;
    } catch (error) {
      console.error('Ошибка обновления приоритета:', error);
      return false;
    }
  }

  // Удалить баг
  async deleteBug(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log(`✅ Баг #${id} удален`);
      return true;
    } catch (error) {
      console.error('Ошибка удаления бага:', error);
      return false;
    }
  }
}

module.exports = new BugsDatabaseSupabase();
