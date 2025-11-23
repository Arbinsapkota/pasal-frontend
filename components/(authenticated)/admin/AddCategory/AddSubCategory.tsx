"use client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { PencilIcon, TrashIcon } from "lucide-react";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Category {
  subcategoryId: string;
  name: string;
  category: {
    categoryId: string;
    name: string;
  };
  createdAt: string;
}

interface ParentCategory {
  categoryId: string;
  name: string;
}

const SubCategoryForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoaidng] = useState({
    add: false,
    edit: false,
    getLoading: true,
  });
  const [categoryName, setCategoryName] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>(
    []
  );
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<string>("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const token = getTokenFromCookies();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoriesPerPage] = useState<number>(10);
  const [dialog, setDialog] = useState<boolean>(false);
  const [selectedDeleteSubCategory, setSelectedDeleteSubCategory] =
    useState<Category | null>(null);
  // Pagination logic
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  // Calculate total pages
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/`
      );
      setCategories(response.data);
      setSubmitLoaidng(prev => ({ ...prev, getLoading: false }));
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.dismiss();
      // toast.error("Error fetching subcategories.");
      setSubmitLoaidng(prev => ({ ...prev, getLoading: false }));
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
      );
      setParentCategories(response.data);
    } catch (error) {
      console.error("Error fetching parent categories:", error);
      toast.dismiss();
      // toast.error("Error fetching parent categories.");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  const handleCategoryNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
  };

  const handleParentCategoryChange = (value: string) => {
    setSelectedParentCategory(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedParentCategory) {
      toast.dismiss();
      toast.error("Please select a parent category.");
      return;
    }
    const formData = {
      subcategoryId: editingCategory?.subcategoryId,
      name: categoryName,
      category: { categoryId: selectedParentCategory },
    };
    try {
      setLoading(true);
      setSubmitLoaidng(prev => ({ ...prev, edit: true }));
      setSubmitLoaidng(prev => ({ ...prev, add: true }));
      if (editingCategory) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        toast.dismiss();
        toast.success("Subcategory updated successfully!");
        setDialog(false);
        setEditingCategory(null);
        setSubmitLoaidng(prev => ({ ...prev, edit: false }));
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        toast.dismiss();
        toast.success("Subcategory created successfully!");
        setDialog(false);
      }
      setCategoryName("");
      setSelectedParentCategory("");
      fetchCategories();
    } catch (error) {
      console.error("Error creating/updating subcategory:", error);
      toast.dismiss();

      toast.error("Error creating/updating subcategory.");
    } finally {
      setLoading(false);
      setSubmitLoaidng(prev => ({ ...prev, add: false }));
      setSubmitLoaidng(prev => ({ ...prev, edit: false }));
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedParentCategory(category.category.categoryId);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      toast.dismiss();
      toast.success("Subcategory deleted successfully!");
      fetchCategories();
      setSelectedDeleteSubCategory(null);
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.dismiss();
      toast.error("Error!! This Sub-Category is already in used.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto p-6 border rounded-lg bg-white shadow-md ">
        <div className="flex justify-between items-center pb-4">
          <h3 className="text-xl font-semibold mb-4">Subcategories List</h3>
          <button
            className="w-auto px-4 py-2 bg-primaryBlue text-white rounded-md hover:bg-primaryBlue/80 focus:outline-none focus:ring-2 focus:ring-primary/40 transition duration-300"
            onClick={() => setDialog(true)}
          >
            Add Sub_Category
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm">No.</th>
                <th className="py-3 px-4 text-left text-sm">Subcategory ID</th>
                <th className="py-3 px-4 text-left text-sm">
                  Subcategory Name
                </th>
                <th className="py-3 px-4 text-left text-sm"> Category</th>
                <th className="py-3 px-4 text-left text-sm">Created At</th>
                <th className="py-3 px-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submitLoading.getLoading
                ? [...Array(10)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan={6} className="px-2">
                        <LoadingContent className="w-full h-[30px] my-1.5" />
                      </td>
                    </tr>
                  ))
                : currentCategories.map((category, index) => (
                    <tr
                      key={category.subcategoryId}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 text-wrap max-w-48">
                        {category.subcategoryId}
                      </td>
                      <td className="py-3 px-4">{category.name}</td>
                      <td className="py-3 px-4">{category.category.name}</td>
                      <td className="py-3 px-4">
                        {new Date(category.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 flex space-x-3">
                        <button
                          onClick={() => {
                            handleEdit(category);
                            setDialog(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label={`Edit ${category.name}`}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>

                        <Dialog
                          open={
                            selectedDeleteSubCategory?.subcategoryId ===
                            category.subcategoryId
                          }
                          onOpenChange={open => {
                            if (open) {
                              setSelectedDeleteSubCategory(category);
                            } else {
                              setSelectedDeleteSubCategory(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <TrashIcon className="h-5 w-5 text-red-500 cursor-pointer" />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>Delete Item</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this Sub-Category?
                              This action cannot be undone.
                            </DialogDescription>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() =>
                                  setSelectedDeleteSubCategory(null)
                                }
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (selectedDeleteSubCategory) {
                                    handleDelete(
                                      selectedDeleteSubCategory.subcategoryId
                                    );
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {dialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
                <h2 className="text-2xl font-semibold text-center mb-6">
                  {editingCategory
                    ? "Edit Subcategory"
                    : "Create New Subcategory"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                  <div>
                    <label
                      htmlFor="parentCategory"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Category:
                    </label>
                    <Select
                      value={selectedParentCategory}
                      onValueChange={handleParentCategoryChange}
                      // className="w-full"
                    >
                      <SelectTrigger className="border border-gray-300 rounded-md px-3  focus:ring-2 focus:ring-primaryBlue">
                        <SelectValue placeholder="Select a super category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {parentCategories.map(parentCategory => (
                          <SelectItem
                            key={parentCategory.categoryId}
                            value={parentCategory.categoryId}
                            className="py-1 text-sm"
                          >
                            {parentCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      htmlFor="categoryName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Subcategory Name:
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      value={categoryName}
                      onChange={handleCategoryNameChange}
                      className="mt-1 block w-full px-3 py-1.5  border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className=" flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-auto px-4 py-1.5 bg-primaryBlue text-white rounded-md hover:bg-primaryBlue/80 focus:outline-none focus:ring-2 focus:ring-primary/40 transition duration-300"
                    >
                      {editingCategory
                        ? submitLoading.edit
                          ? "Updating..."
                          : "Update Subcategory"
                        : submitLoading.add
                        ? "Adding..."
                        : "Add Subcategory"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDialog(false);
                      }}
                      className="w-auto px-4 py-1.5 bg-gray-300 text-white rounded-md hover:bg-gray-600/80 focus:outline-none focus:ring-2 focus:ring-primary/40 transition duration-300 border"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Pagination controls */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Previous
            </button>
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryForm;
