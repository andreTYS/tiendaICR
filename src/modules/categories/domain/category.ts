export interface Category {
  id: string;
  slug: string;
  nameEs: string;
  nameEn?: string;
}

export type CategoryData = Omit<Category, 'id'>;
