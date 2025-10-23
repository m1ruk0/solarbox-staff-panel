const supabase = require('./supabase-setup');

class StaffDatabaseSupabase {
  constructor() {
    this.tableName = 'staff';
  }

  async getAllStaff() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(s => ({
        discord: s.discord,
        minecraft: s.minecraft,
        position: s.position,
        warns: s.warns || 0,
        vacation: s.vacation ? 'Да' : 'Нет',
        status: s.status || 'Активен',
        hireDate: s.hire_date || new Date().toLocaleDateString('ru-RU'),
        solariki: s.solariki || 0
      }));
    } catch (error) {
      console.error('Ошибка получения персонала:', error);
      return [];
    }
  }

  async addStaff(discord, minecraft, position) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          discord,
          minecraft,
          position,
          warns: 0,
          vacation: false,
          status: 'Активен',
          hire_date: new Date().toLocaleDateString('ru-RU'),
          solariki: 0
        }])
        .select();

      if (error) {
        if (error.code === '23505') {
          console.error('❌ Сотрудник уже существует');
          return false;
        }
        throw error;
      }

      console.log(`✅ Добавлен сотрудник: ${discord}`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления сотрудника:', error);
      return false;
    }
  }

  async getStaffByDiscord(discord) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .ilike('discord', discord)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        discord: data.discord,
        minecraft: data.minecraft,
        position: data.position,
        warns: data.warns || 0,
        vacation: data.vacation ? 'Да' : 'Нет',
        status: data.status || 'Активен',
        hireDate: data.hire_date || new Date().toLocaleDateString('ru-RU'),
        solariki: data.solariki || 0
      };
    } catch (error) {
      console.error('Ошибка поиска сотрудника:', error);
      return null;
    }
  }

  async findStaff(discord) {
    return await this.getStaffByDiscord(discord);
  }

  async updatePosition(discord, position) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ position })
        .ilike('discord', discord);

      if (error) throw error;

      console.log(`✅ Должность обновлена для ${discord}`);
      return true;
    } catch (error) {
      console.error('Ошибка обновления должности:', error);
      return false;
    }
  }

  async addWarn(discord, count = 1) {
    try {
      const staff = await this.getStaffByDiscord(discord);
      if (!staff) return false;

      const newWarns = Math.min((staff.warns || 0) + count, 3);

      const { error } = await supabase
        .from(this.tableName)
        .update({ warns: newWarns })
        .ilike('discord', discord);

      if (error) throw error;

      console.log(`✅ Варн добавлен для ${discord}`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления варна:', error);
      return false;
    }
  }

  async removeWarn(discord, count = 1) {
    try {
      const staff = await this.getStaffByDiscord(discord);
      if (!staff) return false;

      const newWarns = Math.max((staff.warns || 0) - count, 0);

      const { error } = await supabase
        .from(this.tableName)
        .update({ warns: newWarns })
        .ilike('discord', discord);

      if (error) throw error;

      console.log(`✅ Варн снят с ${discord}`);
      return true;
    } catch (error) {
      console.error('Ошибка снятия варна:', error);
      return false;
    }
  }

  async updateStatus(discord, status) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ status })
        .ilike('discord', discord);

      if (error) throw error;

      console.log(`✅ Статус обновлен для ${discord}`);
      return true;
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      return false;
    }
  }

  async setVacation(discord, onVacation, days = 0) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          vacation: onVacation,
          vacation_days: days
        })
        .ilike('discord', discord);

      if (error) throw error;

      console.log(`✅ Отпуск обновлен для ${discord}`);
      return true;
    } catch (error) {
      console.error('Ошибка обновления отпуска:', error);
      return false;
    }
  }

  async deleteStaff(discord, reason) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          status: 'Уволен',
          fire_reason: reason,
          fired_at: new Date().toISOString()
        })
        .ilike('discord', discord);

      if (error) throw error;

      console.log(`✅ Сотрудник ${discord} уволен`);
      return true;
    } catch (error) {
      console.error('Ошибка увольнения:', error);
      return false;
    }
  }

  async permanentDelete(discord, reason) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .ilike('discord', discord);

      if (error) throw error;

      console.log(`✅ Сотрудник ${discord} УДАЛЕН из базы`);
      return true;
    } catch (error) {
      console.error('Ошибка удаления:', error);
      return false;
    }
  }

  async addSolariki(discord, amount) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('solariki')
        .ilike('discord', discord)
        .single();

      if (error) throw error;

      const newAmount = (data.solariki || 0) + amount;

      const { error: updateError } = await supabase
        .from(this.tableName)
        .update({ solariki: newAmount })
        .ilike('discord', discord);

      if (updateError) throw updateError;

      console.log(`✅ ${discord} получил ${amount} соляриков (всего: ${newAmount})`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления соляриков:', error);
      return false;
    }
  }

  async removeSolariki(discord, amount) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('solariki')
        .ilike('discord', discord)
        .single();

      if (error) throw error;

      const newAmount = Math.max(0, (data.solariki || 0) - amount);

      const { error: updateError } = await supabase
        .from(this.tableName)
        .update({ solariki: newAmount })
        .ilike('discord', discord);

      if (updateError) throw updateError;

      console.log(`✅ У ${discord} снято ${amount} соляриков (осталось: ${newAmount})`);
      return true;
    } catch (error) {
      console.error('Ошибка снятия соляриков:', error);
      return false;
    }
  }
}

module.exports = new StaffDatabaseSupabase();
