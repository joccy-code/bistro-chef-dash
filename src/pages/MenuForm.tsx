import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface FormData {
  name_en: string;
  name_am: string;
  name_or: string;
  description_en: string;
  description_am: string;
  description_or: string;
  price: string;
  category_id: string;
  image: string;
  is_available: boolean;
  is_special: boolean;
  discount: string;
}

interface MenuItem {
  id: number;
  name_en: string;
  name_am?: string;
  name_or?: string;
  description_en?: string;
  description_am?: string;
  description_or?: string;
  price: number;
  category_id: number;
  image?: string;
  is_available: boolean;
  is_special: boolean;
  discount: number;
}

export default function MenuForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    name_en: "",
    name_am: "",
    name_or: "",
    description_en: "",
    description_am: "",
    description_or: "",
    price: "",
    category_id: "1",
    image: "",
    is_available: true,
    is_special: false,
    discount: "0",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) loadMenuItem(parseInt(id));
  }, [id, isEdit]);

  const loadMenuItem = async (menuId: number) => {
    try {
      const response = await api.getMenuItem(menuId);
      if (response.success) {
        const item = response.menuItem;
        setFormData({
          name_en: item.name_en,
          name_am: item.name_am || "",
          name_or: item.name_or || "",
          description_en: item.description_en || "",
          description_am: item.description_am || "",
          description_or: item.description_or || "",
          price: item.price.toString(),
          category_id: item.category_id.toString(),
          image: item.image || "",
          is_available: item.is_available,
          is_special: item.is_special,
          discount: item.discount.toString(),
        });
        if (item.image) {
          setImagePreview(item.image);
        }
      }
    } catch (err) {
      toast.error("Failed to load menu item");
      navigate("/menu");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name_en || !formData.price) {
      toast.error("Please fill in all required fields");
      return false;
    }

    const price = parseFloat(formData.price);
    const discount = parseFloat(formData.discount);

    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return false;
    }

    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast.error("Discount must be between 0 and 100");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    let imageUrl = formData.image;
    
    // If user uploaded a new image, convert to base64
    if (imageFile) {
      const reader = new FileReader();
      imageUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
    }

    const payload = {
      name_en: formData.name_en,
      name_am: formData.name_am || formData.name_en,
      name_or: formData.name_or || formData.name_en,
      description_en: formData.description_en,
      description_am: formData.description_am || formData.description_en,
      description_or: formData.description_or || formData.description_en,
      price: parseFloat(formData.price),
      category_id: parseInt(formData.category_id),
      image: imageUrl,
      is_available: formData.is_available,
      is_special: formData.is_special,
      discount: parseFloat(formData.discount),
    };

    try {
      if (isEdit && id) {
        await api.updateMenuItem(parseInt(id), payload);
        toast.success("Menu item updated successfully");
      } else {
        await api.createMenuItem(payload);
        toast.success("Menu item created successfully");
      }
      navigate("/admin/menu");
    } catch (err) {
      toast.error(
        isEdit ? "Failed to update menu item" : "Failed to create menu item"
      );
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/menu")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Menu Item" : "Add Menu Item"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update the menu item details"
              : "Add a new item to your menu"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* English */}
        <Card>
          <CardHeader>
            <CardTitle>English</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name_en">Name (English) *</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => handleChange("name_en", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">Description (English)</Label>
              <Textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => handleChange("description_en", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Amharic */}
        <Card>
          <CardHeader>
            <CardTitle>Amharic (አማርኛ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name_am">Name (Amharic)</Label>
              <Input
                id="name_am"
                value={formData.name_am}
                onChange={(e) => handleChange("name_am", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_am">Description (Amharic)</Label>
              <Textarea
                id="description_am"
                value={formData.description_am}
                onChange={(e) => handleChange("description_am", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Oromo */}
        <Card>
          <CardHeader>
            <CardTitle>Oromo (Afaan Oromoo)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name_or">Name (Oromo)</Label>
              <Input
                id="name_or"
                value={formData.name_or}
                onChange={(e) => handleChange("name_or", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_or">Description (Oromo)</Label>
              <Textarea
                id="description_or"
                value={formData.description_or}
                onChange={(e) => handleChange("description_or", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => handleChange("discount", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Upload Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Max file size: 5MB. Supported formats: JPG, PNG, WEBP
              </p>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 rounded-md object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_available">Available</Label>
                <p className="text-sm text-muted-foreground">
                  Is this item currently available for order?
                </p>
              </div>
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) =>
                  handleChange("is_available", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_special">Special Item</Label>
                <p className="text-sm text-muted-foreground">
                  Mark this as a special or featured item
                </p>
              </div>
              <Switch
                id="is_special"
                checked={formData.is_special}
                onCheckedChange={(checked) =>
                  handleChange("is_special", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/menu")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
