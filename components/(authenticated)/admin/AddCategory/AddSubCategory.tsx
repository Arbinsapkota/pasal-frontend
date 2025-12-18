"use client";

import { getTokenFromCookies } from "@/components/cookie/cookie";
import LoadingContent from "@/components/loaidng/LoaidngCotent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

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
  const token = getTokenFromCookies();

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoaidng] = useState({
    add: false,
    edit: false,
    getLoading: true,
  });

  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [dialog, setDialog] = useState(false);
  const [selectedDeleteSubCategory, setSelectedDeleteSubCategory] =
    useState<Category | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 10;

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/`
      );
      setCategories(response.data);
    } catch {
      toast.error("Failed to load subcategories");
    } finally {
      setSubmitLoaidng(prev => ({ ...prev, getLoading: false }));
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
      );
      setParentCategories(response.data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedParentCategory) {
      toast.error("Please select a category");
      return;
    }

    const formData = {
      subcategoryId: editingCategory?.subcategoryId,
      name: categoryName,
      category: { categoryId: selectedParentCategory },
    };

    try {
      setLoading(true);
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
        toast.success("Subcategory updated");
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
        toast.success("Subcategory created");
      }

      setDialog(false);
      setEditingCategory(null);
      setCategoryName("");
      setSelectedParentCategory("");
      fetchCategories();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subcategory/?id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("Subcategory deleted");
      fetchCategories();
      setSelectedDeleteSubCategory(null);
    } catch {
      toast.error("Subcategory already in use");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-3xl border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Subcategories
        </h2>

        <Button
          onClick={() => setDialog(true)}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
        >
          <Plus size={18} />
          Add Subcategory
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600">
              <th className="px-6 py-4 text-left">#</th>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-left">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {submitLoading.getLoading
              ? [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <LoadingContent className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              : currentCategories.map((item, i) => (
                  <tr key={item.subcategoryId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {(currentPage - 1) * categoriesPerPage + i + 1}
                    </td>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.category.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setEditingCategory(item);
                          setCategoryName(item.name);
                          setSelectedParentCategory(item.category.categoryId);
                          setDialog(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon size={18} />
                      </button>

                      <Dialog
                        open={
                          selectedDeleteSubCategory?.subcategoryId ===
                          item.subcategoryId
                        }
                        onOpenChange={open =>
                          setSelectedDeleteSubCategory(open ? item : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <TrashIcon
                            size={18}
                            className="text-red-500 cursor-pointer"
                          />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Subcategory</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setSelectedDeleteSubCategory(null)
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleDelete(item.subcategoryId)
                              }
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
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Subcategory" : "Add Subcategory"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              value={selectedParentCategory}
              onValueChange={setSelectedParentCategory}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {parentCategories.map(cat => (
                  <SelectItem
                    key={cat.categoryId}
                    value={cat.categoryId}
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <input
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder="Subcategory name"
              required
              className="w-full rounded-xl border px-4 py-2"
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubCategoryForm;
