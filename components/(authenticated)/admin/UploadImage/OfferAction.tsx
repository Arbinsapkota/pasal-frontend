"use client";
import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

// Define types
interface SubcategoryDetails {
  subcategoryId: string;
  name: string;
  createdAt: string | null;
  updatedAt: string;
}

interface CategoryDetails {
  categoryId: string;
  name: string;
  createdAt: string | null;
  updatedAt: string;
}

interface ProductDetails {
  productId: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  stock: number;
  category: CategoryDetails;
  subcategory: SubcategoryDetails;
  createdAt: string | null;
  updatedAt: string;
  imageUrls: string[];
}

interface OfferDetails {
  offerId: string;
  title: string;
  description: string;
  discountType: "fixed" | "negotiable" | null;
  discountValue: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  products: ProductDetails[] | null;
  imageUrls: string[];
}

interface OfferFormat {
  imageUrls: string[];
  offer: OfferDetails;
  products: ProductDetails[];
}

interface Category {
  categoryId: string;
  name: string;
}
const offerSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    discountValue: z
      .string()
      .min(1, "Discount is required")
      .regex(/^\d+$/, "Discount must be a number"),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date({ required_error: "End date is required" }),
  })
  .refine(data => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type OfferFormValues = z.infer<typeof offerSchema>;

interface OfferActionProps {
  offerData?: OfferFormat;
  offerId?: string;
  setIsOfferAdded: React.Dispatch<React.SetStateAction<boolean>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const OfferAction: React.FC<OfferActionProps> = ({
  offerData,
  offerId,
  setIsOfferAdded,
  setDialogOpen,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductError, setSelectedProductError] = useState(false);
  const [selectedCategoryError, setSelectedCategoryError] = useState(false);
  const [getCategories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectOfferType, setSelectOfferType] = useState<string>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ProductDetails[]>(
    offerData?.products || []
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      title: "",
      description: "",
      discountValue: "",
    },
  });

  // Pre-fill form for editing
  useEffect(() => {
    if (offerData?.offer && offerData?.products) {
      setValue("title", offerData.offer.title);
      setValue("description", offerData.offer.description);
      setValue("discountValue", String(offerData.offer.discountValue));
      try {
        setValue("startDate", parseISO(offerData.offer.startDate));
        setValue("endDate", parseISO(offerData.offer.endDate));
      } catch (error) {
        console.error("Invalid date format:", error);
        toast.error("Invalid date format in offer data");
      }
      setSelectedProducts(offerData.products);
      // setExistingImageUrls(offerData.offer.imageUrls || []);
    }
  }, [offerData, setValue]);

  // Fetch products for search
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosAuthInstance().get(`/api/product/search`, {
        params: { productName: searchQuery },
      });
      // Filter out products with invalid imageUrls
      const validProducts = response.data.filter(
        (product: ProductDetails) =>
          Array.isArray(product.imageUrls) && product.imageUrls.length > 0
      );
      setProducts(validProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      // toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery]);

  useEffect(() => {
    axiosAuthInstance()
      .get(`/api/category/`)
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  // Clear product selection error when products are selected
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setSelectedProductError(false);
    }
    if (!selectedCategory) {
      setSelectedCategoryError(false);
    }
  }, [selectedProducts, selectedCategory]);

  // Format date for API
  const formatDate = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  // Handle product selection
  const toggleProductSelection = (product: ProductDetails) => {
    setSelectedProducts(prev => {
      if (prev.some(p => p.productId === product.productId)) {
        return prev.filter(p => p.productId !== product.productId);
      } else {
        return [...prev, product];
      }
    });
  };

  // Remove selected product
  const removeSelectedProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  // Clear form
  const clearForm = () => {
    reset({
      title: "",
      description: "",
      discountValue: "",
      startDate: new Date(),
      endDate: new Date(),
    });
    setSelectedProducts([]);
    setSelectedProductError(false);
    setSelectedCategoryError(false);
  };

  // Handle form submission (add or edit)
  const onSubmit = async (data: OfferFormValues) => {
    if (selectOfferType === "products") {
      if (selectedProducts.length === 0) {
        setSelectedProductError(true);
        return;
      }
    } else if (selectOfferType === "categories") {
      if (!selectedCategory) {
        setSelectedCategoryError(true);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title,
        description: data.description,
        productIds: selectedProducts.map(p => p.productId),
        categoryId: selectedCategory?.categoryId || null,
        discountValue: Number(data.discountValue),
        startDate: formatDate(data.startDate),
        endDate: formatDate(data.endDate),
        // imageUrls: allImageUrls,
      };
      const payloadEdit = {
        offerId: offerId || offerData?.offer.offerId,
        title: data.title,
        description: data.description,
        productIds: selectedProducts.map(p => p.productId),
        discountValue: Number(data.discountValue),
        startDate: formatDate(data.startDate),
        endDate: formatDate(data.endDate),
        // imageUrls: allImageUrls,
      };

      if (offerId || offerData?.offer.offerId) {
        // Edit existing offer
        await axiosAuthInstance().post(`/api/offers/`, payloadEdit);
        toast.dismiss();
        toast.success("Offer updated successfully!");
        setDialogOpen(false);
      } else {
        // Add new offer
        await axiosAuthInstance().post("/api/offers/", payload);
        toast.dismiss();
        toast.success("Offer added successfully!");
        setDialogOpen(false);
      }

      setIsOfferAdded(prev => !prev);
      setIsProductModalOpen(false);
      clearForm();
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast.dismiss();
      toast.error(`Failed to ${offerId || offerData ? "update" : "add"} offer`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl scrollbar-hide">
      <div className="flex justify-between items-center pr-4">
        <p className="text-xl font-semibold pb-2">
          {offerId || offerData ? "Edit Offer" : "Add Offer"}
        </p>

        <Button variant="outline" onClick={clearForm} aria-label="Clear form">
          Clear Form
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="description" className="font-medium">
            Chose Offer Type
          </Label>
          <Select
            value={selectOfferType}
            onValueChange={e => {
              setSelectOfferType(e);
              setSelectedProducts([]);
              setSelectedCategory(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Offers Type" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-scroll">
              <SelectItem value="products"> Products</SelectItem>
              <SelectItem value="categories"> Categories</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectOfferType === "products" && (
          <div className="flex flex-wrap gap-4">
            {selectedProducts.length > 0 ? (
              selectedProducts.map(product => (
                <div key={product.productId} className="relative group">
                  <Image
                    src={
                      Array.isArray(product.imageUrls) &&
                      product.imageUrls.length > 0
                        ? product.imageUrls[0]
                        : "/product.png"
                    }
                    height={160}
                    width={160}
                    alt={`Image of ${product.name || "product"}`}
                    className="h-40 w-40 rounded-md object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-6 w-6"
                    onClick={() => removeSelectedProduct(product.productId)}
                    aria-label={`Remove product: ${product.name}`}
                  >
                    X
                  </Button>
                </div>
              ))
            ) : (
              <div className="h-40 w-40 bg-muted rounded-md flex items-center justify-center p-4 text-center text-sm">
                No Products Selected
              </div>
            )}
            <Dialog
              open={isProductModalOpen}
              onOpenChange={setIsProductModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  disabled={isSubmitting}
                  className="my-auto"
                  onClick={() => setSearchQuery("")}
                  aria-label="Select products"
                >
                  Select Products
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <VisuallyHidden>
                  <DialogTitle>Select Products</DialogTitle>
                </VisuallyHidden>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full"
                    aria-label="Search products"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-72 overflow-y-auto border rounded-md p-4 scrollbar-thin">
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, index) => (
                        <LoadingContent key={index} className="h-36 w-full" />
                      ))
                    ) : products.length === 0 ? (
                      <p className="col-span-full text-center text-muted-foreground">
                        No products found
                      </p>
                    ) : (
                      products.map(product => (
                        <Card
                          key={product.productId}
                          className={cn(
                            "p-4 cursor-pointer hover:shadow-md transition-shadow",
                            selectedProducts.some(
                              p => p.productId === product.productId
                            ) && "bg-primary/80 text-white"
                          )}
                          onClick={() => toggleProductSelection(product)}
                          role="button"
                          aria-label={`Select product: ${product.name}`}
                        >
                          <Image
                            src={
                              Array.isArray(product.imageUrls) &&
                              product.imageUrls.length > 0
                                ? product.imageUrls[0]
                                : "/product.png"
                            }
                            alt={`Image of ${product.name || "product"}`}
                            className="h-20 w-20 rounded mx-auto object-contain"
                            height={80}
                            width={80}
                          />
                          <h2 className="text-sm mt-2 text-center">
                            {product.name}
                          </h2>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => setIsProductModalOpen(false)}
                    aria-label="Confirm product selection"
                  >
                    Confirm Selection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
        {selectedProductError && selectOfferType === "products" && (
          <p className="text-red-500 text-sm">
            Please select at least one product
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {selectOfferType === "categories" && (
            <div>
              <Label htmlFor="title" className="font-medium">
                Select Category
              </Label>
              <Select
                onValueChange={value =>
                  setSelectedCategory({ categoryId: value, name: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-scroll">
                  {getCategories.map(category => {
                    return (
                      <SelectItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedCategoryError && selectOfferType === "categories" && (
                <p className="text-red-500 text-sm">Please select a category</p>
              )}
            </div>
          )}
          <div>
            <Label htmlFor="title" className="font-medium">
              Offer Title
            </Label>
            <Input disabled={isSubmitting} id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="font-medium">
              Description
            </Label>
            <Input
              disabled={isSubmitting}
              id="description"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="discountValue" className="font-medium">
              Discount
            </Label>
            <Input
              disabled={isSubmitting}
              id="discountValue"
              {...register("discountValue")}
            />
            {errors.discountValue && (
              <p className="text-red-500 text-sm">
                {errors.discountValue.message}
              </p>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Start Date</Label>
              <Calendar
                disabled={isSubmitting}
                mode="single"
                selected={getValues("startDate")}
                onSelect={date => {
                  if (date) {
                    setValue("startDate", date);
                    trigger("startDate");
                  }
                }}
                initialFocus
                aria-label="Select start date"
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div>
              <Label className="font-medium">End Date</Label>
              <Calendar
                disabled={isSubmitting}
                mode="single"
                selected={getValues("endDate")}
                onSelect={date => {
                  if (date) {
                    setValue("endDate", date);
                    trigger("endDate");
                  }
                }}
                initialFocus
                aria-label="Select end date"
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm">{errors.endDate.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : offerId || offerData
                ? "Update"
                : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </div>
  );
};

export default OfferAction;
