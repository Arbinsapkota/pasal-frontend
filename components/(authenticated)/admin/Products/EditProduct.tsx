import TextEditor from "@/components/(non-authenticated)/textEditor/TextEditor";
import {
  axiosAuthInstance,
  axiosInstance,
  axiosMultipartInstance,
} from "@/components/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Product } from "@/redux/slices/cartSlice";
import axios from "axios";
import Image from "next/image";
import React, { SetStateAction, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoAdd } from "react-icons/io5";

interface EditProductProps {
  product: Product;
  onClose: () => void;
  setIsUpdated: React.Dispatch<SetStateAction<boolean>>;
  setActiveProductId: React.Dispatch<SetStateAction<string | null>>;
}

async function urlToBinaryFile(url: string, fileName = "file") {
  try {
    // Fetch the file from the URL
    const response = await fetch(url);

    // Ensure the fetch was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Convert the response to a Blob
    const blob = await response.blob();

    // Create a File from the Blob
    const file = new File([blob], fileName, { type: blob.type });

    return file;
  } catch (error) {
    console.error("Error converting URL to binary file:", error);
  }
}

interface Category {
  categoryId: string;
  name: string;
  createdAt: string; // ISO string for date
  updatedAt: string | null; // Nullable in case it's not updated
}

interface SubCategory {
  subcategoryId: string;
  category: Category;
  name: string;
  createdAt: string; // ISO string for date
  updatedAt: string | null; // Nullable in case it's not updated
}

