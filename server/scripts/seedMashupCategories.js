/**
 * Seed MashupCategory with 9 independent music-genre categories.
 * These are SEPARATE from Record Pool categories (pool brands).
 *
 * Usage (from project root):
 *   node server/scripts/seedMashupCategories.js [--dry-run] [--force]
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const DRY_RUN      = process.argv.includes('--dry-run');
const FORCE        = process.argv.includes('--force');
const FROM_MASHUPS = process.argv.includes('--from-mashups');  // seed from actual mashup.category values

const DEFAULT_MASHUP_CATEGORIES = [
  { name: 'Reggaeton',            color: '#FF6B6B', sortOrder: 0 },
  { name: 'Old School Reggaeton', color: '#FF9B4A', sortOrder: 1 },
  { name: 'Dembow',               color: '#FFE066', sortOrder: 2 },
  { name: 'Trap',                 color: '#C86BFA', sortOrder: 3 },
  { name: 'House',                color: '#4DD8FF', sortOrder: 4 },
  { name: 'EDM',                  color: '#86F0B0', sortOrder: 5 },
  { name: 'Afro House',           color: '#F59E0B', sortOrder: 6 },
  { name: 'Remember',             color: '#6366F1', sortOrder: 7 },
  { name: 'International',        color: '#10B981', sortOrder: 8 },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const { default: MashupCategory } = await import('../models/MashupCategory.js');
  const { default: Mashup }         = await import('../models/Mashup.js');

  if (!DRY_RUN) {
    // Clean up any null-slug docs left from a failed prior run
    await MashupCategory.deleteMany({ slug: null });
  }

  let sourceList;

  if (FROM_MASHUPS) {
    // ── Mode: seed from actual mashup.category values in the DB ──────────────
    const distinct = await Mashup.distinct('category', {
      category: { $nin: [null, '', 'Others'] }
    });
    sourceList = distinct
      .filter(Boolean)
      .sort()
      .map((name, i) => ({ name, color: '#7C3AED', sortOrder: i }));
    console.log(`Found ${sourceList.length} distinct mashup categories in DB (dry-run: ${DRY_RUN})`);
  } else {
    // ── Mode: seed 9 default genre categories ────────────────────────────────
    sourceList = DEFAULT_MASHUP_CATEGORIES;
    const existing = await MashupCategory.countDocuments();
    if (existing > 0 && !FORCE) {
      console.log(`MashupCategory already has ${existing} documents. Use --force to re-seed.`);
      await mongoose.disconnect();
      return;
    }
    console.log(`Seeding ${sourceList.length} mashup genre categories (dry-run: ${DRY_RUN})`);
  }

  let created = 0;
  for (const cat of sourceList) {
    console.log(`  "${cat.name}"`);
    if (!DRY_RUN) {
      const exists = await MashupCategory.findOne({ name: cat.name });
      if (!exists) {
        await new MashupCategory({ ...cat, isActive: true }).save();
        created++;
      } else if (!exists.slug) {
        exists.name = cat.name;
        await exists.save();
      }
    }
  }

  console.log(`\nDone. Created: ${created} mashup categories.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
