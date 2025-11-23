"use client";

import { axiosInstance } from "@/components/axiosInstance";
import { getTokenFromCookies } from "@/components/cookie/cookie";
import LoadingContent from "@/components/loaidng/LoaidngCotent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { PencilIcon, TrashIcon } from "lucide-react";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const token = getTokenFromCookies();

interface Category {
  superCategoryId: string;
  name: string;
  categoryImageUrl: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

const SupperCategoryForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [supperCategoryName, setSupperCategoryName] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  // const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // const imageInputRef = useRef<HTMLInputElement>(null);

  // const handleImageClick = () => imageInputRef.current?.click();

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setImage(file);
  //     setPreview(URL.createObjectURL(file));
  //   }
  // };

  const fetchCategories = async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superCategory/`
      );
      // Assuming higher id = newer category
      setCategories(response.data);
    } catch (err) {
      // toast.error("Error fetching categories.");
      console.log(err)
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setSupperCategoryName(category.name);
      setPreview(category.categoryImageUrl);
      // setImage(null);
    } else {
      setEditingCategory(null);
      setSupperCategoryName("");
      // setImage(null);
      setPreview(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSupperCategoryName("");
    // setImage(null);
    setPreview(null);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isDuplicate = categories.some(
      cat =>
        cat.name.toLowerCase() === supperCategoryName.trim().toLowerCase() &&
        (!editingCategory ||
          cat.superCategoryId !== editingCategory.superCategoryId) // exclude current editing category if editing
    );
    if (isDuplicate) {
      toast.dismiss();
      return toast.error("Super-Category name already exists");
    }

    // if (!editingCategory) {
    //   toast.dismiss();
    //   return toast.error("Please upload an image");
    // }
    const formData = new FormData();
    formData.append("name", supperCategoryName);
    // if (image) formData.append("categoryImage", image);
    if (editingCategory)
      formData.append("superCategoryId", editingCategory.superCategoryId);

    try {
      setLoading(true);
      await axiosInstance().post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superCategory/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      toast.success(
        editingCategory ? "Super-Category updated!" : "Super-Category created!"
      );
      fetchCategories();
      closeModal();
    } catch (error) {
      // toast.dismiss();
      // toast.error("Failed to add Super-Category.");
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // if (!confirm("Are you sure to delete this category?")) return;
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superCategory/?superCategoryId=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.dismiss();
      toast.success("Super-Category deleted!");
      fetchCategories();
      setShowModalDelete(false);
    } catch (error) {
      toast.dismiss();
      toast.error("Error! This Super-Category is already in used.");
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="sm:text-2xl font-semibold">Supper Category List</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => openModal()}
            disabled={loading || fetching}
            className="px-4 py-2 bg-primaryBlue text-white rounded hover:bg-primaryBlue/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Supper Category
          </button>
        </div>
      </div>

      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">#</th>
            {/* <th className="p-2">Image</th> */}
            <th className="p-2">Name</th>
            <th className="p-2">Created At</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fetching ? (
            <tr>
              <td colSpan={5} className="p-4 text-center">
                {[...Array(5)].map((_, index) => (
                  <LoadingContent className="h-8 mb-5" key={index} />
                ))}
              </td>
            </tr>
          ) : paginatedCategories.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center">
                No categories found.
              </td>
            </tr>
          ) : (
            paginatedCategories.map((category, index) => (
              <tr key={category.superCategoryId} className="border-t">
                <td className="p-2">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                {/* <td className="p-2">
                  <Image
                    src={category.categoryImageUrl}
                    alt={category.name}
                    width={40}
                    height={40}
                    className="rounded object-cover w-10 h-10"
                  />
                </td> */}
                <td className="p-2">{category.name}</td>
                <td className="p-2">
                  {new Date(category.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => openModal(category)}
                    disabled={loading}
                    title="Edit category"
                  >
                    <PencilIcon className="h-5 w-5 text-blue-500" />
                  </button>
                  {/* <button
                    onClick={() => handleDelete(category.categoryId)}
                    disabled={loading}
                    title="Delete category"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </button> */}
                  <Dialog
                    open={showModalDelete}
                    onOpenChange={setShowModalDelete}
                  >
                    <DialogTrigger asChild>
                      <TrashIcon className="h-5 w-5 text-red-500 cursor-pointer" />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Delete Item</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this Category? This
                        action cannot be undone.
                      </DialogDescription>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setShowModalDelete(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleDelete(category.superCategoryId);
                          }}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primaryBlue hover:text-white"
            }`}
          >
            Prev
          </button>
          <span className="px-3 py-1 rounded border bg-gray-100 text-gray-700 select-none">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primaryBlue hover:text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-500"
              disabled={loading}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? "Edit Supper Category" : "Add Supper Category"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-medium text-sm">
                  Supper Category Name
                </label>
                <input
                  type="text"
                  value={supperCategoryName}
                  onChange={e => setSupperCategoryName(e.target.value)}
                  required
                  className="w-full p-2 border rounded mt-1"
                  disabled={loading}
                />
              </div>
              {/* <div>
                <label className="font-medium text-sm">Image</label>
                {preview ? (
                  <div className="flex items-center gap-4 border border-dashed rounded p-3">
                    <Image
                      src={preview}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={handleImageClick}
                      disabled={loading}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={handleImageClick}
                    className="border border-dashed rounded p-3 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="ml-2">Click to upload</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={imageInputRef}
                  hidden
                  disabled={loading}
                />
              </div> */}
              <button
                type="submit"
                disabled={loading}
                className="bg-primaryBlue text-white py-2 rounded hover:bg-primaryBlue/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : editingCategory ? "Update" : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupperCategoryForm;
