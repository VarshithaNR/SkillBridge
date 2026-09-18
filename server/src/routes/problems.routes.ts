import { Router } from 'express';
import * as problemController from '../controllers/problem.controller';
import * as proposalController from '../controllers/proposal.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public: anyone can browse and view problems, no auth required. Uses
// optional auth so a logged-in business can pass ?mine=true and see their
// own problems across every status, while anonymous visitors are unaffected.
router.get('/', optionalAuthenticate, problemController.list);
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

// Proposals, nested under the problem they belong to (docs/api/endpoints.md).
// Ownership (only the problem's poster can list its proposals) is checked in
// the service layer, same reasoning as PATCH/DELETE above.
router.post(
  '/:problemId/proposals',
  authenticate,
  requireRole('developer'),
  proposalController.validateIdParam('problemId'),
  proposalController.submit
);
router.get(
  '/:problemId/proposals',
  authenticate,
  requireRole('business', 'admin'),
  proposalController.validateIdParam('problemId'),
  proposalController.listForProblem
);

export default router;
