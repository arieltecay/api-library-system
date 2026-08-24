export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: Set<string>): string {
  let slug = baseSlug;
  let counter = 1;
  while (existingSlugs.has(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}