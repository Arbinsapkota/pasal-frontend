"use client";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { axiosAuthInstance } from "../axiosInstance";
import { Button } from "../ui/button";
interface ExcelUploadProps {
  setIsAdded: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDialogOpenExcel : React.Dispatch<React.SetStateAction<boolean>>; 
}

export default function ExcelUpload({ setIsAdded, setIsDialogOpenExcel }: ExcelUploadProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = (file: File) => {
    setSelectedFile(file); // Save original file for upload
    const reader = new FileReader();
    reader.onload = evt => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setProducts(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // Actual Excel file

    setLoading(true);
    try {
      await axiosAuthInstance().post("/api/product/excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setIsAdded(prev => !prev);
      setIsDialogOpenExcel(false)
      toast.dismiss();
      toast.success("Upload successful");
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open("", "_blank");
    if (!previewWindow) return;

    const tableRows = products
      .map(product => {
        const cols = Object.keys(product)
          .map(key => `<td class="border px-4 py-2">${product[key]}</td>`)
          .join("");
        return `<tr>${cols}</tr>`;
      })
      .join("");

    const tableHeader = Object.keys(products[0] || {})
      .map(key => `<th class="bg-gray-100 px-4 py-2">${key}</th>`)
      .join("");

    const html = `
      <html>
        <head>
          <title>Product Preview</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>Preview of ${products.length} Product(s)</h2>
          <table>
            <thead><tr>${tableHeader}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full flex flex-col items-center justify-center h-72 p-6 mb-4 text-xl text-center border-2 border-dashed rounded-md cursor-pointer transition-all duration-200 max-w-md text-gray-600 ${
          isDragging ? "bg-blue-50 border-blue-400" : "border-gray-300"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        {isDragging
          ? "Drop the file here"
          : "Drag and drop Excel file here, or click to browse"}
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="bg-blue-600 text-white sm:px-10 px-4 py-4 font-semibold rounded hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload Products"}
        </Button>

        {products.length > 0 && (
          <Button
            onClick={handlePreview}
            className="bg-green-600 text-white sm:px-10 px-4 py-4 font-semibold rounded hover:bg-green-700"
          >
            Preview
          </Button>
        )}
      </div>

      {products.length > 0 && (
        <p className="mt-3 text-sm text-gray-600 text-center">
          {products.length} product{products.length > 1 ? "s" : ""} ready to
          upload & preview.
        </p>
      )}
    </div>
  );
}
