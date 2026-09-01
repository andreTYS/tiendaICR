'use client';

import type { ProjectImage } from '../../domain/project-image';

interface Props {
  images: ProjectImage[];
  projectTitle: string;
}

export default function ProjectGallery({ images, projectTitle }: Props) {
  if (images.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {images.map((img) => (
          // TODO: add lightbox component in Phase 5
          <a key={img.id} href={`/api/media/${img.imageKey}`} target="_blank" rel="noopener noreferrer">
            <img
              src={`/api/media/${img.imageKey}`}
              alt={img.alt ?? `${projectTitle} — imagen ${img.order + 1}`}
              style={{
                width: '100%',
                aspectRatio: '4/3',
                objectFit: 'cover',
                borderRadius: 8,
                display: 'block',
                transition: 'opacity 0.2s',
              }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
