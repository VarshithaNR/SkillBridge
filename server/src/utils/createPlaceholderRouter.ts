import { Router } from 'express';

/**
 * Creates a minimal placeholder router for a module that hasn't been built
 * yet. It responds so the route is verifiably wired up end-to-end (useful
 * while connecting the frontend), without pretending any real functionality
 * exists. Replace the router's contents with real routes as each module is
 * implemented — this factory is only for the "not built yet" stage.
 */
export function createPlaceholderRouter(moduleName: string): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: `${moduleName} module is not implemented yet`,
    });
  });

  return router;
}
