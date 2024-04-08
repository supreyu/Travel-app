// db.js
import Dexie from 'dexie';

// 创建数据库和表
const db = new Dexie('TravelAppDatabase');
db.version(1).stores({
  posts: '++id, text, images, location, content'
});

export const addPost = async (text, images, location) => {
  return await db.posts.add({
    text,
    images: images.map((image) => image.uri), // 只保存图片的 URI
    location
  });
};

export const getPosts = async () => {
  return await db.posts.toArray();
};

export default db;







