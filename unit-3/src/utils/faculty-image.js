import { readdir } from "node:fs/promises";
import path from "node:path";

const FACULTY_IMAGE_DIR = path.resolve(process.cwd(), "public/images/faculty");

function slugPart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function loadFacultyImages() {
  try {
    const files = await readdir(FACULTY_IMAGE_DIR);
    return files.filter((name) => /\.jpg$/i.test(name));
  } catch {
    return [];
  }
}

async function resolveFacultyPhotoFile(person = {}) {
  const files = await loadFacultyImages();
  const lowerFiles = files.map((name) => name.toLowerCase());

  const slug = slugPart(person.slug);
  const firstName = slugPart(person.first_name);
  const lastName = slugPart(person.last_name);

  const directSlug = `${slug}.jpg`;
  if (lowerFiles.includes(directSlug)) {
    return directSlug;
  }

  const firstLast = `${firstName}-${lastName}.jpg`;
  if (firstName && lastName && lowerFiles.includes(firstLast)) {
    return firstLast;
  }

  if (lastName) {
    const byLastName = files.find((name) =>
      name.toLowerCase().endsWith(`-${lastName}.jpg`)
    );
    if (byLastName) {
      return byLastName;
    }
  }

  return directSlug;
}

export { resolveFacultyPhotoFile };