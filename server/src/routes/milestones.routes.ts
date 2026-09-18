import { Router } from 'express';
import * as milestoneController from '../controllers/milestone.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Direct milestone routes. Membership + role-appropriate status transitions
// are enforced in the service layer (business edits/approves/rejects,
// developer moves work status, admin can do either).
router.patch(
  '/:id',
  authenticate,
  milestoneController.validateIdParam('id'),
  milestoneController.update
);
router.delete(
  '/:id',
  authenticate,
  milestoneController.validateIdParam('id'),
  milestoneController.remove
);

export default router;