const EditProduct: React.FC<EditProductProps> = ({
  product,
  onClose,
  setIsUpdated,
  setActiveProductId,
}) => {
  const [name, setName] = useState(product?.name);
  const [description, setDescription] = useState(
    product?.description.replace(/^,/, "")
  );
  const [price, setPrice] = useState(product?.price);
  const [subCategoryId, setSubCategoryId] = useState(product?.subcategory);
  const [discountedPrice, setDiscountedPrice] = useState(
    product?.discountedPrice
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    product?.discountPercentage
  );
  const [categoryId, setCategoryId] = useState<string | undefined>(
    product?.category
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([]);
  const [oldImgs, setOldImgs] = useState<string[]>([]);
  const [deletedImgUrls, setDeletedImgUrls] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [oldLabelImg, setOldLabelImg] = useState<string | File | undefined>(
    product?.labelImgUrl
  );
  const [images, setImages] = useState<File[]>([]);
  const [stock, setStock] = useState<number | string | undefined>(
    product?.stock ?? 0
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const inputLabelRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef?.current?.click();
  };

  const handleLabelClick = () => {
    inputLabelRef?.current?.click();
  };

  useEffect(() => {
    setName(product.name);
    setSubCategoryId(product.subcategory);
    setDescription(product.description);
    setPrice(product.price);
    setDiscountedPrice(product.discountedPrice);
    setDiscountPercentage(product.discountPercentage);
    setImages([]); // Convert URLs to File objects
    setOldImgs(product?.imageUrls);
    setStock(product.stock);
    setOldLabelImg(product?.labelImgUrl);
  }, [product]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    axiosInstance()
      .get("/api/subcategory/")
      .then(res => {
        setAllSubCategories(res.data);
        setSubCategories(
          res.data.filter(
            (subCat: SubCategory) =>
              subCat?.category?.categoryId == product?.category
          )
        );
      })
      .catch(err => console.error("Err", err));

    fetchCategories();
  }, []);

  const handleCategoryChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const categoryId = e.target.value;

    setCategoryId(categoryId);
    setSubCategories(
      allSubCategories.filter(
        subCat => subCat.category.categoryId == categoryId
      )
    );
    // try {
    //   const response = await axios.get(
    //     `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/by-category?category=${categoryId}`
    //   );
    //   setSubCategories(response.data);
    //   console.log("Subcategories: ", response.data);
    // } catch (error) {
    //   console.error("Error fetching subcategories:", error);
    // }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);

      if (oldImgs.length + images.length + newImages.length > 4) {
        toast.error("You can upload a maximum of 4 images");
        return;
      }

      setImages(prev => {
        return [...prev, ...newImages];
      });

      // if (productData.images.length + newImages.length > 4) {
      //   toast.error("You can upload a maximum of 4 images");
      //   return;
      // }

      // setProductData({
      //   ...productData,
      //   images: [...productData.images, ...newImages],
      // });
    }
  };

  const handleLabelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedImage = e.target.files[0];
      setOldLabelImg(selectedImage);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    if (discountedPrice >= price) {
      toast.error("Discounted price must be less than the original price.");
      setIsSubmitting(false);

      return;
    }

    const formData = new FormData();
    if (name) {
      formData.append("name", name);
    } else {
      toast.error("Name is required");

      setIsSubmitting(false);

      return;
    }
    if (description) {
      formData.append("description", description);
    } else {
      toast.error("Description is required");

      setIsSubmitting(false);

      return;
    }
    if (subCategoryId) {
      formData.append("subcategoryId", subCategoryId);
    } else {
      toast.error("Subcategory is required");

      setIsSubmitting(false);

      return;
    }
    if (price) {
      formData.append("price", price?.toString());
    } else {
      toast.error("Price is required");

      setIsSubmitting(false);

      return;
    }

    if (discountedPrice) {
      formData.append("discountedPrice", discountedPrice?.toString());
    }

    if (discountPercentage) {
      formData.append("discountPercentage", discountPercentage?.toString());
    }

    formData.append("productId", product?.productId);

    if (stock) {
      formData.append("stock", stock?.toString());
    }

    if (oldImgs.length == 0 && images.length == 0) {
      toast.error("At least one Image is required");

      setIsSubmitting(false);

      return;
    } else {
      images.forEach(image => formData.append("images", image));
    }

    if (categoryId) {
      formData.append("categoryId", categoryId);
    } else {
      // toast.error("");
      setIsSubmitting(false);

      return;
    }

    if (oldLabelImg && oldLabelImg instanceof File) {
      formData.append("labelImg", oldLabelImg);
    }
    if (oldLabelImg == undefined) {
      axiosAuthInstance()
        .delete(
          `/api/product/label/image?labelImageUrl=${product?.labelImgUrl}`
        )
        .catch(err => console.error("Error Deleting Label Image", err));
    }

    if (deletedImgUrls.length > 0) {
      const deleteImgPromises = deletedImgUrls.map(imgUrl => {
        return axiosAuthInstance().post(
          `/api/product/image?imageUrl=${imgUrl}`
        );
      });

      Promise.all(deleteImgPromises)
        .then(responses => {
          // All delete requests are successful, now proceed with the product update
          axiosMultipartInstance()
            .post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`,
              formData
            )
            .then(res => {
              toast.success("Product updated successfully.");
              setIsUpdated(prev => !prev);
              // window.location.reload();
              setIsSubmitting(false);
            })
            .catch(err => {
              toast.error("Error updating product.");
              console.error("Error updating product:", err);
              setIsSubmitting(false);
            });
        })
        .catch(err => {
          toast.error("Something went wrong during image deletion.");
          console.error("Error deleting images:", err);
          setIsSubmitting(false);
        });
    } else {
      // No images to delete, proceed directly with the product update
      axiosMultipartInstance()
        .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, formData)
        .then(res => {
          toast.success("Product updated successfully.");
          setActiveProductId(null);
          setIsUpdated(prev => !prev);
          // window.location.reload();
          setIsSubmitting(false);
        })
        .catch(err => {
          toast.error("Error updating product.");
          console.error("Error updating product:", err);
          setIsSubmitting(false);
        });
    }
    onClose();
  };

  const handleSubCategorySelect = (subcategoryId: string) => {
    setSubCategoryId(subcategoryId);
  };

  const removeImage = (url: string) => {
    setDeletedImgUrls(prev => {
      return [...prev, url];
    });
    setOldImgs(oldImgs => oldImgs.filter(img => img !== url));
    // console.log("oldImgs", oldImgs[0], "url", url);
  };

  const removeUploadedImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  // for handling

  const isQuillContent = (desc: string) => {
    if (!desc) return false;

    // Case 1: pure Quill JSON like `[{"insert":"..."}]`
    if (desc.trim().startsWith('[{"insert"')) {
      return true;
    }

    // Case 2: contains JSON part like `,[{...}]` or has attributes
    if (desc.includes(',[{"insert"')) {
      return true;
    }

    if (desc.includes('[{"attributes"')) {
      return true;
    }

    return false;
  };

  return (
    // <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
    <div className=" ">
      <div className="mb-2">
        <label className="text-sm font-medium flex items-center">
          <i className="fa-solid fa-tag mr-2"></i> Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      <div className="mb-2">
        <label className="text-sm font-medium flex items-center">
          <i className="fa-solid fa-pencil-alt mr-2"></i> Description
        </label>
        <TextEditor value={description} onChange={setDescription} />

        {/* <textarea
          // value={description}
          // onChange={(e) => setDescription(e.target.value)}
          className="w-full max-h-40 border px-2 py-1 rounded"
        /> */}
        {/* mahendra */}
      </div>
      {description && !isQuillContent(description) && (
        <div className="max-h-40 overflow-y-scroll border rounded-md p-4">
          <p>{description}</p>
        </div>
      )}

      <div className="mb-2">
        <label className="text-sm font-medium flex items-center">
          Price (Rs)
        </label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(parseFloat(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      <div className="mb-2">
        <label className="text-sm font-medium flex items-center">
          <i className="fa-solid fa-tags mr-2"></i> Discount
          percentage(optional)
        </label>
        <input
          type="number"
          value={discountPercentage}
          onChange={e => setDiscountPercentage(parseFloat(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      {/* 
      <div className="mb-2">
        <label className="text-sm font-medium flex items-center">
          <i className="fa-solid fa-tags mr-2"></i> Discounted Price
        </label>
        <input
          type="number"
          value={discountedPrice}
          onChange={e => setDiscountedPrice(parseFloat(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div> */}

      <div className="mb-2">
        <label className="text-sm font-medium flex items-center">
          <i className="fa-solid fa-box mr-2"></i> Stock
        </label>
        <input
          type="number"
          value={stock}
          onChange={e => setStock(parseFloat(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium " htmlFor="categoryId">
          <i className="fa-solid fa-list-alt"></i> Category
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
          name="categoryId"
          value={categoryId || ""}
          onChange={handleCategoryChange}
          required
        >
          <option value="" disabled>
            Select Category
          </option>
          {categories
            ?.filter(cat =>
              allSubCategories.some(
                subCat => subCat.category.categoryId == cat.categoryId
              )
            )
            .map(category => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium " htmlFor="subcategoryId">
          <i className="fa-solid fa-list-alt"></i> Subcategory
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
          name="subcategoryId"
          value={subCategoryId}
          onChange={e => handleSubCategorySelect(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Subcategory
          </option>
          {subCategories.map(subcategory => (
            <option
              key={subcategory.subcategoryId}
              value={subcategory.subcategoryId}
            >
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium " htmlFor="images">
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
        {oldImgs?.length > 0 ? (
          oldImgs?.map((image, index) => (
            <div
              key={index}
              className="relative  border rounded-md overflow-hidden"
            >
              <Image
                src={image || "/product.png"}
                alt={`image-${index}`}
                className="w-32 h-32 "
                width={500} // Specify a width
                height={500} // Specify a height
                style={{ objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removeImage(image)}
                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full px-2.5 py-1"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          ))
        ) : images.length == 0 ? (
          <div className="h-32 w-32 rounded-md bg-muted-foreground/70 text-white flex items-center justify-center">
            {" "}
            No Image
          </div>
        ) : null}
        {images?.length > 0 &&
          images?.map((image, index) => (
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
                onClick={() => removeUploadedImage(index)}
                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full px-2.5 py-1"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          ))}
      </Card>

      <div className="flex justify-end space-x-2">
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="flex w-full max-w-28 mt-2"
        >
          {/* <i className="fa-solid fa-save"></i> */}
          <span>{isSubmitting ? "Saving..." : "Save"}</span>
        </Button>
      </div>
    </div>
    // </div>
  );
};

export default EditProduct;
