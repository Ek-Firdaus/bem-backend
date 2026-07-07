/**
 * Generate slug dasar dari title.
 * Contoh: "Rapat Tahunan BEM!" -> "rapat-tahunan-bem"
 */
export const slugify = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // buang karakter selain huruf, angka, spasi, strip
    .replace(/\s+/g, '-') // spasi jadi strip
    .replace(/-+/g, '-') // strip ganda jadi satu
    .replace(/^-|-$/g, ''); // buang strip di awal/akhir
};

/**
 * Generate slug yang dijamin unik dengan cek ke DB.
 * Kalau slug dasar sudah dipakai, tambahkan suffix -2, -3, dst.
 *
 * @param {string} title
 * @param {(slug: string) => Promise<boolean>} checkExists - fungsi cek apakah slug sudah ada di DB
 * @returns {Promise<string>}
 */
export const generateUniqueSlug = async (title, checkExists) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 2;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};