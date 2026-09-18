import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import * as milestoneController from '../controllers/milestone.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Every project route requires auth — membership (business owner, assigned
// developer, or admin) is enforced in the service layer since it depends on
// data, not just role. Projects are never created directly here — they come
// into being automatically when a business accepts a proposal.
router.get('/', authenticate, projectController.list);
router.get('/:id', authenticate, projectController.validateIdParam('id'), projectController.getById);
router.get(
  '/:id/members',
  authenticate,
  projectController.validateIdParam('id'),
  projectController.getMembers
);
router.patch(
  '/:id',
  authenticate,
  requireRole('business', 'admin'),
  projectController.validateIdParam('id'),
  projectController.update
);

// Milestones, nested under the project they belong to.
router.post(
  '/:projectId/milestones',
  authenticate,
  requireRole('business', 'admin'),
  milestoneController.validateIdParam('projectId'),
  milestoneController.create
);
router.get(
  '/:projectId/milestones',
  authenticate,
  milestoneController.validateIdParam('projectId'),
  milestoneController.listForProject
);

export default router;
