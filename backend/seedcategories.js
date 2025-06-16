const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

// List of 12 diverse categories for a blogging platform
const categories = [
  'Technology',
  'Lifestyle',
  'Travel',
  'Food & Cooking',
  'Fitness & Health',
  'Fashion',
  'Personal Finance',
  'Education',
  'Entertainment',
  'Gaming',
  'Books & Literature',
  'DIY & Crafts',
];

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://jenilsakariy:FGQ7KkZPOUmhYVBR@cluster0.v4jxsju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get existing category names (case-insensitive)
    const existingCategories = await Category.find({}).select('name');
    const existingNames = existingCategories.map(cat => cat.name.toLowerCase());

    // Filter out categories that already exist
    const newCategories = categories
      .filter(cat => !existingNames.includes(cat.toLowerCase()))
      .map(name => ({
        name,
        isApproved: true, // Mark as approved for immediate use
        suggestedBy: null, // No user suggestion for seeded categories
      }));

    if (newCategories.length === 0) {
      console.log('No new categories to add; all categories already exist.');
      return;
    }

    // Insert new categories
    const inserted = await Category.insertMany(newCategories, { ordered: false });
    console.log(`Successfully added ${inserted.length} categories:`);
    inserted.forEach(cat => console.log(`- ${cat.name}`));

  } catch (error) {
    console.error('Error seeding categories:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding script
seedCategories();