const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class ReportsDatabase {
  // Создать отчет
  async createReport(reportData) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          author: reportData.author,
          report_type: reportData.report_type || 'daily_report',
          player_nickname: reportData.player_nickname || '',
          reason: reportData.reason || '',
          description: reportData.description || '',
          screenshots: reportData.screenshots || [],
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  // Получить все отчеты
  async getAllReports() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all reports:', error);
      throw error;
    }
  }

  // Получить отчеты по автору
  async getReportsByAuthor(author) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('author', author)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting reports by author:', error);
      throw error;
    }
  }

  // Получить отчет по ID
  async getReportById(id) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting report by ID:', error);
      throw error;
    }
  }

  // Одобрить отчет
  async approveReport(id, reviewer, comment) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          status: 'approved',
          reviewer: reviewer,
          review_comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving report:', error);
      throw error;
    }
  }

  // Отклонить отчет
  async rejectReport(id, reviewer, comment) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          status: 'rejected',
          reviewer: reviewer,
          review_comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting report:', error);
      throw error;
    }
  }

  // Получить статистику
  async getStats() {
    try {
      const allReports = await this.getAllReports();
      
      return {
        total: allReports.length,
        pending: allReports.filter(r => r.status === 'pending').length,
        approved: allReports.filter(r => r.status === 'approved').length,
        rejected: allReports.filter(r => r.status === 'rejected').length
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
}

module.exports = new ReportsDatabase();
