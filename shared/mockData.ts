import type { Destination, Activity } from './schema';

export const mockDestinations: Destination[] = [
  {
    id: 1,
    name: "Santorini, Greece",
    region: "Europe",
    description: "Beautiful island with white-washed buildings and stunning sunsets",
    imageUrl: "https://images.unsplash.com/photo-1530789253388-582c481c54b0",
    activities: ["Sightseeing", "Beach", "Food"],
    budget: 200,
  },
  {
    id: 2,
    name: "Swiss Alps",
    description: "Majestic mountains perfect for outdoor adventures",
    region: "Europe",
    imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
    activities: ["Hiking", "Skiing", "Photography"],
    budget: 250,
  },
  // Add more destinations...
];

export const mockActivities: Activity[] = [
  {
    id: 1,
    name: "Mountain Hiking",
    category: "Adventure",
    description: "Explore scenic trails and reach breathtaking summits",
    imageUrl: "https://images.unsplash.com/photo-1465310477141-6fb93167a273",
  },
  {
    id: 2,
    name: "Cultural Tours",
    category: "Culture",
    description: "Immerse yourself in local history and traditions",
    imageUrl: "https://images.unsplash.com/photo-1480480565647-1c4385c7c0bf",
  },
  // Add more activities...
];
