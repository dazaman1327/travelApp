import { useState } from "react";
import { useLocation } from "wouter";
import { destinations, activities, regions } from "@/lib/mock-data";
import { DestinationCard } from "@/components/destination-card";
import { ActivityCard } from "@/components/activity-card";
import { BudgetSlider } from "@/components/budget-slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Compass, DollarSign, Activity } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [budget, setBudget] = useState([2000]);

  const { mutate: createConversation, isPending } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", {
        messages: [],
        preferences: {
          budget: budget[0],
          region: selectedRegion,
          activities: selectedActivities,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      setLocation(`/chat/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[url('https://images.unsplash.com/photo-1531403009284-440f080d1e12')] bg-cover bg-center">
        <div className="backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Your AI Travel Companion
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get personalized travel recommendations and plan your perfect trip with our AI-powered advisor.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-20">
        {/* Inspiration Section */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <Compass className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Be Inspired</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} {...destination} />
            ))}
          </div>
        </section>

        {/* Planning Sections */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Budget Section */}
          <section>
            <div className="flex items-center gap-2 mb-8">
              <DollarSign className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Plan by Budget</h2>
            </div>
            <div className="p-6 border rounded-lg">
              <BudgetSlider value={budget} onChange={setBudget} />
            </div>
          </section>

          {/* Region Section */}
          <section>
            <div className="flex items-center gap-2 mb-8">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Plan by Destination</h2>
            </div>
            <div className="p-6 border rounded-lg">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
        </div>

        {/* Activities Section */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <Activity className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Plan by Activity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                {...activity}
                selected={selectedActivities.includes(activity.name)}
                onClick={() => {
                  setSelectedActivities((prev) =>
                    prev.includes(activity.name)
                      ? prev.filter((a) => a !== activity.name)
                      : [...prev, activity.name]
                  );
                }}
              />
            ))}
          </div>
        </section>

        {/* Get Started Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => createConversation()}
            disabled={isPending}
          >
            Get Personalized Recommendations
          </Button>
        </div>
      </main>
    </div>
  );
}
