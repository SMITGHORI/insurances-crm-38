
const Agent = require('../models/Agent');

/**
 * Generate unique agent ID
 */
exports.generateAgentId = async () => {
  const year = new Date().getFullYear();
  const prefix = `AGT-${year}`;
  
  // Find the last agent ID for this year
  const lastAgent = await Agent.findOne({
    agentId: { $regex: `^${prefix}` }
  }).sort({ agentId: -1 });
  
  let nextNumber = 1;
  if (lastAgent) {
    const lastNumber = parseInt(lastAgent.agentId.split('-').pop());
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
};

/**
 * Generate unique policy number
 */
exports.generatePolicyNumber = async () => {
  const Policy = require('../models/Policy');
  const year = new Date().getFullYear();
  const prefix = `POL-${year}`;
  
  const lastPolicy = await Policy.findOne({
    policyNumber: { $regex: `^${prefix}` }
  }).sort({ policyNumber: -1 });
  
  let nextNumber = 1;
  if (lastPolicy) {
    const lastNumber = parseInt(lastPolicy.policyNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
};

/**
 * Generate unique client ID
 */
exports.generateClientId = async () => {
  const Client = require('../models/Client');
  const year = new Date().getFullYear();
  const prefix = `CLT-${year}`;
  
  const lastClient = await Client.findOne({
    clientId: { $regex: `^${prefix}` }
  }).sort({ clientId: -1 });
  
  let nextNumber = 1;
  if (lastClient) {
    const lastNumber = parseInt(lastClient.clientId.split('-').pop());
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
};
