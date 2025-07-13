require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Fix problematic indexes in the clients collection
 */
async function fixIndexes() {
  try {
    console.log('🔧 Starting index fix...');
    
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
    
    const db = mongoose.connection.db;
    const collection = db.collection('clients');
    
    // Get all existing indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('📋 Current indexes:', indexes.map(idx => idx.name));
    
    // Drop problematic indexes
    const problematicIndexes = [
      'individualData.panNumber_1',
      'corporateData.registrationNo_1',
      'corporateData.gstNumber_1'
    ];
    
    for (const indexName of problematicIndexes) {
      try {
        await collection.dropIndex(indexName);
        console.log(`🗑️  Dropped index: ${indexName}`);
      } catch (error) {
        console.log(`ℹ️  Index ${indexName} not found or already dropped`);
      }
    }
    
    // Create correct indexes
    console.log('🔨 Creating correct indexes...');
    
    // Individual client indexes
    await collection.createIndex(
      { panNumber: 1 },
      { 
        unique: true,
        partialFilterExpression: { clientType: 'individual', panNumber: { $exists: true } }
      }
    );
    console.log('✅ Created panNumber index for individual clients');
    
    // Corporate client indexes
    await collection.createIndex(
      { registrationNo: 1 },
      { 
        unique: true,
        partialFilterExpression: { clientType: 'corporate', registrationNo: { $exists: true } }
      }
    );
    console.log('✅ Created registrationNo index for corporate clients');
    
    await collection.createIndex(
      { gstNumber: 1 },
      { 
        unique: true,
        partialFilterExpression: { clientType: 'corporate', gstNumber: { $exists: true } }
      }
    );
    console.log('✅ Created gstNumber index for corporate clients');
    
    // List final indexes
    const finalIndexes = await collection.listIndexes().toArray();
    console.log('📋 Final indexes:', finalIndexes.map(idx => idx.name));
    
    console.log('🎉 Index fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Index fix failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
fixIndexes()
  .then(() => {
    console.log('✨ Index fix complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Index fix failed:', error.message);
    process.exit(1);
  });