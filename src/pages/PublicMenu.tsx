import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, MenuItem, getImageUrl } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Search } from "lucide-react";
import { toast } from "sonner";

export default function PublicMenu() {
  const { language } = useOutletContext<{ language: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // 🧭 Load menu items whenever language changes
  useEffect(() => {
    loadMenu();
  }, [language]);

  // 🧭 Re-apply filters whenever items, search, or category changes
  useEffect(() => {
    filterItems();
  }, [menuItems, searchQuery, selectedCategory]);

  const loadMenu = async () => {
    setIsLoading(true);

    // 📦 1. Load cached menu first (if exists)
    const cached = localStorage.getItem(`menu_cache_${language}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as MenuItem[];
        setMenuItems(parsed);
        setFilteredItems(parsed);
        setIsLoading(false);
      } catch (err) {
        console.error("Cache parse error", err);
      }
    }

    // 🌐 2. Then try fetching fresh menu from server
    try {
      const data = await api.getPublicMenuItems(language);
      console.log("🔍 API Response:", data);
      console.log("🖼️ First item image data:", data.menu[0]?.image ? {
        exists: true,
        startsWithData: data.menu[0].image.startsWith("data:"),
        length: data.menu[0].image.length,
        preview: data.menu[0].image.substring(0, 100) + "..."
      } : "No image");
      const available = data.menu.filter((item: MenuItem) => item.is_available);
      setMenuItems(available);
      setFilteredItems(available);
      localStorage.setItem(`menu_cache_${language}`, JSON.stringify(available));
    } catch (error) {
      toast.error("Failed to fetch menu — showing saved data if available");
      console.error("Menu fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...menuItems];

    // 🔍 Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          getItemName(item).toLowerCase().includes(query) ||
          getItemDescription(item).toLowerCase().includes(query)
      );
    }

    // 🏷️ Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) =>
          (item.category || item.category_name)?.toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    setFilteredItems(filtered);
  };

  const getItemName = (item: MenuItem) => item.name || "Unnamed";
  const getItemDescription = (item: MenuItem) => item.description || "";

  const formatPrice = (price: number | string | undefined) => {
    const num = Number(price);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // 🧭 Gather unique categories
  const categories = [
    "all",
    ...Array.from(
      new Set(
        menuItems
          .map((item) => item.category || item.category_name)
          .filter(Boolean)
      )
    ),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Our Menu</h1>
        <p className="text-lg text-muted-foreground">
          Discover our delicious selection of authentic dishes
        </p>
      </div>

      {/* 🔍 Search + 🏷️ Category Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative max-w-md w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === "all" ? "All Categories" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* 🖼️ Menu Grid */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <UtensilsCrossed className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
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

                {(item.category || item.category_name) && (
                  <p className="mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                    {item.category || item.category_name}
                  </p>
                )}

                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {getItemDescription(item)}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      $
                      {item.discount > 0
                        ? formatPrice(
                            Number(item.price) *
                              (1 - (item.discount || 0) / 100)
                          )
                        : formatPrice(item.price)}
                    </span>
                    {item.discount > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${formatPrice(item.price)}
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
