const mongoose = require('mongoose');
const Client = require('../models/Client');
const User = require('../models/User');
require('dotenv').config();

/**
 * Enhanced sample client data for development and testing
 * Data structure matches the Client model schema
 */
const sampleClients = [
  {
    clientId: 'CLI001',
    clientType: 'individual',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+91-9876543210',
    dob: '1985-06-15',
    gender: 'male',
    panNumber: 'ABCDE1234F',
    aadharNumber: '123456789012',
    address: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
    status: 'active',
    source: 'website',
    occupation: 'Software Engineer',
    annualIncome: 1200000,
    maritalStatus: 'married',
    nomineeName: 'Jane Doe',
    nomineeRelation: 'Spouse',
    nomineeContact: '+91-9876543211'
  },
  {
    clientId: 'CLI002',
    clientType: 'individual',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91-9876543212',
    dob: '1990-03-22',
    gender: 'female',
    panNumber: 'FGHIJ5678K',
    aadharNumber: '234567890123',
    address: '456 Oak Avenue, Block C',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    status: 'active',
    source: 'referral',
    occupation: 'Doctor',
    annualIncome: 1800000,
    maritalStatus: 'single'
  },
  {
    clientId: 'CLI003',
    clientType: 'corporate',
    companyName: 'Tech Solutions Pvt Ltd',
    email: 'contact@techsolutions.in',
    phone: '+91-9876543213',
    registrationNo: 'U72900KA2015PTC123456',
    gstNumber: '29ABCDE1234F1Z5',
    industry: 'IT',
    employeeCount: 75,
    turnover: 50000000,
    yearEstablished: 2015,
    website: 'www.techsolutions.in',
    address: '789 Business Park, Tower A',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    country: 'India',
    status: 'active',
    source: 'direct',
    contactPersonName: 'Rajesh Kumar',
    contactPersonDesignation: 'HR Manager',
    contactPersonEmail: 'rajesh@techsolutions.in',
    contactPersonPhone: '+91-9876543214'
  },
  {
    clientId: 'CLI004',
    clientType: 'individual',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@email.com',
    phone: '+91-9876543215',
    dob: '1978-11-08',
    gender: 'male',
    panNumber: 'KLMNO9012P',
    aadharNumber: '345678901234',
    address: '321 Pine Street, Sector 15',
    city: 'Gurgaon',
    state: 'Haryana',
    pincode: '122001',
    country: 'India',
    status: 'prospective',
    source: 'campaign',
    occupation: 'Business Owner',
    annualIncome: 2500000,
    maritalStatus: 'married',
    nomineeName: 'Sunita Patel',
    nomineeRelation: 'Spouse',
    nomineeContact: '+91-9876543216'
  },
  {
    clientId: 'CLI005',
    clientType: 'group',
    groupName: 'Mumbai Teachers Association',
    email: 'admin@mumbaiTeachers.org',
    phone: '+91-9876543217',
    groupType: 'association',
    memberCount: 250,
    primaryContactName: 'Dr. Meera Joshi',
    relationshipWithGroup: 'President',
    registrationID: 'MTA2010REG001',
    groupFormationDate: '2010-04-15',
    groupCategory: 'professional',
    groupPurpose: 'Professional development and welfare of teachers',
    address: '555 Education Hub, Central Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400020',
    country: 'India',
    status: 'active',
    source: 'referral'
  },
  {
    clientId: 'CLI006',
    clientType: 'corporate',
    companyName: 'Green Manufacturing Ltd',
    email: 'info@greenmanufacturing.com',
    phone: '+91-9876543218',
    registrationNo: 'U25200TN2012PLC234567',
    gstNumber: '33FGHIJ5678K2A6',
    industry: 'Manufacturing',
    employeeCount: 200,
    turnover: 120000000,
    yearEstablished: 2012,
    website: 'www.greenmanufacturing.com',
    address: '100 Industrial Estate, Phase II',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    country: 'India',
    status: 'active',
    source: 'lead',
    contactPersonName: 'Suresh Reddy',
    contactPersonDesignation: 'General Manager',
    contactPersonEmail: 'suresh@greenmanufacturing.com',
    contactPersonPhone: '+91-9876543219'
  }
];

