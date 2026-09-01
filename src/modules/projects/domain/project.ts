import type { ProjectImage } from './project-image';

export interface Project {
  id: string;
  slug: string;
  titleEs: string;
  titleEn?: string;
  descEs: string;
  descEn?: string;
  location?: string;
  categoryId: string;
  mainImageKey: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: ProjectImage[];
}

export type ProjectData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'images'> & {
  images?: ProjectImage[];
};
