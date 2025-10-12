import { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { api, MenuItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function PromotionForm() {
  const { menu_id } = useParams();
  const navigate = useNavigate();
  const { language } = useOutletContext<{ language: string }>();
  const isEdit = !!menu_id;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [formData, setFormData] = useState({
    menu_id: menu_id || '',
    discount: '10',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadData();
  }, [language, menu_id]);

  const loadData = async () => {
    try {
      const menuResponse = await api.getMenuItems(language);
      if (menuResponse.success) {
        setMenuItems(menuResponse.menu);
      }

      if (isEdit && menu_id) {
        const promotionsResponse = await api.getPromotions(language);
        if (promotionsResponse.success) {
          const promotion = promotionsResponse.promotions.find(
            p => p.food_id === parseInt(menu_id)
          );
          if (promotion) {
            setFormData({
              menu_id: menu_id,
              discount: promotion.discount.toString(),
              start_date: format(new Date(promotion.start_date), 'yyyy-MM-dd'),
              end_date: format(new Date(promotion.end_date), 'yyyy-MM-dd'),
            });
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.menu_id) {
      toast.error('Please select a menu item');
      return;
    }

    const discount = parseFloat(formData.discount);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      toast.error('Discount must be between 1 and 100');
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        discount,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      if (isEdit && menu_id) {
        await api.updatePromotion(parseInt(menu_id), data);
        toast.success('Promotion updated successfully');
      } else {
        await api.createPromotion({
          menu_id: parseInt(formData.menu_id),
          ...data,
        });
        toast.success('Promotion created successfully');
      }
      navigate('/promotions');
    } catch (error) {
      toast.error(isEdit ? 'Failed to update promotion' : 'Failed to create promotion');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/promotions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit Promotion' : 'Add Promotion'}</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update the promotion details' : 'Create a new promotion for a menu item'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Promotion Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menu_id">Menu Item *</Label>
              <Select
                value={formData.menu_id}
                onValueChange={(value) => setFormData({ ...formData, menu_id: value })}
                disabled={isEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a menu item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%) *</Label>
              <Input
                id="discount"
                type="number"
                min="1"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Promotion' : 'Create Promotion'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/promotions')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
