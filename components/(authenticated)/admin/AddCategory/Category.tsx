"use client";

import { getTokenFromCookies } from "@/components/cookie/cookie";
import { NEXT_PUBLIC_CLOUDINARY_URL } from "@/components/env";
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
import axios from "axios";
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Category {
  categoryId: string;
  name: string;
  categoryImageUrl?: string;
  createdAt: string;
}

const CategoryForm: React.FC = () => {
  const token = getTokenFromCookies();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [getLoading, setGetLoading] = useState(true);
  const [selectedDelete, setSelectedDelete] = useState<Category | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(categories.length / perPage);
  const visibleCategories = categories.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`
      );
      setCategories(res.data);
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      setGetLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (editingCategory) formData.append("categoryId", editingCategory.categoryId);
    formData.append("name", categoryName);
    if (categoryImage) formData.append("categoryImage", categoryImage);

    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      toast.success(editingCategory ? "Category updated" : "Category created");
      setDialogOpen(false);
      setCategoryName("");
      setCategoryImage(null);
      setEditingCategory(null);
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/?id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("Category deleted");
      fetchCategories();
      setSelectedDelete(null);
    } catch {
      toast.error("Category already in use");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-3xl border border-gray-100">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Categories
        </h2>

        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
        >
          <Plus size={18} />
          Add Category
        </Button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600">
              <th className="px-6 py-4 text-left">#</th>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Image</th>
              <th className="px-6 py-4 text-left">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {getLoading
              ? [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <LoadingContent className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              : visibleCategories.map((cat, i) => (
                  <tr
                    key={cat.categoryId}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {cat.name}
                    </td>

                    <td className="px-6 py-4">
                      {cat.categoryImageUrl ? (
                        <img
                          src={`${NEXT_PUBLIC_CLOUDINARY_URL}${cat.categoryImageUrl}`}
                          className="h-10 w-10 rounded-xl object-cover border"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryName(cat.name);
                          setDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon size={18} />
                      </button>

                      <Dialog
                        open={selectedDelete?.categoryId === cat.categoryId}
                        onOpenChange={(o) =>
                          setSelectedDelete(o ? cat : null)
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
                            <DialogTitle>Delete Category</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedDelete(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleDelete(cat.categoryId)
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

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              required
              className="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && setCategoryImage(e.target.files[0])
              }
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

export default CategoryForm;
