import type { Project, ProjectData } from './project';
import type { ProjectImage, ProjectImageData } from './project-image';

export interface ProjectRepository {
  create(data: ProjectData): Promise<Project>;
  update(id: string, data: Partial<ProjectData>): Promise<Project>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  findActive(categoryId?: string): Promise<Project[]>;
  findAll(): Promise<Project[]>;
  reorder(ids: string[]): Promise<void>;
  addImage(projectId: string, data: Omit<ProjectImageData, 'projectId'>): Promise<ProjectImage>;
  removeImage(imageId: string): Promise<void>;
  reorderImages(projectId: string, imageIds: string[]): Promise<void>;
  findAliasBySlug(alias: string): Promise<{ currentSlug: string } | null>;
  createAlias(alias: string, projectId: string): Promise<void>;
  deleteAliasesByProjectId(projectId: string): Promise<void>;
}
