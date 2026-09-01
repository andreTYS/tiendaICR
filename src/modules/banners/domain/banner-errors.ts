export class MaxActiveBannersReachedError extends Error {
  constructor(activeCount: number, max: number) {
    super(
      `Cannot activate banner: already ${activeCount} of ${max} maximum active banners`,
    );
    this.name = 'MaxActiveBannersReachedError';
  }
}

export class BannerNotFoundError extends Error {
  constructor(id: string) {
    super(`Banner not found: ${id}`);
    this.name = 'BannerNotFoundError';
  }
}