/**
 * Seed clients data into the database
 */
async function seedClients() {
  try {
    console.log('🌱 Starting client data seeding...');
    
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
    
    // Check if clients already exist
    const existingClientsCount = await Client.countDocuments();
    console.log(`📊 Found ${existingClientsCount} existing clients`);
    
    if (existingClientsCount > 0) {
      const forceFlag = process.argv.includes('--force');
      if (!forceFlag) {
        console.log('⚠️  Clients already exist. Use --force flag to clear and reseed');
        return;
      }
      
      console.log('🗑️  Clearing existing clients...');
      await Client.deleteMany({});
      console.log('✅ Existing clients cleared');
    }
    
    // Get a sample agent for assignment (optional)
    let sampleAgent = null;
    try {
      sampleAgent = await User.findOne({ role: 'agent' });
      if (sampleAgent) {
        console.log(`👤 Found sample agent: ${sampleAgent.name}`);
      }
    } catch (error) {
      console.log('ℹ️  No agents found, clients will be created without agent assignment');
    }
    
    // Add agent to some clients if available
    const clientsToSeed = sampleClients.map((client, index) => {
      const clientData = {
        ...client,
        createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)), // Spread creation dates
        updatedAt: new Date()
      };
      
      // Assign agent to every other client
      if (sampleAgent && index % 2 === 0) {
        clientData.agentId = sampleAgent._id;
      }
      
      // Ensure individual-specific fields are only present for individual clients
      if (clientData.clientType !== 'individual') {
        delete clientData.firstName;
        delete clientData.lastName;
        delete clientData.dob;
        delete clientData.gender;
        delete clientData.panNumber;
        delete clientData.aadharNumber;
        delete clientData.occupation;
        delete clientData.annualIncome;
        delete clientData.maritalStatus;
        delete clientData.nomineeName;
        delete clientData.nomineeRelation;
        delete clientData.nomineeContact;
      }
      
      // Ensure corporate-specific fields are only present for corporate clients
      if (clientData.clientType !== 'corporate') {
        delete clientData.companyName;
        delete clientData.registrationNo;
        delete clientData.gstNumber;
        delete clientData.industry;
        delete clientData.employeeCount;
        delete clientData.turnover;
        delete clientData.yearEstablished;
        delete clientData.website;
        delete clientData.contactPersonName;
        delete clientData.contactPersonDesignation;
        delete clientData.contactPersonEmail;
        delete clientData.contactPersonPhone;
      }
      
      // Ensure group-specific fields are only present for group clients
      if (clientData.clientType !== 'group') {
        delete clientData.groupName;
        delete clientData.groupType;
        delete clientData.memberCount;
        delete clientData.primaryContactName;
        delete clientData.relationshipWithGroup;
        delete clientData.registrationID;
        delete clientData.groupFormationDate;
        delete clientData.groupCategory;
        delete clientData.groupPurpose;
      }
      
      return clientData;
    });
    
    // Insert clients
    console.log(`📝 Inserting ${clientsToSeed.length} sample clients...`);
    const insertedClients = await Client.insertMany(clientsToSeed);
    
    console.log(`✅ Successfully inserted ${insertedClients.length} clients`);
    
    // Display summary
    const stats = await Client.aggregate([
      {
        $group: {
          _id: '$clientType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('📊 Client distribution by type:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    
    console.log('🎉 Client seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Client seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Clear all clients from the database
 */
async function clearClients() {
  try {
    console.log('🗑️  Starting client data cleanup...');
    
    const DB_URL = process.env.MONGODB_URI;
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const count = await Client.countDocuments();
    console.log(`📊 Found ${count} clients to delete`);
    
    if (count > 0) {
      await Client.deleteMany({});
      console.log('✅ All clients deleted successfully');
    } else {
      console.log('ℹ️  No clients found to delete');
    }
    
  } catch (error) {
    console.error('❌ Client cleanup failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeding if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'clear') {
    clearClients()
      .then(() => {
        console.log('✨ Cleanup complete');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Cleanup failed:', error);
        process.exit(1);
      });
  } else {
    seedClients()
      .then(() => {
        console.log('✨ Seeding complete');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  seedClients,
  clearClients,
  sampleClients
};