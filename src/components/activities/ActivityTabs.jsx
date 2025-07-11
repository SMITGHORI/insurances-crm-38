
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  FileText, 
  AlertTriangle, 
  Quote, 
  TrendingUp,
  User,
  CreditCard,
  FileCheck,
  Settings
} from 'lucide-react';

const ActivityTabs = ({ activeTab, onTabChange, activityCounts = {} }) => {
  const tabs = [
    { 
      id: 'all', 
      label: 'All Activities', 
      icon: Activity, 
      count: activityCounts.total || 0 
    },
    { 
      id: 'client', 
      label: 'Clients', 
      icon: Users, 
      count: activityCounts.client || 0 
    },
    { 
      id: 'policy', 
      label: 'Policies', 
      icon: FileText, 
      count: activityCounts.policy || 0 
    },
    { 
      id: 'claim', 
      label: 'Claims', 
      icon: AlertTriangle, 
      count: activityCounts.claim || 0 
    },
    { 
      id: 'quotation', 
      label: 'Quotations', 
      icon: Quote, 
      count: activityCounts.quotation || 0 
    },
    { 
      id: 'lead', 
      label: 'Leads', 
      icon: TrendingUp, 
      count: activityCounts.lead || 0 
    },
    { 
      id: 'agent', 
      label: 'Agents', 
      icon: User, 
      count: activityCounts.agent || 0 
    },
    { 
      id: 'payment', 
      label: 'Payments', 
      icon: CreditCard, 
      count: activityCounts.payment || 0 
    },
    { 
      id: 'document', 
      label: 'Documents', 
      icon: FileCheck, 
      count: activityCounts.document || 0 
    },
    { 
      id: 'system', 
      label: 'System', 
      icon: Settings, 
      count: activityCounts.system || 0 
    }
  ];

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 p-2 text-xs"
              >
                <div className="flex items-center gap-1">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="text-xs min-w-[20px] h-5">
                    {tab.count > 999 ? '999+' : tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ActivityTabs;
