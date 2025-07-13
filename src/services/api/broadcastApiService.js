
import BaseApiService from './baseApiService.js';

/**
 * Broadcast API Service with MongoDB Integration
 */
class BroadcastApiService extends BaseApiService {
  constructor() {
    super('/broadcast');
  }

  async getBroadcasts(params = {}) {
    return this.getAll(params);
  }

  async getBroadcastById(broadcastId) {
    return this.getById(broadcastId);
  }

  async createBroadcast(broadcastData) {
    return this.create(broadcastData);
  }

  async updateBroadcast(broadcastId, broadcastData) {
    return this.update(broadcastId, broadcastData);
  }

  async deleteBroadcast(broadcastId) {
    return this.delete(broadcastId);
  }

  async getBroadcastStats(broadcastId) {
    return this.makeRequest(`/${broadcastId}/stats`);
  }

  async getEligibleClients(targetAudience) {
    return this.makeRequest('/eligible-clients', {
      method: 'POST',
      body: JSON.stringify({ targetAudience })
    });
  }

  async updateClientPreferences(clientId, preferences) {
    return this.makeRequest(`/clients/${clientId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  // Enhanced broadcast endpoints
  async getBroadcastAnalytics(broadcastId) {
    return this.makeRequest(`/${broadcastId}/analytics`);
  }

  async approveBroadcast(broadcastId, action, reason = '') {
    return this.makeRequest(`/${broadcastId}/approval`, {
      method: 'POST',
      body: JSON.stringify({ action, reason })
    });
  }

  async getTemplates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/templates?${queryString}` : '/templates';
    return this.makeRequest(endpoint);
  }

  async createTemplate(templateData) {
    return this.makeRequest('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData)
    });
  }

  async triggerAutomation(triggerType) {
    return this.makeRequest(`/automation/${triggerType}`, {
      method: 'POST'
    });
  }
}

// Communication API Service
class CommunicationApiService extends BaseApiService {
  constructor() {
    super('/communication');
  }

  async getOffers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/offers?${queryString}` : '/offers';
    return this.makeRequest(endpoint);
  }

  async getOfferById(offerId) {
    return this.makeRequest(`/offers/${offerId}`);
  }

  async createOffer(offerData) {
    return this.makeRequest('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData)
    });
  }

  async updateOffer(offerId, offerData) {
    return this.makeRequest(`/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData)
    });
  }

  async deleteOffer(offerId) {
    return this.makeRequest(`/offers/${offerId}`, {
      method: 'DELETE'
    });
  }

  async getCommunications(params = {}) {
    return this.getAll(params);
  }

  async sendCommunication(communicationData) {
    return this.create(communicationData);
  }

  async getStats() {
    return this.makeRequest('/stats');
  }

  async getLoyaltyPoints(clientId) {
    return this.makeRequest(`/loyalty/${clientId}`);
  }

  async updateLoyaltyPoints(clientId, pointsData) {
    return this.makeRequest(`/loyalty/${clientId}`, {
      method: 'POST',
      body: JSON.stringify(pointsData)
    });
  }

  async getAutomationRules() {
    return this.makeRequest('/automation');
  }

  async createAutomationRule(ruleData) {
    return this.makeRequest('/automation', {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
  }
}

export const broadcastApi = new BroadcastApiService();
export const communicationApi = new CommunicationApiService();
export default broadcastApi;
