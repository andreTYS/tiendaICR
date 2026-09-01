import type { Project, ProjectData } from '../../domain/project';
import type { ProjectImage, ProjectImageData } from '../../domain/project-image';
import type { ProjectRepository } from '../../domain/project-repository';

let idCounter = 1;

export class InMemoryProjectRepository implements ProjectRepository {
  private projects: Project[] = [];
  private images: ProjectImage[] = [];
  private aliases: Array<{ id: string; alias: string; projectId: string }> = [];

  async create(data: ProjectData): Promise<Project> {
    const project: Project = {
      ...data,
      id: String(idCounter++),
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(project);
    return { ...project, images: [] };
  }

  async update(id: string, data: Partial<ProjectData>): Promise<Project> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Project not found: ${id}`);
    this.projects[index] = { ...this.projects[index]!, ...data, updatedAt: new Date() };
    return { ...this.projects[index]!, images: this.images.filter((i) => i.projectId === id) };
  }

  async delete(id: string): Promise<void> {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.images = this.images.filter((i) => i.projectId !== id);
    this.aliases = this.aliases.filter((a) => a.projectId !== id);
  }

  async findById(id: string): Promise<Project | null> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;
    return { ...project, images: this.images.filter((i) => i.projectId === id) };
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const project = this.projects.find((p) => p.slug === slug);
    if (!project) return null;
    return { ...project, images: this.images.filter((i) => i.projectId === project.id) };
  }

  async findActive(categoryId?: string): Promise<Project[]> {
    return this.projects
      .filter((p) => p.isActive && (!categoryId || p.categoryId === categoryId))
      .sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime())
      .map((p) => ({ ...p, images: this.images.filter((i) => i.projectId === p.id) }));
  }

  async findAll(): Promise<Project[]> {
    return [...this.projects]
      .sort((a, b) => a.order - b.order)
      .map((p) => ({ ...p, images: this.images.filter((i) => i.projectId === p.id) }));
  }

  async reorder(ids: string[]): Promise<void> {
    ids.forEach((id, index) => {
      const p = this.projects.find((p) => p.id === id);
      if (p) p.order = index;
    });
  }

  async addImage(projectId: string, data: Omit<ProjectImageData, 'projectId'>): Promise<ProjectImage> {
    const image: ProjectImage = {
      id: String(idCounter++),
      projectId,
      imageKey: data.imageKey,
      alt: data.alt,
      order: data.order,
    };
    this.images.push(image);
    return { ...image };
  }

  async removeImage(imageId: string): Promise<void> {
    this.images = this.images.filter((i) => i.id !== imageId);
  }

  async reorderImages(projectId: string, imageIds: string[]): Promise<void> {
    imageIds.forEach((id, index) => {
      const img = this.images.find((i) => i.id === id && i.projectId === projectId);
      if (img) img.order = index;
    });
  }

  async findAliasBySlug(alias: string): Promise<{ currentSlug: string } | null> {
    const found = this.aliases.find((a) => a.alias === alias);
    if (!found) return null;
    const project = this.projects.find((p) => p.id === found.projectId);
    if (!project) return null;
    return { currentSlug: project.slug };
  }

  async createAlias(alias: string, projectId: string): Promise<void> {
    this.aliases.push({ id: String(idCounter++), alias, projectId });
  }

  async deleteAliasesByProjectId(projectId: string): Promise<void> {
    this.aliases = this.aliases.filter((a) => a.projectId !== projectId);
  }

  /** Test helpers */
  seed(project: Partial<Project> & { titleEs: string; slug: string; categoryId: string; mainImageKey: string }): Project {
    const p: Project = {
      id: project.id ?? String(idCounter++),
      slug: project.slug,
      titleEs: project.titleEs,
      titleEn: project.titleEn,
      descEs: project.descEs ?? 'Description',
      descEn: project.descEn,
      location: project.location,
      categoryId: project.categoryId,
      mainImageKey: project.mainImageKey,
      order: project.order ?? 0,
      isActive: project.isActive ?? false,
      createdAt: project.createdAt ?? new Date(),
      updatedAt: project.updatedAt ?? new Date(),
      images: project.images ?? [],
    };
    this.projects.push(p);
    return p;
  }

  clear(): void {
    this.projects = [];
    this.images = [];
    this.aliases = [];
  }
}
