import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Admin-only aggregate counts, powering the admin dashboard's stat cards.
// Declared before any future /:id route so "stats" is never parsed as an id.
router.get('/stats', authenticate, requireRole('admin'), userController.stats);

export default router;
