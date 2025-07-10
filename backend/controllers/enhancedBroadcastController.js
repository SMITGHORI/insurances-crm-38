
const { EnhancedBroadcast, BroadcastTemplate, EnhancedBroadcastRecipient } = require('../models/EnhancedBroadcast');
const { Communication } = require('../models/Communication');
const Client = require('../models/Client');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const mongoose = require('mongoose');

class EnhancedBroadcastController {
  /**
   * Get all enhanced broadcasts
   */
  async getBroadcasts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        status,
        sortField = 'createdAt',
        sortDirection = 'desc',
        search
      } = req.query;

      const filter = {};
      
      // Role-based filtering
      if (req.user.role === 'agent') {
        filter.createdBy = req.user._id;
      }

      if (type) filter.type = type;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const sort = {};
      sort[sortField] = sortDirection === 'desc' ? -1 : 1;

      const [broadcasts, totalCount] = await Promise.all([
        EnhancedBroadcast.find(filter)
          .populate('createdBy', 'name email')
          .populate('approval.approvedBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        EnhancedBroadcast.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: broadcasts,
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
   * Create new enhanced broadcast
   */
  async createBroadcast(req, res, next) {
    try {
      const broadcastData = {
        ...req.body,
        createdBy: req.user._id,
        lastModifiedBy: req.user._id
      };

      // Set approval status based on user role
      if (req.user.role === 'super_admin') {
        broadcastData.approval = {
          required: false,
          status: 'approved',
          approvedBy: req.user._id,
          approvedAt: new Date()
        };
      } else if (req.user.role === 'manager') {
        broadcastData.approval = {
          required: false,
          status: 'approved',
          approvedBy: req.user._id,
          approvedAt: new Date()
        };
      } else {
        broadcastData.approval = {
          required: true,
          status: 'pending_approval'
        };
        broadcastData.status = 'pending_approval';
      }

      const broadcast = new EnhancedBroadcast(broadcastData);
      await broadcast.save();

      // If approved and scheduled for immediate sending, process it
      if (broadcast.approval.status === 'approved' && broadcast.scheduledAt <= new Date()) {
        this.processEnhancedBroadcast(broadcast._id);
      }

      return successResponse(res, {
        message: 'Enhanced broadcast created successfully',
        data: broadcast
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get broadcast analytics
   */
  async getBroadcastAnalytics(req, res, next) {
    try {
      const { broadcastId } = req.params;

      const broadcast = await EnhancedBroadcast.findById(broadcastId)
        .populate('createdBy', 'name email');

      if (!broadcast) {
        throw new AppError('Broadcast not found', 404);
      }

      // Get detailed recipient analytics
      const recipientAnalytics = await EnhancedBroadcastRecipient.aggregate([
        { $match: { broadcastId: mongoose.Types.ObjectId(broadcastId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalEngagement: { $sum: '$engagement.score' },
            totalRevenue: { $sum: '$conversion.revenue' }
          }
        }
      ]);

      const channelAnalytics = await EnhancedBroadcastRecipient.aggregate([
        { $match: { broadcastId: mongoose.Types.ObjectId(broadcastId) } },
        {
          $group: {
            _id: '$channel',
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $ne: ['$status', 'pending'] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            opened: { $sum: { $cond: [{ $eq: ['$status', 'opened'] }, 1, 0] } },
            clicked: { $sum: { $cond: [{ $gte: ['$engagement.clicks', 1] }, 1, 0] } },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            revenue: { $sum: '$conversion.revenue' },
            cost: { $sum: '$delivery.cost' }
          }
        }
      ]);

      // A/B Test Analytics
      let abTestAnalytics = null;
      if (broadcast.abTest?.enabled) {
        abTestAnalytics = await EnhancedBroadcastRecipient.aggregate([
          { $match: { broadcastId: mongoose.Types.ObjectId(broadcastId), abVariant: { $exists: true } } },
          {
            $group: {
              _id: '$abVariant',
              recipients: { $sum: 1 },
              delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
              opened: { $sum: { $cond: [{ $eq: ['$status', 'opened'] }, 1, 0] } },
              clicked: { $sum: { $cond: [{ $gte: ['$engagement.clicks', 1] }, 1, 0] } },
              converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
              revenue: { $sum: '$conversion.revenue' }
            }
          }
        ]);
      }

      return successResponse(res, {
        data: {
          broadcast,
          recipientAnalytics,
          channelAnalytics,
          abTestAnalytics,
          performanceMetrics: {
            deliveryRate: broadcast.stats.totalRecipients > 0 ? (broadcast.stats.deliveredCount / broadcast.stats.totalRecipients * 100).toFixed(2) : 0,
            openRate: broadcast.stats.deliveredCount > 0 ? (broadcast.stats.openedCount / broadcast.stats.deliveredCount * 100).toFixed(2) : 0,
            clickRate: broadcast.stats.openedCount > 0 ? (broadcast.stats.clickedCount / broadcast.stats.openedCount * 100).toFixed(2) : 0,
            conversionRate: broadcast.stats.totalRecipients > 0 ? (broadcast.stats.convertedCount / broadcast.stats.totalRecipients * 100).toFixed(2) : 0,
            roi: broadcast.stats.roi || 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve or reject broadcast
   */
  async approveBroadcast(req, res, next) {
    try {
      const { broadcastId } = req.params;
      const { action, reason } = req.body;

      const broadcast = await EnhancedBroadcast.findById(broadcastId);
      if (!broadcast) {
        throw new AppError('Broadcast not found', 404);
      }

      if (broadcast.approval.status !== 'pending_approval') {
        throw new AppError('Broadcast has already been processed', 400);
      }

      broadcast.approval.status = action === 'approve' ? 'approved' : 'rejected';
      broadcast.approval.approvedBy = req.user._id;
      broadcast.approval.approvedAt = new Date();
      
      if (action === 'reject') {
        broadcast.approval.rejectionReason = reason;
        broadcast.status = 'cancelled';
      } else {
        broadcast.status = 'approved';
      }

      await broadcast.save();

      // If approved and scheduled for immediate sending, process it
      if (action === 'approve' && broadcast.scheduledAt <= new Date()) {
        this.processEnhancedBroadcast(broadcast._id);
      }

      return successResponse(res, {
        message: `Broadcast ${action}d successfully`,
        data: broadcast
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manage A/B Testing
   */
  async manageAbTest(req, res, next) {
    try {
      const { broadcastId } = req.params;
      const { action, variantData } = req.body;

      const broadcast = await EnhancedBroadcast.findById(broadcastId);
      if (!broadcast) {
        throw new AppError('Broadcast not found', 404);
      }

      switch (action) {
        case 'start':
          broadcast.abTest.enabled = true;
          if (variantData) {
            broadcast.abTest.variants = variantData.variants;
            broadcast.abTest.testDuration = variantData.testDuration || 24;
            broadcast.abTest.confidenceLevel = variantData.confidenceLevel || 95;
          }
          break;
        
        case 'stop':
          broadcast.abTest.enabled = false;
          break;
        
        case 'declare_winner':
          broadcast.abTest.winningVariant = variantData.winningVariant;
          break;
      }

      await broadcast.save();

      return successResponse(res, {
        message: `A/B test ${action} successful`,
        data: broadcast.abTest
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get broadcast templates
   */
  async getTemplates(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search
      } = req.query;

      const filter = { isActive: true };
      
      if (category) filter.category = category;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [templates, totalCount] = await Promise.all([
        BroadcastTemplate.find(filter)
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        BroadcastTemplate.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      return successResponse(res, {
        data: templates,
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
   * Create broadcast template
   */
  async createTemplate(req, res, next) {
    try {
      const templateData = {
        ...req.body,
        createdBy: req.user._id
      };

      const template = new BroadcastTemplate(templateData);
      await template.save();

      return successResponse(res, {
        message: 'Broadcast template created successfully',
        data: template
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process automated triggers
   */
  async processAutomatedTriggers(req, res, next) {
    try {
      const { triggerType } = req.params;

      // Find automated broadcasts with this trigger
      const automatedBroadcasts = await EnhancedBroadcast.find({
        'automation.isAutomated': true,
        'automation.trigger.type': triggerType,
        status: 'approved'
      });

      let processedCount = 0;

      for (const broadcast of automatedBroadcasts) {
        try {
          await this.processEnhancedBroadcast(broadcast._id);
          processedCount++;
        } catch (error) {
          console.error(`Error processing automated broadcast ${broadcast._id}:`, error);
        }
      }

      return successResponse(res, {
        message: `Processed ${processedCount} automated broadcasts for trigger: ${triggerType}`,
        data: { processedCount, triggerType }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process enhanced broadcast (background job)
   */
  async processEnhancedBroadcast(broadcastId) {
    try {
      const broadcast = await EnhancedBroadcast.findById(broadcastId);
      if (!broadcast || !['approved', 'scheduled'].includes(broadcast.status)) return;

      broadcast.status = 'sending';
      await broadcast.save();

      // Get eligible clients
      const clients = await this.getEligibleClientsForEnhancedBroadcast(broadcast);

      // Create recipient records and communications
      const recipients = [];
      const communications = [];

      for (const client of clients) {
        for (const channel of broadcast.channels) {
          // Check if client has opted in for this channel
          const preferences = client.communicationPreferences?.[channel];
          if (preferences?.offers === false && broadcast.type === 'offer') continue;

          // A/B Test variant assignment
          let abVariant = null;
          if (broadcast.abTest?.enabled && broadcast.abTest.variants?.length > 0) {
            const random = Math.random() * 100;
            let cumulative = 0;
            for (const variant of broadcast.abTest.variants) {
              cumulative += variant.percentage;
              if (random <= cumulative) {
                abVariant = variant.name;
                break;
              }
            }
          }

          const recipient = {
            broadcastId: broadcast._id,
            clientId: client._id,
            channel,
            status: 'pending',
            abVariant,
            personalizedContent: {
              subject: this.personalizeContent(broadcast.channelConfigs?.[channel]?.subject || broadcast.title, client),
              content: this.personalizeContent(broadcast.content, client),
              variables: this.extractPersonalizationVariables(client)
            }
          };

          const communication = {
            clientId: client._id,
            type: broadcast.type,
            channel,
            subject: recipient.personalizedContent.subject,
            content: recipient.personalizedContent.content,
            agentId: broadcast.createdBy,
            status: 'pending',
            scheduledFor: new Date(),
            broadcastId: broadcast._id
          };

          recipients.push(recipient);
          communications.push(communication);
        }
      }

      // Batch insert
      if (recipients.length > 0) {
        await EnhancedBroadcastRecipient.insertMany(recipients);
        await Communication.insertMany(communications);

        // Update broadcast stats
        broadcast.stats.totalRecipients = recipients.length;
        broadcast.status = 'sent';
        
        // Update A/B test variant stats
        if (broadcast.abTest?.enabled) {
          const variantCounts = {};
          recipients.forEach(r => {
            if (r.abVariant) {
              variantCounts[r.abVariant] = (variantCounts[r.abVariant] || 0) + 1;
            }
          });
          
          broadcast.abTest.variants.forEach(variant => {
            variant.stats.sent = variantCounts[variant.name] || 0;
          });
        }
        
        await broadcast.save();
      }
    } catch (error) {
      console.error('Error processing enhanced broadcast:', error);
      
      const broadcast = await EnhancedBroadcast.findById(broadcastId);
      if (broadcast) {
        broadcast.status = 'failed';
        await broadcast.save();
      }
    }
  }

  /**
   * Get eligible clients for enhanced broadcast processing
   */
  async getEligibleClientsForEnhancedBroadcast(broadcast) {
    let clientFilter = { status: 'Active' };

    if (!broadcast.targetAudience.allClients) {
      const orConditions = [];

      if (broadcast.targetAudience.specificClients?.length > 0) {
        orConditions.push({ _id: { $in: broadcast.targetAudience.specificClients } });
      }

      if (broadcast.targetAudience.clientTypes?.length > 0) {
        orConditions.push({ clientType: { $in: broadcast.targetAudience.clientTypes } });
      }

      if (broadcast.targetAudience.locations?.length > 0) {
        const locationConditions = broadcast.targetAudience.locations.map(loc => {
          const cond = {};
          if (loc.city) cond.city = new RegExp(loc.city, 'i');
          if (loc.state) cond.state = new RegExp(loc.state, 'i');
          if (loc.pincode) cond.pincode = loc.pincode;
          return cond;
        });
        if (locationConditions.length > 0) {
          orConditions.push({ $or: locationConditions });
        }
      }

      if (orConditions.length > 0) {
        clientFilter.$or = orConditions;
      }
    }

    return await Client.find(clientFilter);
  }

  /**
   * Personalize content with client data
   */
  personalizeContent(content, client) {
    if (!content) return '';
    
    let personalizedContent = content;

    // Replace placeholders
    const replacements = {
      '{{name}}': client.displayName || 'Valued Customer',
      '{{firstName}}': client.individualData?.firstName || client.corporateData?.contactPersonName || 'Customer',
      '{{email}}': client.email,
      '{{phone}}': client.phone,
      '{{city}}': client.city || '',
      '{{state}}': client.state || ''
    };

    Object.keys(replacements).forEach(placeholder => {
      personalizedContent = personalizedContent.replace(
        new RegExp(placeholder, 'g'), 
        replacements[placeholder] || ''
      );
    });

    return personalizedContent;
  }

  /**
   * Extract personalization variables
   */
  extractPersonalizationVariables(client) {
    return {
      name: client.displayName || 'Valued Customer',
      firstName: client.individualData?.firstName || client.corporateData?.contactPersonName || 'Customer',
      email: client.email,
      phone: client.phone,
      city: client.city || '',
      state: client.state || '',
      clientType: client.clientType
    };
  }
}

module.exports = new EnhancedBroadcastController();
