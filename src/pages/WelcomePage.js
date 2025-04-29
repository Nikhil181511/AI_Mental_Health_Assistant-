import React from 'react';
import { Link } from 'react-router-dom'; // React Router Link for navigation
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
// Custom Card components
import { Activity, BookOpenText, BrainCircuit, CalendarHeart } from 'lucide-react'; // Icons from Lucide

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center text-center space-y-12">
      {/* Welcome Banner */}
      <div className="space-y-4">
        <BrainCircuit className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to Mindful AI
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your personalized companion for mental wellness. Explore resources, track your mood, and find support, all tailored to you.
        </p>
      </div>

      {/* Cards for different sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Emotional Check-in Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Emotional Check-in
            </CardTitle>
            <CardDescription>
              Reflect on your feelings and track your mood over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Regular check-ins help you understand your emotional patterns and provide data for personalized recommendations.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/checkin">Start Check-in</Link> {/* React Router Link */}
            </Button>
          </CardFooter>
        </Card>

        {/* Content Library Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="h-5 w-5 text-secondary-foreground" />
              Content Library
            </CardTitle>
            <CardDescription>
              Discover articles, exercises, and videos for wellness.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Explore a curated collection of resources covering topics like anxiety, stress management, and mindfulness techniques.</p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" asChild className="w-full">
              <Link to="/library">Browse Library</Link> {/* React Router Link */}
            </Button>
          </CardFooter>
        </Card>

        {/* AI Recommendations Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarHeart className="h-5 w-5 text-accent-foreground" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Get personalized suggestions based on your check-ins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Our AI analyzes your check-ins to suggest relevant content and exercises just for you.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full border-accent text-accent-foreground hover:bg-accent/10">
              <Link to="/recommendations">View Recommendations</Link> {/* React Router Link */}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
