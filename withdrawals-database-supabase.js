const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL и KEY должны быть указаны в .env файле');
}

const supabase = createClient(supabaseUrl, supabaseKey);

class WithdrawalsDatabase {
  // Создать заявку на вывод
  async createWithdrawal(withdrawalData) {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .insert([{
          discord: withdrawalData.discord,
          minecraft: withdrawalData.minecraft,
          amount: withdrawalData.amount,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      throw error;
    }
  }

  // Получить все заявки
  async getAllWithdrawals() {
    try {
      const { data, error} = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting all withdrawals:', error);
      throw error;
    }
  }

  // Получить заявки пользователя
  async getUserWithdrawals(discord) {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('discord', discord)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user withdrawals:', error);
      throw error;
    }
  }

  // Получить заявку по ID
  async getWithdrawalById(id) {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting withdrawal by ID:', error);
      throw error;
    }
  }

  // Одобрить заявку
  async approveWithdrawal(id, reviewer) {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .update({
          status: 'approved',
          reviewer: reviewer,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      throw error;
    }
  }

  // Отклонить заявку
  async rejectWithdrawal(id, reviewer, comment) {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .update({
          status: 'rejected',
          reviewer: reviewer,
          comment: comment,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      throw error;
    }
  }

  // Получить статистику
  async getStats() {
    try {
      const allWithdrawals = await this.getAllWithdrawals();
      
      return {
        total: allWithdrawals.length,
        pending: allWithdrawals.filter(w => w.status === 'pending').length,
        approved: allWithdrawals.filter(w => w.status === 'approved').length,
        rejected: allWithdrawals.filter(w => w.status === 'rejected').length
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
}

module.exports = new WithdrawalsDatabase();
