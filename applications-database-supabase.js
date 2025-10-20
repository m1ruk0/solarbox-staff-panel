const supabase = require('./supabase-setup');

class ApplicationsDatabaseSupabase {
  constructor() {
    this.tableName = 'applications';
  }

  // Получить все заявки
  async getAllApplications() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(app => ({
        id: app.id.toString(),
        discord: app.discord || '',
        minecraft: app.minecraft || '',
        age: app.age || '',
        experience: app.experience || '',
        reason: app.reason || '',
        status: app.status || 'На рассмотрении',
        timestamp: new Date(app.created_at).toLocaleString('ru-RU'),
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
      const { error } = await supabase
        .from(this.tableName)
        .insert([{
          discord: data.discord,
          minecraft: data.minecraft,
          age: data.age,
          experience: data.experience,
          reason: data.reason,
          status: 'На рассмотрении'
        }]);

      if (error) throw error;

      console.log(`✅ Заявка добавлена: ${data.discord}`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления заявки:', error);
      return false;
    }
  }

  // Принять заявку
  async approveApplication(applicationId, comment) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          status: 'Принята',
          comment: comment || '',
          processed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      console.log(`✅ Заявка ${applicationId} принята`);
      return true;
    } catch (error) {
      console.error('Ошибка принятия заявки:', error);
      return false;
    }
  }

  // Отклонить заявку
  async rejectApplication(applicationId, comment) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          status: 'Отклонена',
          comment: comment || '',
          processed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      console.log(`✅ Заявка ${applicationId} отклонена`);
      return true;
    } catch (error) {
      console.error('Ошибка отклонения заявки:', error);
      return false;
    }
  }

  // Удалить заявку
  async deleteApplication(applicationId) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      console.log(`✅ Заявка ${applicationId} удалена`);
      return true;
    } catch (error) {
      console.error('Ошибка удаления заявки:', error);
      return false;
    }
  }
}

module.exports = new ApplicationsDatabaseSupabase();
