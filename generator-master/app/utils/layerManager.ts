import { Collection } from "../types/collection";

export interface SelectedLayer {
  collection: string;
  attribute: string;
  imageUrl: string;
  orderIndex: number;
}

export const getOrderIndex = (
  collection: Collection,
  attributeName: string
): number => {
  const attributeIndex = collection.attributes.findIndex(
    (attr: { attributeName: string }) => attr.attributeName === attributeName
  );

  if (attributeIndex === -1) {
    throw new Error(`Attribute ${attributeName} not found in collection`);
  }

  // Jika OrderImages ada dan valid, gunakan nilai dari OrderImages
  // Nilai yang lebih kecil akan berada di layer paling bawah
  if (collection.OrderImages?.[attributeIndex] !== undefined) {
    return collection.OrderImages[attributeIndex];
  }

  // Fallback ke attributeIndex jika OrderImages tidak ada
  return attributeIndex;
};

export const createLayer = (
  collection: Collection,
  attributeName: string,
  imageUrl: string | null
): SelectedLayer => {
  if (imageUrl === null) {
    throw new Error("Cannot create layer with null imageUrl");
  }

  return {
    collection: collection.AssetsUrlPath,
    attribute: attributeName,
    imageUrl: imageUrl,
    orderIndex: getOrderIndex(collection, attributeName),
  };
};
