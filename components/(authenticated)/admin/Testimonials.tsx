"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { PencilIcon, TrashIcon } from "lucide-react";
import { getTokenFromCookies } from "@/components/cookie/cookie";

interface Testimonial {
  testimonialId: number;
  name: string;
  position: string;
  description: string;
  imageUrl: string;
  image: string;
}

interface TestimonialFormData {
  name: string;
  position: string;
  description: string;
}

const TestimonialForm: React.FC = () => {
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: "",
    position: "",
    description: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/testimonial/`,
        {
          headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
          },
          withCredentials: true,
        }
      );
      setTestimonials(response.data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.dismiss();
      // toast.error("Error fetching testimonials.");
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    if (image) {
      submitData.append("imageFile", image);
    }

    try {
      if (editingId) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/testimonial/?id=${editingId}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${getTokenFromCookies()}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        toast.success("Testimonial updated successfully!");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/testimonial/`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${getTokenFromCookies()}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        toast.success("Testimonial added successfully!");
      }
      setFormData({ name: "", position: "", description: "" });
      setImage(null);
      setPreviewUrl(null);
      setEditingId(null);
      fetchTestimonials();
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast.dismiss()
      toast.error("Error submitting testimonial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      position: testimonial.position,
      description: testimonial.description,
    });
    setPreviewUrl(testimonial.imageUrl);
    setEditingId(testimonial.testimonialId);
  };

  const handleDelete = async (testimonialId: number) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/testimonial/?testimonialId=${testimonialId}`,
          {
            headers: {
              Authorization: `Bearer ${getTokenFromCookies()}`,
            },
            withCredentials: true,
          }
        );
        toast.success("Testimonial deleted successfully!");
        fetchTestimonials();
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        toast.dismiss()
        toast.error("Error deleting testimonial.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
        {editingId ? "Edit Testimonial" : "Add a Testimonial"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-2 p-1 block w-full  rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="position"
            className="block text-sm font-medium text-gray-700"
          >
            Position
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            required
            className="mt-2 p-1 block w-full  rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="mt-2 p-1 block w-full  rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className="mt-2 block w-full ml-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {previewUrl && (
          <div className="mt-4 text-center">
            <Image
              src={previewUrl || "/product.png"}
              alt="Preview"
              width={150}
              height={150}
              className="rounded-lg object-cover mx-auto"
            />
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            {isSubmitting
              ? "Submitting..."
              : editingId
              ? "Update Testimonial"
              : "Add Testimonial"}
          </button>
        </div>
      </form>

      <h3 className="text-xl font-semibold text-gray-900 mb-6">Testimonials</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map(testimonial => (
          <div
            key={testimonial.testimonialId}
            className="border rounded-lg p-6 bg-gray-50 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4 space-x-4">
              <Image
                src={testimonial?.image || "/product.png"}
                alt={testimonial.name || "pic"}
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-lg text-gray-800">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">{testimonial.position}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{testimonial.description}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(testimonial)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <PencilIcon size={18} />
              </button>
              <button
                onClick={() => handleDelete(testimonial.testimonialId)}
                className="text-red-600 hover:text-red-800"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialForm;
