import LoadingContent from "@/components/(non-authenticated)/LoadingContent";
import { axiosMultipartInstance } from "@/components/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";

const UploadVideo: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://your-api-endpoint.com";

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/media/`);
        if (response.data) {
          const [popupImages] = response.data.filter(
            (item: any) => item?.mediaType == "VIDEO"
          );
          setImages(popupImages);
          setIsLoading(false);
          // console.log("Popup images----------", popupImages);
        }
      } catch (err) {
        setError("Failed to fetch images. Please try again.");
        console.error("Error fetching images:", err);
        setIsLoading(false);
      }
    };
    fetchImages();
  }, [isUpdated]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const uploadedImage = e.target.files[0];

      // if (!uploadedImage.type.startsWith("image/")) {
      //   setError("Only image files are allowed.");
      //   return;
      // }

      // if (uploadedImage.size > 5 * 1024 * 1024) {
      //   setError("File size must be less than 5MB.");
      //   return;
      // }

      setImage(uploadedImage);
      setError(null);
    }
  };

  // const handleDeleteImage = async (imageUrl: string) => {
  //   try {
  //     const response = await axios.delete(
  //       `${API_BASE_URL}/api/${encodeURIComponent(imageUrl)}`
  //     );
  //     if (response.status === 200) {
  //       setImages((prevImages) => prevImages.filter((img) => img !== imageUrl));
  //       setSuccess(true);
  //       console.log("Image deleted successfully");
  //     }
  //   } catch (err) {
  //     setError("Failed to delete image. Please try again.");
  //     console.error("Error deleting image:", err);
  //   } finally {
  //   }
  // };

  const handleUploadImage = async () => {
    if (!image) {
      setError("Please upload an image.");
      toast.error("No image");
      return;
    }
    setIsSubmitting(true);

    setError(null);
    setSuccess(false);

    const formData = new FormData();

    formData.append("mediaFile", image);
    formData.append("title", "VIDEO");
    formData.append("mediaType", "VIDEO");

    axiosMultipartInstance()
      .post(`/api/media/`, formData)
      .then(response => {
        setSuccess(true);
        setImages(response?.data?.mediaUrl); // Assuming the response contains the uploaded image URL
        // console.log("Image uploaded successfully", response.data);
        setIsSubmitting(false);
        setIsUpdated(prev => !prev);
        toast.dismiss();
        toast.done("Popup Image Updated Successfully!");
      })
      .catch(err => {
        toast.dismiss();
        setError("Failed to upload image. Please try again.");
        console.error("Error uploading image:", err);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="w-full grid max-w-xl gap-6 items-center mx-auto p-6 bg-white shadow-lg rounded-sm">
      <Card className=" flex flex-col items-center">
        <h3 className="text-xl py-2 font-semibold text-center text-gray-800">
          Video
        </h3>
        <div className="mt-4 w-full flex-col inline-flex ">
          {isLoading ? (
            <LoadingContent className="h-40 w-40" />
          ) : (
            // images.map((image, index) => (
            <div className="relative group w-full px-4 pb-4 flex items-center justify-center ">
              {/* <Image
                height={600}
                width={600}
                style={{ objectFit: "contain" }}
                src={images?.[0]?.fileUrl || "/product.png"}
                alt={`Uploaded Image `}
                className="w-full h-40  rounded-lg  "
              /> */}
              {/* <Image
                height={600}
                width={600}
                style={{ objectFit: "contain" }}
                src={images?.mediaUrl || "/product.png"}
                alt={`Uploaded Image `}
                className="w-full h-40  rounded-lg  "
              /> */}
              {images?.mediaUrl ? (
                <>
                  <div className="flex flex-col items-center w-full">
                    <video
                      controls
                      preload="none"
                      className="rounded-md w-full h-64"
                    >
                      <source src={images?.mediaUrl} type="video/mp4" />
                      {/* <track
                  src="/path/to/captions.vtt"
                  kind="subtitles"
                  srcLang="en"
                  label="English"
                  /> */}
                      Your browser does not support the video tag.
                    </video>
                    <div className="flex items-center gap-5 my-4">
                      <p className="font-medium">
                        Updated At :{" "}
                        {isLoading
                          ? "..."
                          : images?.[0]?.updatedAt
                          ? formatDate(images?.[0]?.updatedAt)
                          : null}
                      </p>
                      {/* <button
                  onClick={() => handleDeleteImage(image)}
                  className=" top-2 right-2 bg-red-500 text-white rounded-full p-2  transition-opacity duration-300"
                  >
                  <AiOutlineDelete className="text-lg" />
                  </button> */}
                    </div>
                  </div>
                </>
              ) : (
                <Card className="w-full h-40 flex items-center rounded-md  justify-center  text-muted-foreground font-bold">
                  Upload A Video
                </Card>
              )}
            </div>
            // ))
          )}
        </div>
      </Card>
      <div>
        {image ? (
          <div className="relative mb-6 flex items-center justify-center">
            {/* <Image
              src={URL.createObjectURL(image) || "/product.png"}
              alt="Uploaded Popup Image"
              height={800}
              width={800}
              style={{ objectFit: "contain" }}
              className="w-full h-64 object-cover rounded-lg shadow-md transition-transform duration-300 ease-in-out  "
            /> */}
            <video controls preload="none" className="rounded-md w-full h-64">
              <source src={URL.createObjectURL(image)} type="video/mp4" />
              {/* <track
                  src="/path/to/captions.vtt"
                  kind="subtitles"
                  srcLang="en"
                  label="English"
                /> */}
              Your browser does not support the video tag.
            </video>
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity duration-300"
            >
              <AiOutlineDelete className="text-lg" />
            </button>
          </div>
        ) : (
          <p className=" text-gray-500 h-64 w-full bg-muted rounded-md flex items-center text-center justify-center">
            No Video uploaded yet. Please upload a video.
          </p>
        )}
        <input
          type="file"
          // accept="image/*"
          onChange={handleImageUpload}
          className="block w-full my-6 p-3 bg-primary/80 text-white rounded-lg cursor-pointer hover:bg-primary transition duration-300 ease-in-out"
        />
      </div>
      <div className="flex justify-center mt-6">
        <Button
          onClick={handleUploadImage}
          variant={"default"}
          disabled={isSubmitting}
          className="p-6 rounded-full flex items-center gap-1.5 "
        >
          <p>{isSubmitting ? "Uploading..." : "Submit Video"}</p>
        </Button>
      </div>
    </div>
  );
};

export default UploadVideo;
