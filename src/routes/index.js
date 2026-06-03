import { Router } from 'express';
import users from '../services/users/users-routes.js';
import authentications from '../services/authentications/authentications-routes.js';
import events from '../services/events/events-routes.js';
import attendances from '../services/attendances/attendances-routes.js';

const router = Router();

router.use('/', users);
router.use('/', authentications);
router.use('/', events);
router.use('/', attendances);
router.get('/', (req, res) => {
  res.json({ status: 'online' });
});


export default router;