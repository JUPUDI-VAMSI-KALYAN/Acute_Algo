"use client"

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ChevronUp, 
  Clock, 
  TrendingUp, 
  Star, 
  Calendar,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { 
  getPublicFeatureRequests, 
  getTrendingFeatureRequests,
  upvoteFeatureRequest,
  removeUpvoteFromFeatureRequest,
  type PublicFeatureRequest 
} from '@/lib/api';

// Simple user identification (in production, use proper auth)
const getUserIdentifier = () => {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('acute_algo_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('acute_algo_user_id', userId);
    }
    return userId;
  }
  return 'anonymous';
};

export default function FeaturesPage() {
  const [features, setFeatures] = useState<PublicFeatureRequest[]>([]);
  const [trendingFeatures, setTrendingFeatures] = useState<PublicFeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('upvotes');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userIdentifier] = useState(getUserIdentifier());

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? undefined : statusFilter;
      
      const [featuresResponse, trendingResponse] = await Promise.all([
        getPublicFeatureRequests(page, 20, sortBy, status, userIdentifier),
        getTrendingFeatureRequests(6, userIdentifier)
      ]);

      setFeatures(featuresResponse.data);
      setTotalPages(featuresResponse.totalPages);
      setTrendingFeatures(trendingResponse.data);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast.error('Failed to load feature requests');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, statusFilter, userIdentifier]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const handleUpvote = async (featureId: number, currentlyUpvoted: boolean) => {
    try {
      if (currentlyUpvoted) {
        await removeUpvoteFromFeatureRequest(featureId, userIdentifier);
        toast.success('Upvote removed');
      } else {
        await upvoteFeatureRequest(featureId, {
          userIdentifier,
          userEmail: undefined, // Could get from user context
          userName: undefined
        });
        toast.success('Thanks for your upvote!');
      }
      
      // Refresh the features to get updated counts
      await fetchFeatures();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to vote');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'critical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Feature Requests</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Vote for features you&apos;d like to see in Acute Algo. Your voice shapes our roadmap!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              All Features
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          {/* Trending Features Tab */}
          <TabsContent value="trending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending This Month
                </CardTitle>
                <CardDescription>
                  Features gaining the most upvotes recently
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : trendingFeatures.length > 0 ? (
                  <div className="grid gap-4">
                    {trendingFeatures.map((feature) => (
                      <Card key={feature.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Button
                              variant={feature.userHasUpvoted ? "default" : "outline"}
                              size="sm"
                              className="flex flex-col items-center min-w-[60px] h-auto py-2"
                              onClick={() => handleUpvote(feature.id, feature.userHasUpvoted || false)}
                            >
                              <ChevronUp className="h-4 w-4" />
                              <span className="text-xs font-medium">{feature.upvoteCount}</span>
                            </Button>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1">{feature.subject}</h3>
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                {feature.message}
                              </p>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={getStatusColor(feature.status)}>
                                  {feature.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className={getPriorityColor(feature.priority)}>
                                  {feature.priority} priority
                                </Badge>
                                {feature.recentUpvotes && feature.recentUpvotes > 0 && (
                                  <Badge variant="secondary">
                                    +{feature.recentUpvotes} this month
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {formatDate(feature.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No trending features at the moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Features Tab */}
          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Sort by:</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upvotes">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Upvotes
                          </div>
                        </SelectItem>
                        <SelectItem value="recent">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Recent
                          </div>
                        </SelectItem>
                        <SelectItem value="trending">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Trending
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Status:</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features List */}
            {loading ? (
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : features.length > 0 ? (
              <div className="grid gap-4">
                {features.map((feature) => (
                  <Card key={feature.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Button
                          variant={feature.userHasUpvoted ? "default" : "outline"}
                          size="sm"
                          className="flex flex-col items-center min-w-[60px] h-auto py-3"
                          onClick={() => handleUpvote(feature.id, feature.userHasUpvoted || false)}
                        >
                          <ChevronUp className="h-4 w-4" />
                          <span className="text-sm font-medium">{feature.upvoteCount}</span>
                        </Button>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xl mb-2">{feature.subject}</h3>
                          <p className="text-muted-foreground mb-4">
                            {feature.message}
                          </p>
                          
                          {feature.implementationNotes && (
                            <div className="bg-muted p-3 rounded-lg mb-4">
                              <h4 className="font-medium text-sm mb-1">Implementation Notes:</h4>
                              <p className="text-sm text-muted-foreground">{feature.implementationNotes}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={getStatusColor(feature.status)}>
                              {feature.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(feature.priority)}>
                              {feature.priority} priority
                            </Badge>
                            {feature.estimatedCompletion && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Est. {formatDate(feature.estimatedCompletion)}
                              </Badge>
                            )}
                            {feature.recentUpvotes && feature.recentUpvotes > 0 && (
                              <Badge variant="secondary">
                                +{feature.recentUpvotes} this month
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground ml-auto">
                              Requested {formatDate(feature.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No feature requests found</h3>
                <p className="text-muted-foreground">
                  Be the first to suggest a new feature!
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Have a Feature Idea?</h3>
            <p className="text-muted-foreground mb-4">
              Share your ideas and help shape the future of Acute Algo
            </p>
            <Button asChild>
              <a href="/dashboard/feedback">Submit Feature Request</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 