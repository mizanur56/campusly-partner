import { useGetMediaByIdQuery } from "../../redux/features/media/mediaApi";
import AntImage from "./AntImage";
import { config } from "../../config";

interface CourseImageProps {
  imageId?: string | null;
  image?: any;
  courseImage?: any;
  defaultImage?: string;
  width?: number | string;
  height?: number | string;
}

const CourseImage: React.FC<CourseImageProps> = ({
  imageId,
  image,
  courseImage,
  defaultImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4YhCWEDc4h0SfI5zT42VxRRpFQeSAZT3OYw&s",
  width = 100,
  height = 100,
}) => {
  // Fetch image data if only imageId is available
  const { data: imageData } = useGetMediaByIdQuery(imageId || "", {
    skip: !imageId || !!image || !!courseImage,
  });

  // Determine image URL
  let imageUrl = null;

  // First check if image object exists with url
  if (image?.url) {
    imageUrl = image.url.startsWith("http")
      ? image.url
      : `${config.image_access_url}${image.url}`;
  }
  // Check courseImage object
  else if (courseImage?.url) {
    imageUrl = courseImage.url.startsWith("http")
      ? courseImage.url
      : `${config.image_access_url}${courseImage.url}`;
  }
  // Check if image is a string
  else if (typeof image === 'string' && image) {
    imageUrl = image.startsWith("http")
      ? image
      : `${config.image_access_url}/${image}`;
  }
  // If imageId exists and we fetched the image data
  else if (imageId && imageData?.data?.url) {
    const url = imageData.data.url;
    imageUrl = url.startsWith("http")
      ? url
      : `${config.image_access_url}${url}`;
  }
  // If imageId exists but no data fetched yet, construct URL from imageId
  else if (imageId) {
    imageUrl = `${config.image_access_url}/media/${imageId}`;
  }

  return <AntImage src={imageUrl || defaultImage} alt="Course image" width={width} height={height} />;
};

export default CourseImage;

