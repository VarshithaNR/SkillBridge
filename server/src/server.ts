import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function main(): Promise<void> {
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 SkillBridge API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', error);
  process.exit(1);
});
