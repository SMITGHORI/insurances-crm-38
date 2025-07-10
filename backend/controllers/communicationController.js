const { Communication, LoyaltyPoints, AutomationRule } = require('../models/Communication');
const Offer = require('../models/Offer');
const Client = require('../models/Client');
const { AppError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');
const mongoose = require('mongoose');

class CommunicationController {
  /**
   * Get all communications
   */
  async getCommunications(req, res, next) {
    try {
      const communications = await Communication.find()
        .populate('clientId', 'displayName email phone')
        .populate('agentId', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      return successResponse(res, { data: communications });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send communication
   */
  async sendCommunication(req, res, next) {
    try {
      const { clientId, type, channel, subject, content, scheduledFor } = req.body;

      // Validate client
      const client = await Client.findById(clientId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      const communicationData = {
        clientId,
        type,
        channel,
        subject,
        content,
        agentId: req.user._id,
        scheduledFor: scheduledFor || new Date()
      };

      const communication = new Communication(communicationData);
      await communication.save();

      return successResponse(res, {
        message: 'Communication scheduled successfully',
        data: communication
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get communication stats
   */
  async getStats(req, res, next) {
    try {
      const totalCommunications = await Communication.countDocuments();
      const communicationsByType = await Communication.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      const stats = {
        totalCommunications,
        communicationsByType
      };

      return successResponse(res, { data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get loyalty points for client
   */
  async getLoyaltyPoints(req, res, next) {
    try {
      const { clientId } = req.params;

      const loyaltyPoints = await LoyaltyPoints.findOne({ clientId });

      if (!loyaltyPoints) {
        return successResponse(res, { data: { points: 0, tierLevel: 'bronze' } });
      }

      return successResponse(res, { data: loyaltyPoints });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update loyalty points for client
   */
  async updateLoyaltyPoints(req, res, next) {
    try {
      const { clientId } = req.params;
      const { points, tierLevel } = req.body;

      let loyaltyPoints = await LoyaltyPoints.findOne({ clientId });

      if (!loyaltyPoints) {
        loyaltyPoints = new LoyaltyPoints({
          clientId,
          points,
          tierLevel
        });
      } else {
        loyaltyPoints.points = points;
        loyaltyPoints.tierLevel = tierLevel;
      }

      await loyaltyPoints.save();

      return successResponse(res, {
        message: 'Loyalty points updated successfully',
        data: loyaltyPoints
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all offers
   */
  async getOffers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        search,
        isActive
      } = req.query;

      const filter = {};
      
      if (type) filter.type = type;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [offers, totalCount] = await Promise.all([
        Offer.find(filter)
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Offer.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: offers,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new offer
   */
  async createOffer(req, res, next) {
    try {
      const offerData = {
        ...req.body,
        createdBy: req.user._id
      };

      const offer = new Offer(offerData);
      await offer.save();

      return successResponse(res, {
        message: 'Offer created successfully',
        data: offer
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get offer by ID
   */
  async getOfferById(req, res, next) {
    try {
      const { offerId } = req.params;

      const offer = await Offer.findById(offerId)
        .populate('createdBy', 'name email');

      if (!offer) {
        throw new AppError('Offer not found', 404);
      }

      return successResponse(res, { data: offer });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update offer
   */
  async updateOffer(req, res, next) {
    try {
      const { offerId } = req.params;
      const updateData = req.body;

      const offer = await Offer.findByIdAndUpdate(
        offerId,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      if (!offer) {
        throw new AppError('Offer not found', 404);
      }

      return successResponse(res, {
        message: 'Offer updated successfully',
        data: offer
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete offer
   */
  async deleteOffer(req, res, next) {
    try {
      const { offerId } = req.params;

      const offer = await Offer.findByIdAndDelete(offerId);

      if (!offer) {
        throw new AppError('Offer not found', 404);
      }

      return successResponse(res, {
        message: 'Offer deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all automation rules
   */
  async getAutomationRules(req, res, next) {
    try {
      const automationRules = await AutomationRule.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      return successResponse(res, { data: automationRules });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new automation rule
   */
  async createAutomationRule(req, res, next) {
    try {
      const automationRuleData = {
        ...req.body,
        createdBy: req.user._id
      };

      const automationRule = new AutomationRule(automationRuleData);
      await automationRule.save();

      return successResponse(res, {
        message: 'Automation rule created successfully',
        data: automationRule
      }, 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommunicationController();
