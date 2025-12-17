"use client";
import { axiosInstance } from "@/components/axiosInstance";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import ExcelUpload from "@/components/excel/ExcelUpload";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import axios from "axios";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineStock } from "react-icons/ai";
import { IoAdd } from "react-icons/io5";
import { toast } from "react-toastify";
import { useProductContext } from "../context/ProductContext";
import ProductList from "./ProductList";

const TextEditor = dynamic(
  () => import("@/components/(non-authenticated)/textEditor/TextEditor"),
  {
    ssr: false,
  }
);

interface SupperCategory {
  superCategoryId: string;
  name: string;
  createdAt: string; // ISO string for date
  updatedAt: string | null; // Nullable in case it's not updated
}
interface Category {
  superCategory: SupperCategory;
  categoryId: string;
  name: string;
  createdAt: string; // ISO string for date
  updatedAt: string | null; // Nullable in case it's not updated
}

interface Subcategory {
  subcategoryId: string;
  category: Category;
  name: string;
  createdAt: string; // ISO string for date
  updatedAt: string | null; // Nullable in case it's not updated
}

interface ProductData {
  name: string;
  flavor?: string;
  description: string;
  price: string;
  discountedPrice: string;
  discountPercentage: string;
  superCategoryId: string;
  categoryId: string;
  subcategoryId: string;
  images: File[];
  labelImg?: File | undefined;
  stock: string;
}

