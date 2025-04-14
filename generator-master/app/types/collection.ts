export interface Collection {
  name: string;
  AssetsUrlPath: string;
  OrderImages: number[];
  attributes: Array<{
    attributeName: string;
    maxAttributes: number;
  }>;
}
