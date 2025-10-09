import Database from 'better-sqlite3';
import path from 'path';

export interface Image {
  id?: number;
  filename: string;
  r2Key: string;
  url: string;
  width?: number;
  height?: number;
  size: number;
  uploadedAt: string;
}

// Database will be stored in the project root as photoroom.db
const dbPath = path.join(process.cwd(), 'photoroom.db');
const db = new Database(dbPath);

// Create images table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    r2Key TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    size INTEGER NOT NULL,
    uploadedAt TEXT NOT NULL
  )
`);

// Create index on uploadedAt for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_images_uploadedAt ON images(uploadedAt DESC)
`);

export function addImage(image: Omit<Image, 'id'>): number {
  const stmt = db.prepare(`
    INSERT INTO images (filename, r2Key, url, width, height, size, uploadedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    image.filename,
    image.r2Key,
    image.url,
    image.width || null,
    image.height || null,
    image.size,
    image.uploadedAt
  );

  return result.lastInsertRowid as number;
}

export function getAllImages(): Image[] {
  const stmt = db.prepare(`
    SELECT * FROM images ORDER BY uploadedAt DESC
  `);

  return stmt.all() as Image[];
}

export function getImageById(id: number): Image | undefined {
  const stmt = db.prepare(`
    SELECT * FROM images WHERE id = ?
  `);

  return stmt.get(id) as Image | undefined;
}

export function deleteImage(id: number): void {
  const stmt = db.prepare(`
    DELETE FROM images WHERE id = ?
  `);

  stmt.run(id);
}

export { db };
