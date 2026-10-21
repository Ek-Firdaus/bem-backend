import { Router } from 'express';
import users from '../services/users/users-routes.js';
import authentications from '../services/authentications/authentications-routes.js';
import events from '../services/events/events-routes.js';
import attendances from '../services/attendances/attendances-routes.js';
import inventories from '../services/inventories/inventories-routes.js';
import blogs from '../services/blogs/blogs-routes.js';
import complaints from '../services/complaints/complaints-routes.js';
import roles from '../services/roles/roles-routes.js';
import divisions from '../services/divisions/divisions-routes.js';
import periods from '../services/periods/periods-routes.js';
import userPeriods from '../services/user-periods/user-periods-routes.js';
import batch from '../services/batches/batches-routes.js';
import orders from '../services/orders/order-routes.js';

const router = Router();

router.use('/', users);
router.use('/', authentications);
router.use('/', events);
router.use('/', attendances);
router.use('/', inventories);
router.use('/', blogs);
router.use('/', complaints);
router.use('/', batch);
router.use('/', orders);

// RBAC
router.use('/', roles);
router.use('/', divisions);
router.use('/', periods);
router.use('/', userPeriods);
router.get('/', (req, res) => {
  res.json({ status: 'online' });
});

export default router;