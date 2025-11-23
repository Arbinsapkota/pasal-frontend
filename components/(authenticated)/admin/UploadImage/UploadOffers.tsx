"use client";
import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { axiosAuthInstance } from "@/components/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import { format } from "date-fns";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OfferAction from "./OfferAction";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  imageUrl: string;
  offer: OfferDetails;
  products: ProductDetails;
}

const UploadOffers: React.FC = () => {
  const [offers, setOffers] = useState<OfferFormat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfferAdded, setIsOfferAdded] = useState<boolean>(false);
  const [viewOffer, setViewOffer] = useState<OfferFormat | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://your-api-endpoint.com";

  // Fetch offers from API
  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosAuthInstance().get(
        `${API_BASE_URL}/api/offers/`
      );
      setOffers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch offers. Please try again.");
      console.error("Error fetching offers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an offer
  const handleDelete = async (offerId: string) => {
    try {
      await axiosAuthInstance().delete(
        `${API_BASE_URL}/api/offers/?offerId=${offerId}`
      );
      setOffers(offers.filter(offer => offer.offer.offerId !== offerId));
      toast.dismiss();
      toast.success("Offer deleted successfully!");
    } catch (err) {
      console.error("Error deleting offer:", err);
      toast.dismiss();
      toast.error("Failed to delete offer");
    }
  };

  const handleActive = (offerId: string) => {
    axiosAuthInstance()
      .post(`/api/offers/deactivate?offerId=${offerId}`)
      .then(() => {
        setOffers(
          offers.map(offer => {
            if (offer.offer.offerId === offerId) {
              return {
                ...offer,
                offer: {
                  ...offer.offer,
                  isActive: true,
                },
              };
            }
            return offer;
          })
        );
        toast.dismiss();
        toast.success("Offer activated successfully!");
      })
      .catch(err => {
        console.error("Error activating offer:", err);
        toast.dismiss();
        toast.error("Failed to activate offer");
      });
  };

  const handleDeactivate = (offerId: string) => {
    axiosAuthInstance()
      .post(`/api/offers/deactivate?offerId=${offerId}`)
      .then(() => {
        setOffers(
          offers.map(offer => {
            if (offer.offer.offerId === offerId) {
              return {
                ...offer,
                offer: {
                  ...offer.offer,
                  isActive: false,
                },
              };
            }
            return offer;
          })
        );
        toast.dismiss();
        toast.success("Offer deactivated successfully!");
      })
      .catch(err => {
        console.error("Error deactivating offer:", err);
        toast.dismiss();
        toast.error("Failed to deactivate offer");
      });
  };

  useEffect(() => {
    fetchOffers();
  }, [isOfferAdded]);

  return (
    <div className="w-full my-4 mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Offers</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button aria-label="Create new offer">Create New Offer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-scroll scrollbar-thin">
            <VisuallyHidden>
              <DialogTitle> New Offer</DialogTitle>
            </VisuallyHidden>
            <OfferAction
              setDialogOpen={setDialogOpen}
              setIsOfferAdded={setIsOfferAdded}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* {error && <p className="text-red-500 mb-4">{error}</p>} */}

      {isLoading || offers.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount Value</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={7}>
                        <LoadingContent className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : offers.map(offer => (
                    <TableRow key={offer.offer.offerId}>
                      <TableCell>{offer.offer.title}</TableCell>
                      <TableCell className="max-w-md text-wrap">
                        {offer.offer.description}
                      </TableCell>
                      <TableCell>
                        {offer.offer.discountValue || "N/A"}
                      </TableCell>
                      <TableCell className=" w-[100px]">
                        {format(new Date(offer.offer.startDate), "PPP")}
                      </TableCell>
                      <TableCell className="  w-[100px]">
                        {format(new Date(offer.offer.endDate), "PPP")}
                      </TableCell>
                      <TableCell>{offer.products?.name || "N/A"} </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewOffer(offer)}
                                aria-label={`View offer: ${offer.offer.title}`}
                              >
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{offer.offer.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>
                                  <span className="font-semibold">
                                    Description:
                                  </span>{" "}
                                  {offer.offer.description}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    Discount Value:
                                  </span>{" "}
                                  {offer.offer.discountValue || "N/A"}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    Start Date:
                                  </span>{" "}
                                  {format(
                                    new Date(offer.offer.startDate),
                                    "PPP"
                                  )}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    End Date:
                                  </span>{" "}
                                  {format(new Date(offer.offer.endDate), "PPP")}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    Product:
                                  </span>{" "}
                                  {offer.products?.name || "N/A"}
                                </p>

                                <Image
                                  width={400}
                                  height={400}
                                  src={offer.imageUrl || "/product.png"}
                                  alt={`Image of ${
                                    offer.products.name || "product"
                                  }`}
                                  className="h-52 w-52 rounded-md object-cover"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Select
                            defaultValue={
                              offer.offer.isActive ? "active" : "inactive"
                            }
                            onValueChange={value => {
                              if (value === "active") {
                                handleActive(offer.offer.offerId);
                              } else {
                                handleDeactivate(offer.offer.offerId);
                              }
                            }}
                          >
                            <SelectTrigger
                              className={`${
                                offer.offer.isActive === true
                                  ? "bg-green-500 "
                                  : "bg-red-500 "
                              }w-[180px] text-white`}
                            >
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent className="w-[180px]">
                              <SelectItem value="active">Activate</SelectItem>
                              <SelectItem value="inactive">
                                Deactivate
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {/* <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Edit offer: ${offer.offer.title}`}
                              >
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <OfferAction
                                offerData={offer}
                                offerId={offer.offer.offerId}
                                setIsOfferAdded={setIsOfferAdded}
                              />
                            </DialogContent>
                          </Dialog> */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(offer.offer.offerId)}
                            aria-label={`Delete offer: ${offer.offer.title}`}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <p className="text-center text-muted-foreground">
          No offers available. Click &quot;Create New Offer&quot; to add one.
        </p>
      )}
    </div>
  );
};

export default UploadOffers;
