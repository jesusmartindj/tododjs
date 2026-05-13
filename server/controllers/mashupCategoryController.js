import MashupCategory from '../models/MashupCategory.js';
import Mashup from '../models/Mashup.js';

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

// @desc  Get all active mashup categories with live mashup counts
// @route GET /api/mashup-categories
// @access Public
export const getMashupCategories = async (req, res) => {
  try {
    const includeInactive = req.query.all === 'true' && req.user?.role === 'admin';
    const filter = includeInactive ? {} : { isActive: true };
    const categories = await MashupCategory.find(filter).sort('sortOrder name').lean();

    const [mashupCounts, totalMashups] = await Promise.all([
      Mashup.aggregate([
        { $match: { isPublished: true, category: { $nin: [null, 'Others', ''] } } },
        { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 } } }
      ]),
      Mashup.countDocuments({ isPublished: true })
    ]);
    const countMap = Object.fromEntries(mashupCounts.map(c => [c._id, c.count]));

    const data = categories.map(c => ({
      ...c,
      mashupCount: countMap[(c.name || '').toLowerCase()] || 0
    }));

    res.json({ success: true, data, totalMashups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Create mashup category
// @route POST /api/mashup-categories
// @access Admin
export const createMashupCategory = async (req, res) => {
  try {
    const { name, description, color, thumbnail, sortOrder } = req.body;
    const category = await MashupCategory.create({
      name, description, color, thumbnail, sortOrder,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc  Update mashup category
// @route PUT /api/mashup-categories/:id
// @access Admin
export const updateMashupCategory = async (req, res) => {
  try {
    const category = await MashupCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    const { name, description, color, thumbnail, sortOrder, isActive } = req.body;
    if (name       !== undefined) category.name        = name;
    if (description !== undefined) category.description = description;
    if (color      !== undefined) category.color       = color;
    if (thumbnail  !== undefined) category.thumbnail   = thumbnail;
    if (sortOrder  !== undefined) category.sortOrder   = sortOrder;
    if (isActive   !== undefined) category.isActive    = isActive;
    await category.save();
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc  Seed default mashup genre categories (admin only)
// @route POST /api/mashup-categories/seed
// @access Admin
export const seedMashupCategories = async (req, res) => {
  try {
    let created = 0;
    for (const cat of DEFAULT_MASHUP_CATEGORIES) {
      const existing = await MashupCategory.findOne({ name: cat.name });
      if (!existing) {
        await MashupCategory.create({ ...cat, isActive: true });
        created++;
      }
    }
    res.json({ success: true, message: `Seeded ${created} new mashup categories`, created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete mashup category
// @route DELETE /api/mashup-categories/:id
// @access Admin
export const deleteMashupCategory = async (req, res) => {
  try {
    const category = await MashupCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Mashup category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
