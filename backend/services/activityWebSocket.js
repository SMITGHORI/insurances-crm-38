
const WebSocket = require('ws');
const Activity = require('../models/Activity');

class ActivityWebSocketService {
  constructor() {
    this.clients = new Set();
    this.activityQueue = [];
    this.processingQueue = false;
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws/activities'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection for activities');
      
      // Add client to set
      this.clients.add(ws);

      // Send recent activities on connection
      this.sendRecentActivities(ws);

      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('WebSocket client disconnected from activities');
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  async sendRecentActivities(ws) {
    try {
      const activities = await Activity.find({ isArchived: false })
        .populate('userId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      ws.send(JSON.stringify({
        type: 'INITIAL_ACTIVITIES',
        data: activities
      }));
    } catch (error) {
      console.error('Error sending recent activities:', error);
    }
  }

  handleClientMessage(ws, data) {
    switch (data.type) {
      case 'SUBSCRIBE_ACTIVITIES':
        ws.isSubscribed = true;
        break;
      case 'UNSUBSCRIBE_ACTIVITIES':
        ws.isSubscribed = false;
        break;
      case 'REQUEST_REFRESH':
        this.sendRecentActivities(ws);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  broadcastActivity(activity) {
    if (this.clients.size === 0) return;

    const message = JSON.stringify({
      type: 'NEW_ACTIVITY',
      data: activity
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.isSubscribed) {
        client.send(message);
      }
    });
  }

  broadcastActivityUpdate(activityId, updates) {
    if (this.clients.size === 0) return;

    const message = JSON.stringify({
      type: 'ACTIVITY_UPDATED',
      data: { id: activityId, ...updates }
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.isSubscribed) {
        client.send(message);
      }
    });
  }

  broadcastStats(stats) {
    if (this.clients.size === 0) return;

    const message = JSON.stringify({
      type: 'ACTIVITY_STATS',
      data: stats
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Queue activities for batch processing
  queueActivity(activityData) {
    this.activityQueue.push(activityData);
    
    if (!this.processingQueue) {
      this.processActivityQueue();
    }
  }

  async processActivityQueue() {
    this.processingQueue = true;

    while (this.activityQueue.length > 0) {
      const batch = this.activityQueue.splice(0, 10); // Process 10 at a time
      
      try {
        const activities = await Activity.insertMany(batch);
        
        // Broadcast each new activity
        activities.forEach(activity => {
          this.broadcastActivity(activity);
        });
        
      } catch (error) {
        console.error('Error processing activity queue:', error);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processingQueue = false;
  }

  getConnectionCount() {
    return this.clients.size;
  }

  closeAllConnections() {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    this.clients.clear();
  }
}

module.exports = new ActivityWebSocketService();
