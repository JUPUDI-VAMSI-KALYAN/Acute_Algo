"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MessageSquare, Star, Bug, Lightbulb, Heart, Send, Github, User as UserIcon } from 'lucide-react';
import { submitFeedback, type FeedbackFormData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function FeedbackPage() {
  const { user, isLoading } = useAuth();

  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    rating: 0,
    allowContact: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await submitFeedback(formData);
      
      if (response.success) {
        toast.success(response.message);
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          category: '',
          subject: '',
          message: '',
          rating: 0,
          allowContact: true,
        }));
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const feedbackCategories = [
    { value: 'bug', label: 'Bug Report', icon: Bug },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb },
    { value: 'improvement', label: 'Improvement Suggestion', icon: Star },
    { value: 'general', label: 'General Feedback', icon: MessageSquare },
    { value: 'compliment', label: 'Compliment', icon: Heart },
  ];

  if (isLoading) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
        <div className="flex items-center gap-2 shrink-0">
          <MessageSquare className="h-6 w-6" />
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Feedback
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
        <div className="flex items-center gap-2 shrink-0">
          <MessageSquare className="h-6 w-6" />
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">
            Feedback
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Please log in to submit feedback.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
      <div className="flex items-center gap-2 shrink-0">
        <MessageSquare className="h-6 w-6" />
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">
          Feedback
        </h1>
      </div>

      <div className="grid gap-6">
        {/* Feedback Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>We Value Your Feedback</CardTitle>
            <CardDescription>
                          Your feedback helps us improve Acute Algo. Whether you&apos;ve found a bug, have a feature request, 
            or just want to share your thoughts, we&apos;d love to hear from you.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Feedback From
            </CardTitle>
            <CardDescription>
              Your feedback will be submitted with the following account information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl || ''} alt={user.name || user.email} />
                <AvatarFallback>
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">{user.name || 'GitHub User'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.githubUsername && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Github className="h-3 w-3" />
                    <span>@{user.githubUsername}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback Form - Takes 2 columns on large screens */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Share Your Feedback</CardTitle>
              <CardDescription>
                Please provide as much detail as possible to help us understand your feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    From your GitHub account
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    required
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Managed through your GitHub account
                  </p>
                </div>
              </div>

              {/* Feedback Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Feedback Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback category" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackCategories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Overall Rating */}
              <div className="space-y-2">
                <Label>Overall Rating (Optional)</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className={`p-1 rounded transition-colors ${
                        star <= formData.rating
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                  {formData.rating > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formData.rating} out of 5 stars
                    </span>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief summary of your feedback"
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide detailed feedback..."
                  rows={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  For bug reports, please include steps to reproduce the issue.
                </p>
              </div>

              {/* Contact Permission */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowContact"
                  checked={formData.allowContact}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, allowContact: !!checked }))
                  }
                />
                <Label htmlFor="allowContact" className="text-sm">
                  Allow us to contact you about this feedback
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

          {/* Quick Feedback Options - Takes 1 column on large screens */}
          <Card>
          <CardHeader>
            <CardTitle>Quick Feedback</CardTitle>
            <CardDescription>
              Common feedback categories for quick access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {feedbackCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.value}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Contact Information - Full width */}
        <Card>
          <CardHeader>
            <CardTitle>Other Ways to Reach Us</CardTitle>
            <CardDescription>
              Prefer to contact us directly? Here are other ways to get in touch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  For general inquiries and support
                </p>
                <Badge variant="outline">
                  <a href="mailto:help@acutealgo.ai" className="hover:underline">
                    help@acutealgo.ai
                  </a>
                </Badge>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Bug Reports</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  For critical bugs and issues
                </p>
                <Badge variant="outline">
                  <a href="mailto:bugs@acutealgo.ai" className="hover:underline">
                    bugs@acutealgo.ai
                  </a>
                </Badge>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Feature Requests</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  For new feature suggestions
                </p>
                <Badge variant="outline">
                  <a href="mailto:features@acutealgo.ai" className="hover:underline">
                    features@acutealgo.ai
                  </a>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 