/* eslint-disable camelcase */
import pool from '../../database/pool.js';

class BlogsRepositories {
  constructor() {
    this.pool = pool;
  }

  async createBlog(id, title, slug, content, status, author_id, cover_image, cover_image_public_id) {
    const query = {
      text: `INSERT INTO blog_posts (id, title, slug, content, status, author_id, cover_image, cover_image_public_id)
      VALUES ($1 , $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      values: [id, title, slug, content, status, author_id, cover_image, cover_image_public_id]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getBlogBySlug(slug) {
    const query = {
      text: 'SELECT * FROM blog_posts WHERE slug = $1',
      values: [slug],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getBlogById(id) {
    const query = {
      text: 'SELECT * FROM blog_posts WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateBlog(id, { title, slug, content, status, cover_image, cover_image_public_id }) {
    const query = {
      text: 'UPDATE blog_posts SET title = $1, slug = $2, content = $3, status = $4, cover_image = $5, cover_image_public_id = $6 WHERE id = $7 RETURNING *',
      values: [title, slug, content, status, cover_image, cover_image_public_id, id]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getAllBlogs() {
    const query = {
      text: 'SELECT * FROM blog_posts',
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async deleteBlog(id) {
    const query = {
      text: 'DELETE FROM blog_posts WHERE id = $1 RETURNING *',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default BlogsRepositories;