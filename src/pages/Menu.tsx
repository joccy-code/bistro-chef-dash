import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { api, MenuItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Menu() {
  const { language } = useOutletContext<{ language: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailable, setFilterAvailable] = useState<string>("all");
  const [filterSpecial, setFilterSpecial] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadMenuItems();
  }, [language]);

  useEffect(() => {
    filterMenuItems();
  }, [menuItems, searchQuery, filterAvailable, filterSpecial]);

  const loadMenuItems = async () => {
    setIsLoading(true);
    try {
      const response = await api.getMenuItems(language);
      if (response.success) setMenuItems(response.menu);
    } catch (error) {
      toast.error("Failed to load menu items");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMenuItems = () => {
    let filtered = [...menuItems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name_en.toLowerCase().includes(query) ||
          item.name_am?.toLowerCase().includes(query) ||
          item.name_or?.toLowerCase().includes(query)
      );
    }

    if (filterAvailable !== "all") {
      filtered = filtered.filter((item) =>
        filterAvailable === "available" ? item.is_available : !item.is_available
      );
    }

    if (filterSpecial !== "all") {
      filtered = filtered.filter((item) =>
        filterSpecial === "special" ? item.is_special : !item.is_special
      );
    }

    setFilteredItems(filtered);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteMenuItem(id);
      toast.success("Menu item deleted successfully");
      loadMenuItems();
    } catch (error) {
      toast.error("Failed to delete menu item");
      console.error(error);
    } finally {
      setDeleteId(null);
    }
  };

  const getName = (item: MenuItem) => {
    if (language === "am") return item.name_am || item.name_en;
    if (language === "or") return item.name_or || item.name_en;
    return item.name_en;
  };

  const formatPrice = (price: string | number | undefined) => {
    const num = Number(price);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <p className="text-muted-foreground">Manage your restaurant menu</p>
        </div>
        <Button asChild>
          <Link to="/admin/menu/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterAvailable} onValueChange={setFilterAvailable}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSpecial} onValueChange={setFilterSpecial}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Special" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="special">Special Only</SelectItem>
            <SelectItem value="regular">Regular Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No menu items found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{getName(item)}</TableCell>
                  <TableCell>${formatPrice(item.price)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge
                        variant={item.is_available ? "default" : "secondary"}
                      >
                        {item.is_available ? "Available" : "Unavailable"}
                      </Badge>
                      {item.is_special && (
                        <Badge
                          variant="outline"
                          className="border-warning text-warning"
                        >
                          Special
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.discount > 0 ? `${item.discount}%` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/menu/${item.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this menu item? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
