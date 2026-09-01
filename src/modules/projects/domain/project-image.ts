export interface ProjectImage {
  id: string;
  projectId: string;
  imageKey: string;
  alt?: string;
  order: number;
}

export type ProjectImageData = Omit<ProjectImage, 'id'>;
