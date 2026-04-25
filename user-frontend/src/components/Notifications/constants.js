import { Calendar, Utensils, AlertTriangle, Newspaper } from 'lucide-react';

export const CATEGORY_MAPPING = {
  event: {
    label: 'Event',
    icon: Calendar,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    glow: 'group-hover:shadow-blue-500/20',
    iconColor: 'text-blue-400'
  },
  food: {
    label: 'Food',
    icon: Utensils,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    glow: 'group-hover:shadow-orange-500/20',
    iconColor: 'text-orange-400'
  },
  alert: {
    label: 'Alert',
    icon: AlertTriangle,
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    glow: 'group-hover:shadow-red-500/20',
    iconColor: 'text-red-400'
  },
  news: {
    label: 'News',
    icon: Newspaper,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    glow: 'group-hover:shadow-purple-500/20',
    iconColor: 'text-purple-400'
  }
};

export const defaultUpdates = [
  {
    id: 'fallback-1',
    title: 'Food Festival at MGB Felicity Mall',
    description: 'Join us for a 3-day culinary journey featuring authentic Nellore cuisines and international delicacies. Live music and games for kids included.',
    category: 'food',
    timestamp: new Date().toISOString(), // Today
    isActive: true
  },
  {
    id: 'fallback-2',
    title: 'Beach Road Renovation Update',
    description: 'The Phase 1 of Mypadu Beach road renovation is 80% complete. Expect minor traffic diversions during the weekend.',
    category: 'news',
    timestamp: new Date().toISOString(), // Today
    isActive: true
  },
  {
    id: 'fallback-3',
    title: 'Temple Event at Ranganathaswamy Temple',
    description: 'Annual Brahmotsavam starts this Friday. Special darshan timings and security arrangements have been announced by the district administration.',
    category: 'event',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago (This Week)
    isActive: true
  },
  {
    id: 'fallback-4',
    title: 'Traffic Alert: Gandhi Statue Area',
    description: 'Major pipeline work scheduled near Gandhi Statue for the next 48 hours. Please use alternate routes to avoid congestion.',
    category: 'alert',
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago (This Week)
    isActive: true
  },
  {
    id: 'fallback-5',
    title: 'New Restaurant Openings: Stonehouse Pet',
    description: 'A new organic farm-to-table restaurant is opening its doors in Stonehouse Pet. Enjoy a 20% inaugural discount all week.',
    category: 'food',
    timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago (Earlier)
    isActive: true
  },
  {
    id: 'fallback-6',
    title: 'Weekend Events: City Park Marathon',
    description: 'The 5th annual City Park Marathon is happening this Sunday. Registrations are still open for the 5K and 10K categories.',
    category: 'event',
    timestamp: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago (Earlier)
    isActive: true
  },
  {
    id: 'fallback-7',
    title: 'New Metro Bus Route Announced',
    description: 'A new express bus route connecting Nellore Central to the industrial area has been launched today for easier commute.',
    category: 'news',
    timestamp: new Date().toISOString(), // Today
    isActive: true
  },
  {
    id: 'fallback-8',
    title: 'Water Supply Maintenance',
    description: 'Scheduled maintenance in the Magunta Layout area might lead to low water pressure this Wednesday evening.',
    category: 'alert',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // This Week
    isActive: true
  },
  {
    id: 'fallback-9',
    title: 'Musical Night at Town Hall',
    description: 'A local classical music performance is scheduled for next month. Bookings are now open.',
    category: 'event',
    timestamp: new Date(Date.now() - 86400000 * 15).toISOString(), // Earlier
    isActive: true
  }
];
