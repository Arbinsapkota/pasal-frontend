import axios from "axios";

interface FeatureImage {
  featureId: string;
  title: string;
  fileUrl: string;
  mediaType: string;
  activeStatus: string;
  createdAt: string | null;
  updatedAt: string | null;
  imageFile: string | null;
}

export const fetchFilteredImageUrls = async (
  titleFilter: string,
  imageTypeFilter: string
): Promise<string[]> => {
  try {
    // Fetch data from backend
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/`,
      {
        withCredentials: true,
      }
    );

    // Check for valid response
    if (response.data && Array.isArray(response.data)) {
      // Filter images based on title and imageType
      const filteredImages = response.data.filter((image: FeatureImage) => {
        const titleMatch =
          titleFilter === "" ||
          image.title?.toLowerCase().includes(titleFilter.toLowerCase());
        const imageTypeMatch =
          imageTypeFilter === "" || image.mediaType === imageTypeFilter;

        return titleMatch && imageTypeMatch;
      });

      // Return only the fileUrl values
      return filteredImages.map((image: FeatureImage) => image.fileUrl);
    }

    return [];
  } catch (error) {
    console.error("Error fetching and filtering images:", error);
    return [];
  }
};

const getImageUrls = async () => {
  const titleFilter = "feature"; // Filter by title
  const imageTypeFilter = "FEATURE"; // Filter by imageType

  const filteredUrls = await fetchFilteredImageUrls(
    titleFilter,
    imageTypeFilter
  );

  // console.log("Filtered Image URLs:", filteredUrls);
};

getImageUrls();
