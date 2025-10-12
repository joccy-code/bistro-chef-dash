import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { api, MenuItem, Promotion } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, Tag, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { language } = useOutletContext<{ language: string }>();
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [language]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [menuData, promoData] = await Promise.all([
        api.getPublicMenuItems(language),
        api.getPublicPromotions(language),
      ]);

      const activePromotions = promoData.promotions.filter(p => {
        const now = new Date();
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        return now >= start && now <= end;
      });

      const featured = menuData.menu
        .filter(item => item.is_special && item.is_available)
        .slice(0, 3);

      setFeaturedItems(featured);
      setPromotions(activePromotions);
    } catch (error) {
      toast.error('Failed to load content');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemName = (item: MenuItem) => {
    if (language === 'am') return item.name_am;
    if (language === 'or') return item.name_or;
    return item.name_en;
  };

  const getItemDescription = (item: MenuItem) => {
    if (language === 'am') return item.description_am;
    if (language === 'or') return item.description_or;
    return item.description_en;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to Our Restaurant
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Experience authentic Ethiopian cuisine crafted with love and tradition. 
            Every dish tells a story of flavor and culture.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/menu">View Menu</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Active Promotions */}
      {promotions.length > 0 && (
        <section className="border-t bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center gap-3">
              <Tag className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Special Offers</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {promotions.slice(0, 3).map((promo) => (
                <Card key={promo.food_id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <Badge className="mb-3 bg-primary">
                      {promo.discount}% OFF
                    </Badge>
                    <h3 className="mb-2 text-xl font-semibold">{promo.food_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Valid until {new Date(promo.end_date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center gap-3">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Featured Dishes</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={getItemName(item)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-xl font-semibold">{getItemName(item)}</h3>
                      {item.discount > 0 && (
                        <Badge variant="secondary">{item.discount}% OFF</Badge>
                      )}
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {getItemDescription(item)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${item.discount > 0 
                          ? (item.price * (1 - item.discount / 100)).toFixed(2)
                          : item.price.toFixed(2)}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/menu">View Full Menu</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Open Daily</h3>
              <p className="text-muted-foreground">
                Monday - Sunday<br />
                11:00 AM - 10:00 PM
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UtensilsCrossed className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Fresh Ingredients</h3>
              <p className="text-muted-foreground">
                We source the finest local ingredients for authentic flavors
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Tag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Special Offers</h3>
              <p className="text-muted-foreground">
                Check our menu for daily specials and seasonal promotions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
