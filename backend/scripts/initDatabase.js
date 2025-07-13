const mongoose = require('mongoose');
const Client = require('../models/Client');
const User = require('../models/User');
require('dotenv').config();

/**
 * Database Initialization Script
 * Sets up indexes and ensures database is properly configured
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Connect to MongoDB
    const DB_URL = process.env.MONGODB_URI;
    if (!DB_URL) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Create indexes for Client model
    console.log('📊 Creating database indexes...');
    
    // Ensure unique index on clientId
    await Client.collection.createIndex({ clientId: 1 }, { unique: true });
    console.log('✅ Created unique index on clientId');
    
    // Handle text search index - drop existing conflicting index first
    try {
      // Get existing indexes
      const indexes = await Client.collection.indexes();
      const textIndexes = indexes.filter(index => index.key && index.key._fts === 'text');
      
      // Drop existing text indexes if they exist
      for (const textIndex of textIndexes) {
        try {
          await Client.collection.dropIndex(textIndex.name);
          console.log(`🗑️  Dropped existing text index: ${textIndex.name}`);
        } catch (dropError) {
          console.log(`ℹ️  Could not drop index ${textIndex.name}: ${dropError.message}`);
        }
      }
      
      // Create new text search index
      await Client.collection.createIndex({
        name: 'text',
        email: 'text',
        phone: 'text',
        clientId: 'text'
      });
      console.log('✅ Created text search index');
    } catch (error) {
      if (error.code === 11000 || error.code === 85) {
        console.log('ℹ️  Text search index configuration conflict resolved');
      } else {
        console.log(`⚠️  Text search index creation warning: ${error.message}`);
      }
    }
    
    // Create index for agent-based queries
    await Client.collection.createIndex({ agentId: 1 });
    console.log('✅ Created index on agentId');
    
    // Create index for status and type filtering
    await Client.collection.createIndex({ status: 1, clientType: 1 });
    console.log('✅ Created index on status and clientType');
    
    // Create index for date-based queries
    await Client.collection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on createdAt');
    
    // Verify database collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('📋 Available collections:', collectionNames);
    
    // Check if required collections exist
    const requiredCollections = ['clients', 'users', 'roles'];
    const missingCollections = requiredCollections.filter(col => !collectionNames.includes(col));
    
    if (missingCollections.length > 0) {
      console.log('⚠️  Missing collections:', missingCollections);
      console.log('💡 These will be created automatically when first documents are inserted');
    }
    
    // Get collection stats
    try {
      const clientStats = await Client.collection.stats();
      console.log(`📊 Clients collection: ${clientStats.count} documents, ${(clientStats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.log('📊 Clients collection: Empty or not yet created');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Health check function
 */
async function healthCheck() {
  try {
    const DB_URL = process.env.MONGODB_URI;
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Test basic operations
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database health check passed');
    
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return false;
  } finally {
    await mongoose.connection.close();
  }
}

// Run initialization if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'health') {
    healthCheck()
      .then(result => {
        process.exit(result ? 0 : 1);
      })
      .catch(() => {
        process.exit(1);
      });
  } else {
    initializeDatabase()
      .then(() => {
        console.log('✨ Initialization complete');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Initialization failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  initializeDatabase,
  healthCheck
};