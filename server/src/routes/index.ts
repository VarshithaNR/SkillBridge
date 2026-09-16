import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import problemsRoutes from './problems.routes';
import proposalsRoutes from './proposals.routes';
import projectsRoutes from './projects.routes';
import milestonesRoutes from './milestones.routes';
import messagesRoutes from './messages.routes';
import notificationsRoutes from './notifications.routes';
import reviewsRoutes from './reviews.routes';

/**
 * Single place where every module's router is mounted under /api/*.
 * app.ts only needs to know about this one router — adding a new module
 * means adding one line here, not touching app.ts.
 */
const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/problems', problemsRoutes);
router.use('/proposals', proposalsRoutes);
router.use('/projects', projectsRoutes);
router.use('/milestones', milestonesRoutes);
router.use('/messages', messagesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reviews', reviewsRoutes);

export default router;
