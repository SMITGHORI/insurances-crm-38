const mongoose = require('mongoose');
const Client = require('../models/Client');
require('dotenv').config();

/**
 * Comprehensive test script for Client Module functionality
 * Tests CRUD operations, validation, and database connectivity
 */

class ClientModuleTester {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }

  logTest(testName, passed, message = '') {
    this.totalTests++;
    if (passed) {
      this.passedTests++;
      console.log(`✅ ${testName}: PASSED ${message}`);
    } else {
      console.log(`❌ ${testName}: FAILED ${message}`);
    }
    this.testResults.push({ testName, passed, message });
  }

  async testCreateIndividualClient() {
    try {
      const clientData = {
        clientType: 'individual',
        email: 'test.individual@example.com',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        status: 'active',
        firstName: 'Test',
        lastName: 'Individual',
        dob: new Date('1990-01-01'),
        gender: 'male',
        panNumber: 'ABCDE1234F',
        occupation: 'Software Engineer'
      };

      const client = new Client(clientData);
      const savedClient = await client.save();
      
      this.logTest('Create Individual Client', !!savedClient._id, `ID: ${savedClient.clientId}`);
      return savedClient;
    } catch (error) {
      this.logTest('Create Individual Client', false, error.message);
      return null;
    }
  }

  async testCreateCorporateClient() {
    try {
      const clientData = {
        clientType: 'corporate',
        email: 'contact@testcorp.com',
        phone: '9876543211',
        address: '456 Business Park',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
        status: 'active',
        companyName: 'Test Corporation',
         registrationNo: 'REG123456',
         gstNumber: 'GST123456789',
         industry: 'IT',
         employeeCount: 100,
        contactPersonName: 'John Doe',
        contactPersonDesignation: 'Manager',
        contactPersonEmail: 'john@testcorp.com',
        contactPersonPhone: '9876543211'
      };

      const client = new Client(clientData);
      const savedClient = await client.save();
      
      this.logTest('Create Corporate Client', !!savedClient._id, `ID: ${savedClient.clientId}`);
      return savedClient;
    } catch (error) {
      this.logTest('Create Corporate Client', false, error.message);
      return null;
    }
  }

  async testCreateGroupClient() {
    try {
      const clientData = {
        clientType: 'group',
        email: 'admin@testgroup.com',
        phone: '9876543212',
        address: '789 Group Colony',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
        status: 'active',
        groupName: 'Test Group',
        groupType: 'society',
        memberCount: 50,
        primaryContactName: 'Jane Smith',
        primaryContactDesignation: 'Secretary'
      };

      const client = new Client(clientData);
      const savedClient = await client.save();
      
      this.logTest('Create Group Client', !!savedClient._id, `ID: ${savedClient.clientId}`);
      return savedClient;
    } catch (error) {
      this.logTest('Create Group Client', false, error.message);
      return null;
    }
  }

  async testReadClients() {
    try {
      const clients = await Client.find({}).limit(10);
      this.logTest('Read Clients', clients.length > 0, `Found ${clients.length} clients`);
      return clients;
    } catch (error) {
      this.logTest('Read Clients', false, error.message);
      return [];
    }
  }

  async testUpdateClient(clientId) {
    try {
      const updatedClient = await Client.findByIdAndUpdate(
        clientId,
        { status: 'inactive', notes: 'Updated by test script' },
        { new: true }
      );
      
      this.logTest('Update Client', !!updatedClient && updatedClient.status === 'inactive', 
        `Status changed to: ${updatedClient?.status}`);
      return updatedClient;
    } catch (error) {
      this.logTest('Update Client', false, error.message);
      return null;
    }
  }

  async testSearchClients() {
    try {
      const searchResults = await Client.find({
        $or: [
          { email: { $regex: 'test', $options: 'i' } },
          { firstName: { $regex: 'test', $options: 'i' } },
          { companyName: { $regex: 'test', $options: 'i' } }
        ]
      });
      
      this.logTest('Search Clients', searchResults.length > 0, 
        `Found ${searchResults.length} matching clients`);
      return searchResults;
    } catch (error) {
      this.logTest('Search Clients', false, error.message);
      return [];
    }
  }

  async testValidation() {
    try {
      // Test invalid email and missing required fields
      const invalidClient = new Client({
        clientType: 'individual',
        email: 'invalid-email', // Invalid email format
        phone: '123', // Invalid phone
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        country: 'India'
        // Missing required fields like firstName, lastName, etc.
      });

      await invalidClient.save();
      this.logTest('Validation Test', false, 'Should have failed validation');
    } catch (error) {
      this.logTest('Validation Test', true, 'Correctly rejected invalid data');
    }
  }

  async testDeleteClient(clientId) {
    try {
      const deletedClient = await Client.findByIdAndDelete(clientId);
      this.logTest('Delete Client', !!deletedClient, `Deleted client: ${deletedClient?.clientId}`);
      return deletedClient;
    } catch (error) {
      this.logTest('Delete Client', false, error.message);
      return null;
    }
  }

  async testIndexes() {
    try {
      const indexes = await Client.collection.getIndexes();
      const hasEmailIndex = Object.keys(indexes).some(key => key.includes('email'));
      const hasClientIdIndex = Object.keys(indexes).some(key => key.includes('clientId'));
      
      this.logTest('Database Indexes', hasEmailIndex && hasClientIdIndex, 
        `Found ${Object.keys(indexes).length} indexes`);
    } catch (error) {
      this.logTest('Database Indexes', false, error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Client Module Tests...\n');
    
    const connected = await this.connect();
    if (!connected) {
      console.log('❌ Cannot proceed without database connection');
      return;
    }

    // Clean up any existing test data
    await Client.deleteMany({ email: { $regex: 'test.*@example\.com|.*@testcorp\.com|.*@testgroup\.com' } });
    console.log('🧹 Cleaned up existing test data\n');

    // Run tests
    const individualClient = await this.testCreateIndividualClient();
    const corporateClient = await this.testCreateCorporateClient();
    const groupClient = await this.testCreateGroupClient();
    
    await this.testReadClients();
    await this.testSearchClients();
    await this.testValidation();
    await this.testIndexes();
    
    if (individualClient) {
      await this.testUpdateClient(individualClient._id);
      await this.testDeleteClient(individualClient._id);
    }
    
    // Clean up test data
    if (corporateClient) await this.testDeleteClient(corporateClient._id);
    if (groupClient) await this.testDeleteClient(groupClient._id);
    
    await this.disconnect();
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 All tests passed! Client module is fully functional.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the issues above.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ClientModuleTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ClientModuleTester;