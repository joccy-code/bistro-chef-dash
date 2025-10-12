import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { UtensilsCrossed, Tag, AlertCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalItems: number;
  activePromotions: number;
  unavailableItems: number;
  specialItems: number;
}

export default function Dashboard() {
  const { language } = useOutletContext<{ language: string }>();
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    activePromotions: 0,
    unavailableItems: 0,
    specialItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [language]);

  const loadStats = async () => {
    try {
      const [menuResponse, promotionsResponse] = await Promise.all([
        api.getMenuItems(language),
        api.getPromotions(language),
      ]);

      if (menuResponse.success) {
        const menu = menuResponse.menu;
        setStats({
          totalItems: menu.length,
          activePromotions: promotionsResponse.success ? promotionsResponse.promotions.length : 0,
          unavailableItems: menu.filter(item => !item.is_available).length,
          specialItems: menu.filter(item => item.is_special).length,
        });
      }
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Menu Items',
      value: stats.totalItems,
      icon: UtensilsCrossed,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Promotions',
      value: stats.activePromotions,
      icon: Tag,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Special Items',
      value: stats.specialItems,
      icon: Star,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Unavailable Items',
      value: stats.unavailableItems,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your restaurant.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Use the sidebar to navigate to Menu or Promotions to manage your restaurant items.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
