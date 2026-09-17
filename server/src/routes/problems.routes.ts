import { Router } from 'express';
import * as problemController from '../controllers/problem.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public: anyone can browse and view problems, no auth required.
router.get('/', problemController.list);
router.get('/:id', problemController.validateIdParam, problemController.getById);

// Business-only: creating a problem.
router.post('/', authenticate, requireRole('business'), problemController.create);

// Owner (or admin) only — ownership itself is checked in the service layer,
// since it depends on data (who posted the problem), not just the role.
router.patch(
  '/:id',
  authenticate,
  requireRole('business', 'admin'),
  problemController.validateIdParam,
  problemController.update
);
router.delete(
  '/:id',
  authenticate,
  requireRole('business', 'admin'),
  problemController.validateIdParam,
  problemController.remove
);

export default router;
