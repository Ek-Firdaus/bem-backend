/* eslint-disable camelcase */
import BlogsRepositories from './blogs-repositories.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';
import { generateUniqueSlug } from '../../utils/generateSlug.js';
import response from '../../utils/response.js';
import { nanoid } from 'nanoid';
import NotFoundError from '../../exceptions/not-found-error.js';

const blogsRepositories = new BlogsRepositories();

export const createBlog = async (req, res, next) => {
  try {
    const { title, content, status } = req.validated;

    const id = `blog-${nanoid(16)}`;
    const slug = await generateUniqueSlug(title, async (candidate) => {
      const existing = await blogsRepositories.getBlogBySlug(candidate);
      return !!existing;
    });

    let cover_image = null;
    let cover_image_public_id = null;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'blogs');
      cover_image = uploaded.secure_url;
      cover_image_public_id = uploaded.public_id;
    }

    const author_id = req.user.id;

    const blog = await blogsRepositories.createBlog(
      id,
      title,
      slug,
      content,
      status,
      author_id,
      cover_image,
      cover_image_public_id,
    );

    return response(res, 201, 'Blog berhasil dibuat', blog);

  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingBlog = await blogsRepositories.getBlogById(id);
    if (!existingBlog) {
      throw new NotFoundError('Blog tidak ditemukan');
    }

    let slug = existingBlog.slug;
    if (req.validated.title && req.validated.title !== existingBlog.title) {
      slug = await generateUniqueSlug(req.validated.title, async (candidate) => {
        if (candidate === existingBlog.slug) return false;
        const existing = await blogsRepositories.getBlogBySlug(candidate);
        return !!existing;
      });
    }

    const updatedData = {
      title: req.validated.title ?? existingBlog.title,
      slug: slug,
      content: req.validated.content ?? existingBlog.content,
      status: req.validated.status ?? existingBlog.status,
      cover_image: existingBlog.cover_image,
      cover_image_public_id: existingBlog.cover_image_public_id,
    };

    if (req.file) {
      if (existingBlog.cover_image_public_id) {
        await deleteFromCloudinary(existingBlog.cover_image_public_id);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, 'blogs');
      updatedData.cover_image = uploaded.secure_url;
      updatedData.cover_image_public_id = uploaded.public_id;
    }

    const blog = await blogsRepositories.updateBlog(id, updatedData);

    return response(res, 200, 'Blog berhasil diperbarui', blog);
  } catch (err) {
    next(err);
  }
};

export const getDetailBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await blogsRepositories.getBlogBySlug(slug);
    if (!blog) {
      throw new NotFoundError('Blog tidak ditemukan');
    }

    return response(res, 200, 'Blog berhasil ditampilkan', blog);
  } catch (err) {
    next(err);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await blogsRepositories.getAllBlogs();
    return response(res, 200, 'Daftar blog berhasil ditampilkan', { blogs });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingBlog = await blogsRepositories.getBlogById(id);
    if (!existingBlog) {
      throw new NotFoundError('Blog tidak ditemukan');
    }

    if (existingBlog.cover_image_public_id) {
      await deleteFromCloudinary(existingBlog.cover_image_public_id);
    }

    await blogsRepositories.deleteBlog(id);

    return response(res, 200, 'Blog berhasil dihapus');
  } catch (err) {
    next(err);
  }
};