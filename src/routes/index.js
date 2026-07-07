import { Router } from 'express';
import users from '../services/users/users-routes.js';
import authentications from '../services/authentications/authentications-routes.js';
import events from '../services/events/events-routes.js';
import attendances from '../services/attendances/attendances-routes.js';
import inventories from '../services/inventories/inventories-routes.js';
import blogs from '../services/blogs/blogs-routes.js';
import complaints from '../services/complaints/complaints-routes.js';

const router = Router();

router.use('/', users);
router.use('/', authentications);
router.use('/', events);
router.use('/', attendances);
router.use('/', inventories);
router.use('/', blogs);
router.use('/', complaints);
router.get('/', (req, res) => {
  res.json({ status: 'online' });
});

export default router;