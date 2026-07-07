import { Router } from 'express';
import { createBlog, getAllBlogs, updateBlog, getDetailBlog, deleteBlog } from './blogs-controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticateToken, checkRole } from '../../middlewares/auth.js';
import { createBlogSchema, updateBlogSchema } from './blogs-schema.js';
import { upload } from '../../utils/cloudinary.js';

const router = Router();

router.post('/blogs', authenticateToken, checkRole(['super_admin', 'admin_komdigi']), upload.single('image'), validate(createBlogSchema), createBlog);
router.put('/blogs/:id', authenticateToken, checkRole(['super_admin', 'admin_komdigi']), upload.single('image'), validate(updateBlogSchema), updateBlog);
router.delete('/blogs/:id', authenticateToken, checkRole(['super_admin', 'admin_komdigi']), deleteBlog);

// publik
router.get('/blogs', getAllBlogs);
router.get('/blogs/:slug', getDetailBlog);

export default router;