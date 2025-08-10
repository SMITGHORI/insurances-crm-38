import { 
  createApiUrl, 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  createPaginationParams,
  createSearchParams,
  createDateRangeParams 
} from './index';

const REPORTS_ENDPOINT = '/reports';

const reportsApi = {
  // Get all reports with pagination and filters
  getReports: async (params = {}) => {
    const { page = 1, limit = 25, search = '', type = '', status = '', startDate = '', endDate = '', ...otherFilters } = params;
    
    let queryString = createPaginationParams(page, limit, otherFilters);
    
    if (search) {
      queryString += `&${createSearchParams(search)}`;
    }
    
    if (type && type !== 'all') {
      queryString += `&type=${type}`;
    }
    
    if (status && status !== 'all') {
      queryString += `&status=${status}`;
    }
    
    if (startDate || endDate) {
      queryString += `&${createDateRangeParams(startDate, endDate)}`;
    }
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}?${queryString}`);
    return apiGet(url);
  },

  // Get a single report by ID
  getReport: async (reportId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}`);
    return apiGet(url);
  },

  // Generate a new report
  generateReport: async (reportConfig) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/generate`);
    return apiPost(url, reportConfig);
  },

  // Update an existing report
  updateReport: async (reportId, updateData) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}`);
    return apiPut(url, updateData);
  },

  // Delete a report
  deleteReport: async (reportId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}`);
    return apiDelete(url);
  },

  // Bulk delete reports
  bulkDeleteReports: async (reportIds) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/bulk-delete`);
    return apiPost(url, { reportIds });
  },

  // Get report statistics and analytics
  getReportStats: async (params = {}) => {
    const { startDate = '', endDate = '', type = '' } = params;
    
    let queryString = '';
    if (startDate || endDate || type) {
      queryString = '?' + createDateRangeParams(startDate, endDate, type ? { type } : {});
    }
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/stats${queryString}`);
    return apiGet(url);
  },

  // Get report templates
  getReportTemplates: async () => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/templates`);
    return apiGet(url);
  },

  // Create a new report template
  createReportTemplate: async (templateData) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/templates`);
    return apiPost(url, templateData);
  },

  // Update a report template
  updateReportTemplate: async (templateId, updateData) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/templates/${templateId}`);
    return apiPut(url, updateData);
  },

  // Delete a report template
  deleteReportTemplate: async (templateId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/templates/${templateId}`);
    return apiDelete(url);
  },

  // Schedule a report
  scheduleReport: async (scheduleData) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/schedule`);
    return apiPost(url, scheduleData);
  },

  // Get scheduled reports
  getScheduledReports: async (params = {}) => {
    const { page = 1, limit = 25, status = '' } = params;
    
    let queryString = createPaginationParams(page, limit);
    if (status && status !== 'all') {
      queryString += `&status=${status}`;
    }
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/scheduled?${queryString}`);
    return apiGet(url);
  },

  // Update scheduled report
  updateScheduledReport: async (scheduleId, updateData) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/scheduled/${scheduleId}`);
    return apiPut(url, updateData);
  },

  // Delete scheduled report
  deleteScheduledReport: async (scheduleId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/scheduled/${scheduleId}`);
    return apiDelete(url);
  },

  // Get report categories
  getReportCategories: async () => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/categories`);
    return apiGet(url);
  },

  // Get report formats
  getReportFormats: async () => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/formats`);
    return apiGet(url);
  },

  // Export report in different formats
  exportReport: async (reportId, format = 'pdf') => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/export?format=${format}`);
    return apiGet(url);
  },

  // Share report
  shareReport: async (reportId, shareData) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/share`);
    return apiPost(url, shareData);
  },

  // Get report sharing history
  getReportSharingHistory: async (reportId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/sharing-history`);
    return apiGet(url);
  },

  // Favorite/unfavorite a report
  toggleReportFavorite: async (reportId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/favorite`);
    return apiPost(url, {});
  },

  // Get favorite reports
  getFavoriteReports: async (params = {}) => {
    const { page = 1, limit = 25 } = params;
    const queryString = createPaginationParams(page, limit);
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/favorites?${queryString}`);
    return apiGet(url);
  },

  // Get recent reports
  getRecentReports: async (params = {}) => {
    const { page = 1, limit = 25, days = 30 } = params;
    const queryString = createPaginationParams(page, limit, { days });
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/recent?${queryString}`);
    return apiGet(url);
  },

  // Get popular reports
  getPopularReports: async (params = {}) => {
    const { page = 1, limit = 25, period = 'month' } = params;
    const queryString = createPaginationParams(page, limit, { period });
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/popular?${queryString}`);
    return apiGet(url);
  },

  // Get report analytics
  getReportAnalytics: async (params = {}) => {
    const { startDate = '', endDate = '', type = '', groupBy = 'day' } = params;
    
    let queryString = createDateRangeParams(startDate, endDate, { type, groupBy });
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/analytics?${queryString}`);
    return apiGet(url);
  },

  // Get report performance metrics
  getReportPerformance: async (reportId, params = {}) => {
    const { startDate = '', endDate = '' } = params;
    
    let queryString = '';
    if (startDate || endDate) {
      queryString = '?' + createDateRangeParams(startDate, endDate);
    }
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/performance${queryString}`);
    return apiGet(url);
  },

  // Get report access logs
  getReportAccessLogs: async (reportId, params = {}) => {
    const { page = 1, limit = 25, startDate = '', endDate = '' } = params;
    
    let queryString = createPaginationParams(page, limit);
    if (startDate || endDate) {
      queryString += '&' + createDateRangeParams(startDate, endDate);
    }
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/access-logs?${queryString}`);
    return apiGet(url);
  },

  // Validate report configuration
  validateReportConfig: async (reportConfig) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/validate`);
    return apiPost(url, reportConfig);
  },

  // Test report generation
  testReportGeneration: async (reportConfig) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/test`);
    return apiPost(url, reportConfig);
  },

  // Get report generation status
  getReportStatus: async (reportId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/status`);
    return apiGet(url);
  },

  // Cancel report generation
  cancelReportGeneration: async (reportId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/cancel`);
    return apiPost(url, {});
  },

  // Retry failed report generation
  retryReportGeneration: async (reportId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/retry`);
    return apiPost(url, {});
  },

  // Get report generation queue
  getReportQueue: async () => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/queue`);
    return apiGet(url);
  },

  // Clear report generation queue
  clearReportQueue: async () => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/queue/clear`);
    return apiPost(url, {});
  },

  // Get report storage usage
  getReportStorageUsage: async () => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/storage-usage`);
    return apiGet(url);
  },

  // Clean up old reports
  cleanupOldReports: async (params = {}) => {
    const { olderThan = 365, dryRun = false } = params;
    const queryString = `?olderThan=${olderThan}&dryRun=${dryRun}`;
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/cleanup${queryString}`);
    return apiPost(url, {});
  },

  // Get report system health
  getReportSystemHealth: async () => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/health`);
    return apiGet(url);
  },

  // Get report generation metrics
  getReportMetrics: async (params = {}) => {
    const { startDate = '', endDate = '', type = '' } = params;
    
    let queryString = '';
    if (startDate || endDate || type) {
      queryString = '?' + createDateRangeParams(startDate, endDate, type ? { type } : {});
    }
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/metrics${queryString}`);
    return apiGet(url);
  },

  // Get report user preferences
  getUserReportPreferences: async () => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/user-preferences`);
    return apiGet(url);
  },

  // Update user report preferences
  updateUserReportPreferences: async (preferences) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/user-preferences`);
    return apiPut(url, preferences);
  },

  // Get report notifications
  getReportNotifications: async (params = {}) => {
    const { page = 1, limit = 25, unreadOnly = false } = params;
    const queryString = createPaginationParams(page, limit, { unreadOnly });
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/notifications?${queryString}`);
    return apiGet(url);
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/notifications/${notificationId}/read`);
    return apiPost(url, {});
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/notifications/mark-all-read`);
    return apiPost(url, {});
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/notifications/${notificationId}`);
    return apiDelete(url);
  },

  // Get report comments
  getReportComments: async (reportId, params = {}) => {
    const { page = 1, limit = 25 } = params;
    const queryString = createPaginationParams(page, limit);
    
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/comments?${queryString}`);
    return apiGet(url);
  },

  // Add comment to report
  addReportComment: async (reportId, commentData) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/comments`);
    return apiPost(url, commentData);
  },

  // Update comment
  updateComment: async (commentId, updateData) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/comments/${commentId}`);
    return apiPut(url, updateData);
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/comments/${commentId}`);
    return apiDelete(url);
  },

  // Get report versions
  getReportVersions: async (reportId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/versions`);
    return apiGet(url);
  },

  // Restore report version
  restoreReportVersion: async (reportId, versionId) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/versions/${versionId}/restore`);
    return apiPost(url, {});
  },

  // Compare report versions
  compareReportVersions: async (reportId, version1Id, version2Id) => {
    const url = createApiUrl(`${REPORTS_ENDPOINT}/${reportId}/versions/compare?version1=${version1Id}&version2=${version2Id}`);
    return apiGet(url);
  }
};

export default reportsApi;