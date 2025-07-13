require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('../models/Client');

async function verifyClients() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const count = await Client.countDocuments();
    console.log('📊 Total clients:', count);
    
    const types = await Client.aggregate([
      { $group: { _id: '$clientType', count: { $sum: 1 } } }
    ]);
    
    console.log('📋 By type:');
    types.forEach(type => {
      console.log(`   ${type._id}: ${type.count}`);
    });
    
    const clients = await Client.find({}, 'clientId clientType firstName lastName companyName groupName email status').sort('clientId');
    
    console.log('\n📝 Client List:');
    clients.forEach(client => {
      let name = '';
      if (client.clientType === 'individual') {
        name = `${client.firstName} ${client.lastName}`;
      } else if (client.clientType === 'corporate') {
        name = client.companyName;
      } else if (client.clientType === 'group') {
        name = client.groupName;
      }
      console.log(`   ${client.clientId}: ${client.clientType} - ${name} (${client.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

verifyClients();