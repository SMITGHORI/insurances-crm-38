
const Role = require('../models/Role');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedRoles = async () => {
  try {
    console.log('Seeding roles...');

    // Check if roles already exist
    const existingRoles = await Role.countDocuments();
    if (existingRoles > 0) {
      console.log('Roles already exist, skipping role creation...');
      return await Role.find();
    }

    // Create default roles
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'agents', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'settings', actions: ['view', 'edit'] },
          { module: 'activities', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'offers', actions: ['view', 'create', 'edit', 'delete', 'export'] }
        ],
        isDefault: true
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'invoices', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'agents', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'settings', actions: ['view'] },
          { module: 'activities', actions: ['view', 'create'] },
          { module: 'offers', actions: ['view', 'create', 'edit', 'export'] }
        ],
        isDefault: true
      },
      {
        name: 'manager',
        displayName: 'Manager',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'invoices', actions: ['view', 'create', 'edit'] },
          { module: 'agents', actions: ['view', 'export'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'activities', actions: ['view', 'create'] },
          { module: 'offers', actions: ['view', 'create', 'edit'] }
        ],
        isDefault: true
      },
      {
        name: 'agent',
        displayName: 'Agent',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit'] },
          { module: 'policies', actions: ['view', 'create'] },
          { module: 'claims', actions: ['view', 'create'] },
          { module: 'leads', actions: ['view', 'create', 'edit'] },
          { module: 'quotations', actions: ['view', 'create', 'edit'] },
          { module: 'invoices', actions: ['view'] },
          { module: 'activities', actions: ['view'] },
          { module: 'offers', actions: ['view'] }
        ],
        isDefault: true
      }
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log('Roles created:', createdRoles.length);

    return createdRoles;
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
};

const seedUsers = async () => {
  try {
    console.log('Seeding users...');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping user creation...');
      return await User.find().populate('role');
    }

    // Get roles
    const superAdminRole = await Role.findOne({ name: 'super_admin' });
    const agentRole = await Role.findOne({ name: 'agent' });

    if (!superAdminRole || !agentRole) {
      throw new Error('Roles not found. Please run role seeder first.');
    }

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const agentPasswordHash = await bcrypt.hash('agent123', 12);

    // Create default users
    const users = [
      {
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: adminPasswordHash,
        role: superAdminRole._id,
        branch: 'main',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Test Agent',
        email: 'agent@gmail.com',
        password: agentPasswordHash,
        role: agentRole._id,
        branch: 'main',
        isActive: true,
        isEmailVerified: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users created:', createdUsers.length);

    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    const roles = await seedRoles();
    const users = await seedUsers();
    
    console.log('Database seeding completed successfully!');
    console.log(`Roles: ${roles.length}, Users: ${users.length}`);
    console.log('Test credentials:');
    console.log('Admin: admin@gmail.com / admin123');
    console.log('Agent: agent@gmail.com / agent123');
    
    return { roles, users };
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
};

module.exports = {
  seedRoles,
  seedUsers,
  seedDatabase
};
