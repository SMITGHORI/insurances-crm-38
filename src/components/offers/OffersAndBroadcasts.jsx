
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Megaphone, Gift, BarChart3, History, Settings } from 'lucide-react';
import BroadcastCreator from './BroadcastCreator';
import BroadcastHistory from './BroadcastHistory';
import OffersManager from '../communication/OffersManager';
import { useBroadcasts, useOffers } from '@/hooks/useOffersAndBroadcasts';

const OffersAndBroadcasts = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBroadcastCreator, setShowBroadcastCreator] = useState(false);

  const { data: broadcastsData } = useBroadcasts({ limit: 5 });
  const { data: offersData } = useOffers({ limit: 5 });

  const broadcasts = broadcastsData?.data || [];
  const offers = offersData?.data || [];

  const stats = {
    totalBroadcasts: broadcastsData?.pagination?.totalItems || broadcasts.length || 0,
    activeBroadcasts: broadcasts.filter(b => b.status === 'sent').length || 0,
    totalOffers: offersData?.pagination?.totalItems || offers.length || 0,
    activeOffers: offers.filter(o => o.isActive).length || 0
  };

  const recentBroadcasts = broadcasts.slice(0, 3);
  const recentOffers = offers.slice(0, 3);

  if (showBroadcastCreator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Broadcast</h2>
          <Button variant="outline" onClick={() => setShowBroadcastCreator(false)}>
            Back to Overview
          </Button>
        </div>
        <BroadcastCreator onSuccess={() => setShowBroadcastCreator(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Offers & Broadcasts</h2>
          <p className="text-gray-500">Manage your marketing campaigns and special offers</p>
        </div>
        <Button onClick={() => setShowBroadcastCreator(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Broadcast
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Broadcasts
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Offers
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Broadcasts</p>
                    <p className="text-2xl font-bold">{stats.totalBroadcasts}</p>
                  </div>
                  <Megaphone className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Broadcasts</p>
                    <p className="text-2xl font-bold">{stats.activeBroadcasts}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Offers</p>
                    <p className="text-2xl font-bold">{stats.totalOffers}</p>
                  </div>
                  <Gift className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Offers</p>
                    <p className="text-2xl font-bold">{stats.activeOffers}</p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Broadcasts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Recent Broadcasts
                </CardTitle>
                <CardDescription>Latest broadcast campaigns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentBroadcasts.length > 0 ? (
                  recentBroadcasts.map((broadcast) => (
                    <div key={broadcast._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{broadcast.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(broadcast.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={broadcast.status === 'sent' ? 'default' : 'secondary'}>
                        {broadcast.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No broadcasts yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Offers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Recent Offers
                </CardTitle>
                <CardDescription>Latest special offers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentOffers.length > 0 ? (
                  recentOffers.map((offer) => (
                    <div key={offer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{offer.title}</p>
                        <p className="text-sm text-gray-500">
                          {offer.discountPercentage ? `${offer.discountPercentage}% off` : 
                           offer.discountAmount ? `₹${offer.discountAmount} off` : 'Special offer'}
                        </p>
                      </div>
                      <Badge variant={offer.isActive ? 'default' : 'secondary'}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No offers yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="broadcasts">
          <BroadcastCreator />
        </TabsContent>

        <TabsContent value="offers">
          <OffersManager />
        </TabsContent>

        <TabsContent value="history">
          <BroadcastHistory />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Settings</CardTitle>
              <CardDescription>Configure default settings for broadcasts and offers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OffersAndBroadcasts;
