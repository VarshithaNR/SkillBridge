import { Router } from 'express';
import * as proposalController from '../controllers/proposal.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// A developer's own proposals across all problems. Declared before /:id so
// "me" is never parsed as an ObjectId.
router.get('/me', authenticate, requireRole('developer'), proposalController.listMine);

// Visible to the proposal's own developer, the problem's owner, or an admin —
// enforced in the service layer since it depends on data, not just role.
router.get('/:id', authenticate, proposalController.validateIdParam('id'), proposalController.getById);

router.patch(
  '/:id/accept',
  authenticate,
  requireRole('business', 'admin'),
  proposalController.validateIdParam('id'),
  proposalController.accept
);

router.patch(
  '/:id/reject',
  authenticate,
  requireRole('business', 'admin'),
  proposalController.validateIdParam('id'),
  proposalController.reject
);

router.patch(
  '/:id/withdraw',
  authenticate,
  requireRole('developer', 'admin'),
  proposalController.validateIdParam('id'),
  proposalController.withdraw
);

export default router;
