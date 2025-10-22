const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class ReportsDatabase {
  constructor() {
    this.tableName = 'reports';
  }

  // Создать отчет
  async createReport(reportData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          author: reportData.author,
          author_position: reportData.authorPosition,
          report_type: reportData.reportType,
          player_nickname: reportData.playerNickname,
          reason: reportData.reason,
          description: reportData.description,
          screenshots: reportData.screenshots || []
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Отчет создан:', data.id);
      return data;
    } catch (error) {
      console.error('Ошибка создания отчета:', error);
      return null;
    }
  }

  // Получить все отчеты (для модераторов)
  async getAllReports(limit = 100) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ошибка получения отчетов:', error);
      return [];
    }
  }

  // Получить отчеты по автору
  async getReportsByAuthor(author) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .ilike('author', author)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ошибка получения отчетов автора:', error);
      return [];
    }
  }

  // Получить отчет по ID
  async getReportById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ошибка получения отчета:', error);
      return null;
    }
  }

  // Одобрить отчет
  async approveReport(id, reviewer, reviewerPosition, comment) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'approved',
          reviewer: reviewer,
          reviewer_position: reviewerPosition,
          review_comment: comment,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Отчет одобрен:', id);
      return data;
    } catch (error) {
      console.error('Ошибка одобрения отчета:', error);
      return null;
    }
  }

  // Отклонить отчет
  async rejectReport(id, reviewer, reviewerPosition, comment) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'rejected',
          reviewer: reviewer,
          reviewer_position: reviewerPosition,
          review_comment: comment,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Отчет отклонен:', id);
      return data;
    } catch (error) {
      console.error('Ошибка отклонения отчета:', error);
      return null;
    }
  }

  // Получить статистику
  async getStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status');

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        approved: data.filter(r => r.status === 'approved').length,
        rejected: data.filter(r => r.status === 'rejected').length
      };

      return stats;
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }
}

module.exports = new ReportsDatabase();
