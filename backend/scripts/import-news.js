const dotenv = require('dotenv');
const connectDB = require('../src/config/db');
const importRedditPosts = require('../src/utils/importNewsPosts');

dotenv.config();

(async () => {
  await connectDB();
  await importRedditPosts('startups'); // or programming, technology, etc.
  process.exit();
})();
