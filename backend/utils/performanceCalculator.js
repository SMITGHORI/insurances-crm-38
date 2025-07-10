
/**
 * Calculate performance metrics for an agent
 */
exports.calculatePerformanceMetrics = async (agentId, period = 'month', year = new Date().getFullYear()) => {
  const Client = require('../models/Client');
  const Policy = require('../models/Policy');
  const Commission = require('../models/Commission');
  
  try {
    // Date range based on period
    let startDate, endDate;
    const currentDate = new Date();
    
    switch (period) {
      case 'month':
        startDate = new Date(year, currentDate.getMonth(), 1);
        endDate = new Date(year, currentDate.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(currentDate.getMonth() / 3);
        startDate = new Date(year, quarter * 3, 1);
        endDate = new Date(year, (quarter + 1) * 3, 0);
        break;
      case 'year':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
      default:
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
    }

    // Fetch performance data
    const [clients, policies, commissions] = await Promise.all([
      Client.find({
        agentId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).lean(),
      Policy.find({
        agentId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).lean(),
      Commission.find({
        agentId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).lean()
    ]);

    // Calculate metrics
    const clientsCount = clients.length;
    const policiesCount = policies.length;
    const totalPremium = policies.reduce((sum, policy) => sum + (policy.premium || 0), 0);
    const totalCommission = commissions.reduce((sum, comm) => sum + (comm.amount || 0), 0);
    
    // Calculate conversion rate (policies per client)
    const conversionRate = clientsCount > 0 ? (policiesCount / clientsCount) * 100 : 0;
    
    // Calculate average deal size
    const avgDealSize = policiesCount > 0 ? totalPremium / policiesCount : 0;

    // Monthly breakdown
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      const monthClients = clients.filter(c => 
        c.createdAt >= monthStart && c.createdAt <= monthEnd
      ).length;
      
      const monthPolicies = policies.filter(p => 
        p.createdAt >= monthStart && p.createdAt <= monthEnd
      );
      
      const monthPremium = monthPolicies.reduce((sum, p) => sum + (p.premium || 0), 0);
      const monthCommission = commissions.filter(c => 
        c.createdAt >= monthStart && c.createdAt <= monthEnd
      ).reduce((sum, c) => sum + (c.amount || 0), 0);

      monthlyData.push({
        month: `${year}-${(month + 1).toString().padStart(2, '0')}`,
        newClients: monthClients,
        newPolicies: monthPolicies.length,
        premium: monthPremium,
        commission: monthCommission
      });
    }

    return {
      overview: {
        clientsCount,
        policiesCount,
        totalPremium,
        totalCommission,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgDealSize: Math.round(avgDealSize * 100) / 100
      },
      monthlyData,
      targets: {
        monthly: {
          policies: 8,
          premium: 15000
        },
        quarterly: {
          policies: 24,
          premium: 45000
        },
        annual: {
          policies: 96,
          premium: 180000
        }
      },
      achievements: [
        {
          title: 'Top Performer Q1 2024',
          date: new Date('2024-03-31'),
          description: 'Exceeded quarterly targets by 150%'
        }
      ]
    };

  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    throw error;
  }
};

/**
 * Calculate agent ranking based on performance
 */
exports.calculateAgentRanking = async (metric = 'totalPremium', period = 'month') => {
  const Agent = require('../models/Agent');
  
  try {
    const agents = await Agent.find({ status: 'active' })
      .select('name totalPremium conversionRate clientsCount policiesCount')
      .lean();

    // Sort agents based on metric
    agents.sort((a, b) => {
      switch (metric) {
        case 'totalPremium':
          return (b.totalPremium || 0) - (a.totalPremium || 0);
        case 'conversionRate':
          return (b.conversionRate || 0) - (a.conversionRate || 0);
        case 'clientsCount':
          return (b.clientsCount || 0) - (a.clientsCount || 0);
        case 'policiesCount':
          return (b.policiesCount || 0) - (a.policiesCount || 0);
        default:
          return (b.totalPremium || 0) - (a.totalPremium || 0);
      }
    });

    return agents.map((agent, index) => ({
      ...agent,
      rank: index + 1
    }));

  } catch (error) {
    console.error('Error calculating agent ranking:', error);
    throw error;
  }
};
