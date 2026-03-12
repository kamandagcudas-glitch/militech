
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

import placeholderData from '@/app/lib/placeholder-images.json';

export const PlaceHolderImages: ImagePlaceholder[] = placeholderData.placeholderImages;
