import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { parseISO, format } from "date-fns";

import { Promotion } from "@/lib/api";

export default function Promotions() {
  const { language } = useOutletContext<{ language: string }>();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadPromotions();
  }, [language]);

  const loadPromotions = async () => {
    try {
      const response = await api.getPromotions(language);
      if (response.success) setPromotions(response.promotions);
    } catch {
      toast.error("Failed to load promotions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (menuId: number) => {
    try {
      await api.deletePromotion(menuId);
      toast.success("Promotion removed successfully");
      loadPromotions();
    } catch {
      toast.error("Failed to remove promotion");
    } finally {
      setDeleteId(null);
    }
  };

  const isActive = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.start_date);
    const end = new Date(promotion.end_date);
    return now >= start && now <= end;
  };

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), "MMM dd, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">
            Manage special offers and discounts
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/promotions/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Promotion
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No promotions found
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promotion) => (
                <TableRow key={promotion.food_id}>
                  <TableCell className="font-medium">
                    {promotion.menu_item?.name_en || promotion.food_name || `Item #${promotion.food_id}`}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-accent text-accent"
                    >
                      {promotion.discount}% OFF
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(promotion.start_date)}</TableCell>
                  <TableCell>{formatDate(promotion.end_date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={isActive(promotion) ? "default" : "secondary"}
                    >
                      {isActive(promotion) ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/promotions/${promotion.food_id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(promotion.food_id)}
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

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this promotion? The menu item will
              remain but the discount will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
