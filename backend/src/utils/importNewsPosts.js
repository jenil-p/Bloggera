const axios = require('axios');
const Post = require('../models/Post');
const User = require('../models/User');
const Category = require('../models/Category');

async function importRedditPosts(subreddit = 'programming') {
  try {
    const users = await User.find();
    const categories = await Category.find({ isApproved: true });

    if (!users.length || !categories.length) {
      console.log('No users or approved categories available');
      return;
    }

    const redditUrl = `https://www.reddit.com/r/${subreddit}/top.json?limit=50&t=month`;
    const { data } = await axios.get(redditUrl, {
      headers: {
        'User-Agent': 'BloggeraBot/1.0',
      },
    });

    if (!data || !data.data || !data.data.children.length) {
      console.log('No Reddit posts found');
      return;
    }

    const posts = data.data.children.map(({ data: post }) => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      const contentText = post.title + '\n\n' + (post.selftext || '');

      return new Post({
        author: randomUser._id,
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: contentText.slice(0, 10000) }, // Limit large posts
              ],
            },
          ],
        }),
        image: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : null,
        tags: [subreddit],
        categories: [randomCategory._id],
        likes: [],
        comments: [],
        savedBy: [],
      });
    });

    const result = await Post.insertMany(posts);
    console.log(`${result.length} Reddit posts imported from r/${subreddit}.`);

  } catch (err) {
    console.error('Error importing Reddit posts:', err.message);
  }
}

module.exports = importRedditPosts;