const ProductUpload: React.FC = () => {
  const { fetchAndSetProducts } = useProductContext();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDialogOpenExcel, setIsDialogOpenExcel] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // const inputLabelRef = useRef<HTMLInputElement>(null);
  // const [products, setProducts] = useState<Product[]>([]);

  const handleClick = () => {
    inputRef?.current?.click();
  };

  // const handleLabelClick = () => {
  //   inputLabelRef?.current?.click();
  // };

  const [productData, setProductData] = useState<ProductData>({
    name: "",
    description: "",
    price: "",
    discountedPrice: "0",
    superCategoryId: "",
    categoryId: "",
    subcategoryId: "",
    images: [],
    stock: "",
    discountPercentage: "0",
  });

  const token = getTokenFromCookies();
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState<boolean>(true);
  // const [labelImage, setLabelImage] = useState<>();


  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Subcategory[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<Subcategory[]>([]);


  const [open, setOpen] = useState<boolean>(false);
  const [subCategoryDropdownOpen, setSubCategoryDropdownOpen] =
    useState<boolean>(false);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
   await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
        ).then((response) => {
          setCategories(response.data as Category[]);
        }).catch((error) => {
          console.error("Error fetching categories:", error);
        });
    };



  const fetchSubCategories = async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/by-category?category=${id}`
      );
      setAllSubCategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  }

  const handleCategoryChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const categoryId = e.target.value;

    setProductData({ ...productData, categoryId, subcategoryId: "" });
    fetchSubCategories(categoryId);
  };

  const handleSubCategorySelect = (subcategoryId: string) => {
    setProductData({ ...productData, subcategoryId });
    setSubCategoryDropdownOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);

      if (productData.images.length + newImages.length > 4) {
        toast.error("You can upload a maximum of 4 images");
        return;
      }

      setProductData({
        ...productData,
        images: [...productData.images, ...newImages],
      });
    }
  };


  const removeImage = (index: number) => {
    const updatedImages = [...productData.images];
    updatedImages.splice(index, 1);
    setProductData({ ...productData, images: updatedImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (
    //   parseFloat(productData.discountedPrice) >= parseFloat(productData.price)
    // ) {
    //   toast.error("Discounted price must be less than the original price.");
    //   return;
    // }

    const formData = new FormData();

    Object.keys(productData).forEach(key => {
      const value = productData[key as keyof ProductData];

      if (key === "images") {
        if (Array.isArray(value)) {
          value.forEach(image => {
            formData.append("images", image);
          });
        }
      } else {
        formData.append(key, value as string);
      }
    });

    formData.append("description", description);

    if (
      !productData.categoryId ||
      !productData.subcategoryId ||
      productData.images.length == 0 ||
      !description
    ) {
      toast.error("Fields not complete");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (response.status === 201) {
        fetchAndSetProducts();
        toast.success("Product added successfully");
      }
      setIsAdded(prev => !prev);
      setIsDialogOpen(false);
      handleClose();
    } catch (error) {
      toast.error("Error uploading product");
      console.error("Error uploading product:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClose = () => {
    setOpen(false);
    setProductData({
      name: "",
      description: "",
      price: "",
      discountedPrice: "0",
      superCategoryId: "",
      categoryId: "",
      subcategoryId: "",
      images: [],
      stock: "",
      discountPercentage: "",
    });
    setDescription("");
    setSubCategories([]);
  };

  return (
    <div>
      <div className="flex justify-between h-full">
        <p className="font-semibold text-2xl">Product List</p>

        <div className="flex flex-wrap sm:gap-4 gap-2">
          {/* upload product through the Excel */}
          <Dialog open={isDialogOpenExcel} onOpenChange={setIsDialogOpenExcel}>
            <DialogTrigger className={cn(buttonVariants())}>
              <i className="fa-solid fa-upload"></i>
              <span>Upload Excel</span>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-full sm:max-w-[60%] scrollbar-thin  text-black">
              <DialogHeader className="flex flex-row items-center gap-4 ">
                <DialogTitle>Upload Products via Excel</DialogTitle>
                <a
                  target="_blank"
                  className="underline text-blue-700 pb-2"
                  href="/ETech _Product.xlsx"
                >
                  View Template
                </a>
              </DialogHeader>
              <ExcelUpload
                setIsAdded={setIsAdded}
                setIsDialogOpenExcel={setIsDialogOpenExcel}
              />
            </DialogContent>
          </Dialog>
          {/* product upload through the form */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className={cn(buttonVariants())}>
              <i className="fa-solid fa-upload"></i>
              <span>Upload Product</span>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[90%] sm:max-w-[60%] scrollbar-thin  text-black">
              <DialogHeader>
                <DialogTitle>Upload New Product</DialogTitle>
              </DialogHeader>
              <div className=" ">
                {/* <h2 className="text-xl font-semibold mb-4">Upload New Product</h2> */}
                <form onSubmit={handleSubmit}>
                  <div className="my-3">
                    <label
                      className="block text-sm font-medium "
                      htmlFor="name"
                    >
                      <i className="fa-solid fa-tag"></i> Product Title
                    </label>
                    <input
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 mt-1"
                      type="text"
                      name="name"
                      value={productData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="my-3">
                    <label
                      className="block text-sm font-medium "
                      htmlFor="description"
                    >
                      <i className="fa-solid fa-align-left"></i> Description
                    </label>
                    <TextEditor value={description} onChange={setDescription} />
                  </div>
                  <div className="my-3">
                    <label
                      className="block text-sm font-medium "
                      htmlFor="price"
                    >
                      <span className="font-semibold"> Rs.</span> Price
                    </label>
                    <input
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 mt-1"
                      type="number"
                      name="price"
                      value={productData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* <div className="my-3">
                    <label
                      className="block text-sm font-medium "
                      htmlFor="discountedPrice"
                    >
                      <span className="font-semibold">Rs.</span>
                      Discount Price
                    </label>
                    <input
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 mt-1"
                      type="number"
                      name="discountedPrice"
                      value={productData.discountedPrice}
                      onChange={handleChange}
                    />
                  </div> */}

                  <div className="my-3">
                    <label
                      className="block text-sm font-medium "
                      htmlFor="discountPercentage"
                    >
                      <span className="font-semibold"> % </span>
                      Discount Percentage(optional)
                    </label>
                    <input
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 mt-1"
                      type="number"
                      name="discountPercentage"
                      value={productData?.discountPercentage}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="my-3">
                    <label
                      className="flex gap-1 text-sm font-medium items-center "
                      htmlFor="stock"
                    >
                      <AiOutlineStock className="font-extrabold" /> Stock
                    </label>
                    <input
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 mt-1"
                      type="number"
                      name="stock"
                      value={productData.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* <div className="my-3">
                    <label
                      className="block text-sm font-medium"
                      htmlFor="superCategoryId"
                    >
                      <i className="fa-solid fa-list-alt"></i> Super Category
                    </label>
                    <select
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 mt-1"
                      name="superCategoryId"
                      value={productData.superCategoryId}
                      onChange={(e)=>{
                        const superCategoryId = e.target.value;
                        setProductData({
                          ...productData,
                          superCategoryId,})}}
                      required
                    >
                      <option value="" disabled>
                        Select Super Category
                      </option>
                      {superCategories.map(superCat => (
                        <option
                          key={superCat.superCategoryId}
                          value={superCat.superCategoryId}
                        >
                          {superCat.name}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  <div className="my-3">
                    <label
                      className="block text-sm font-medium "
                      htmlFor="categoryId"
                    >
                      <i className="fa-solid fa-list-alt"></i> Category
                    </label>
                    <select
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 mt-1"
                      name="categoryId"
                      value={productData.categoryId}
                      onChange={(e)=>{handleCategoryChange(e);
                        fetchSubCategories(e.target.value);
                      }}
                      required
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                    
                      {categories
                                                ?.map(category => (
                          <option
                            key={category.categoryId}
                            value={category.categoryId}
                          >
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* {subCategories.length > 0 && ( */}
                  <div className="my-3">
                    <label
                      className="block text-sm font-medium "
                      htmlFor="subcategoryId"
                    >
                      <i className="fa-solid fa-list-alt"></i> Subcategory
                    </label>
                    <select
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 mt-1"
                      name="subcategoryId"
                      value={productData.subcategoryId}
                      onChange={e => handleSubCategorySelect(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select Subcategory
                      </option>
                      {allSubCategories.map(subcategory => (
                        <option
                          key={subcategory.subcategoryId}
                          value={subcategory.subcategoryId}
                        >
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* )} */}

                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium "
                      htmlFor="images"
                    >
                      <i className="fa-solid fa-image"></i> Product Images
                    </label>

                    <Button
                      type="button"
                      variant={"outline"}
                      onClick={handleClick}
                      className="mt-2"
                    >
                      <IoAdd />

                      <p>Add Image</p>
                    </Button>

                    <input
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      type="file"
                      hidden
                      ref={inputRef}
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      required
                    />
                  </div>

                  <Card className="flex flex-wrap gap-2 mb-4 p-2 h-38 max-w-[60%] overflow-x-auto">
                    {productData?.images?.length > 0 ? (
                      productData.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative  border rounded-md overflow-hidden"
                        >
                          <Image
                            src={
                              image instanceof File
                                ? URL.createObjectURL(image)
                                : "/product.png"
                            }
                            alt={`image-${index}`}
                            className="w-32 h-32 "
                            width={500} // Specify a width
                            height={500} // Specify a height
                            style={{ objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full px-2.5 py-1"
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="h-32 w-32 rounded-md bg-muted-foreground/70 text-white flex items-center justify-center">
                        {" "}
                        No Image
                      </div>
                    )}
                  </Card>

                  <div className="flex justify-end space-x-4 mt-7">
                    <Button
                      disabled={loading}
                      type="submit"
                      // className="w-full bg-green-500 hover:bg-green-600"
                      className="w-full max-w-32 py-5 "
                    >
                      <i className="fa-solid fa-upload"></i>{" "}
                      {loading ? "Submitting" : "Submit"}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <ProductList isAdded={isAdded} />
    </div>
  );
};

export default ProductUpload;
