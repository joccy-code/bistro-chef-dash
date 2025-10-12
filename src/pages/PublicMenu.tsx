import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, MenuItem } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UtensilsCrossed, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PublicMenu() {
  const { language } = useOutletContext<{ language: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, [language]);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, menuItems]);

  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPublicMenuItems(language);
      const available = data.menu.filter(item => item.is_available);
      setMenuItems(available);
      setFilteredItems(available);
    } catch (error) {
      toast.error('Failed to load menu');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        getItemName(item).toLowerCase().includes(query) ||
        getItemDescription(item).toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category_name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredItems(filtered);
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

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category_name).filter(Boolean)))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Our Menu</h1>
        <p className="text-lg text-muted-foreground">
          Discover our delicious selection of authentic dishes
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.slice(1).map((category) => (
              <SelectItem key={category} value={category || ''}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <UtensilsCrossed className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">No items found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={getItemName(item)}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-xl font-semibold">{getItemName(item)}</h3>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {item.is_special && (
                      <Badge variant="secondary">Special</Badge>
                    )}
                    {item.discount > 0 && (
                      <Badge className="bg-primary">{item.discount}% OFF</Badge>
                    )}
                  </div>
                </div>
                
                {item.category_name && (
                  <p className="mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                    {item.category_name}
                  </p>
                )}
                
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {getItemDescription(item)}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
