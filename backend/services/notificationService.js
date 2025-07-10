
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Send notification to users
 */
exports.sendNotification = async ({ type, title, message, recipients, data = {} }) => {
  try {
    let targetUsers = [];

    if (Array.isArray(recipients)) {
      // Recipients are user IDs or roles
      for (const recipient of recipients) {
        if (typeof recipient === 'string' && recipient.includes('_')) {
          // It's a role
          const users = await User.find({ role: recipient, isActive: true });
          targetUsers = targetUsers.concat(users);
        } else {
          // It's a user ID
          const user = await User.findById(recipient);
          if (user) targetUsers.push(user);
        }
      }
    }

    // Create notifications
    const notifications = targetUsers.map(user => ({
      userId: user._id,
      type,
      title,
      message,
      data,
      createdAt: new Date()
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return { sent: notifications.length };

  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send email notification
 */
exports.sendEmailNotification = async ({ to, subject, template, data = {} }) => {
  // Implementation for email notifications
  // This would integrate with email service like SendGrid, AWS SES, etc.
  console.log('Email notification sent:', { to, subject, template, data });
};

/**
 * Send SMS notification
 */
exports.sendSMSNotification = async ({ to, message }) => {
  // Implementation for SMS notifications
  // This would integrate with SMS service like Twilio, AWS SNS, etc.
  console.log('SMS notification sent:', { to, message });
};
