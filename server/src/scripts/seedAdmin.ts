/**
 * One-off script to create (or promote) an admin account. This is the only
 * supported way to get an admin into the system — there is no public admin
 * signup, by design (see auth.validator.ts).
 *
 * Usage:
 *   ADMIN_EMAIL=admin@skillbridge.com ADMIN_PASSWORD=ChangeMe123 ADMIN_NAME="Site Admin" \
 *     npm run seed:admin --prefix server
 *
 * Safe to re-run: if the email already exists, it is promoted to admin and
 * given the new password rather than creating a duplicate account.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { User } from '../models/User';

const SALT_ROUNDS = 12;

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Site Admin';

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
    process.exit(1);
  }

  await mongoose.connect(env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    existing.role = 'admin';
    existing.passwordHash = passwordHash;
    existing.name = name;
    await existing.save();
    console.log(`Promoted existing user ${normalizedEmail} to admin.`);
  } else {
    await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'admin',
      isVerified: true,
    });
    console.log(`Created admin account ${normalizedEmail}.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed to seed admin account:', err);
  process.exit(1);
});
