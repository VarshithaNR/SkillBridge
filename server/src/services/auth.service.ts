import bcrypt from 'bcrypt';
import { User, IUser } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

const SALT_ROUNDS = 12;

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: IUser['role'];
  isVerified: boolean;
  createdAt: Date;
}

/** Strips passwordHash/refreshTokens and shapes a User document for API responses. */
function toSafeUser(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    // Deliberately vague message — confirming "this email exists" to an
    // unauthenticated caller is a minor account-enumeration leak, but a
    // clear message here is still far more useful than not; login errors
    // below stay fully generic since that trade-off matters more there.
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  return toSafeUser(user);
}

export interface LoginResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  // `refreshTokens` has `select: false` on the schema, same as `passwordHash`.
  // Both must be opted into explicitly here, or `user.refreshTokens` below is
  // `undefined` and `.push()` throws (that's the exact bug this fixes).
  const user = await User.findOne({ email: input.email }).select(
    '+passwordHash +refreshTokens'
  );

  // Same generic message whether the email doesn't exist or the password is
  // wrong — never reveal which one it was, that's an account-enumeration leak.
  const invalidCredentials = () => new ApiError(401, 'Invalid email or password');

  if (!user) throw invalidCredentials();
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated');

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) throw invalidCredentials();

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  user.refreshTokens.push(refreshTokenHash);
  await user.save();

  return { user: toSafeUser(user), accessToken, refreshToken };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user) throw new ApiError(401, 'Invalid or expired refresh token');

  // Confirm this exact refresh token was one we issued and hasn't been
  // revoked (e.g. by logout) — a syntactically valid JWT alone isn't enough.
  const matchIndex = await findMatchingTokenIndex(refreshToken, user.refreshTokens);
  if (matchIndex === -1) throw new ApiError(401, 'Invalid or expired refresh token');

  // Rotate: remove the used token, issue a new pair. This limits the damage
  // a stolen refresh token can do — it only works once.
  const newAccessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const newRefreshToken = signRefreshToken({ sub: user._id.toString() });
  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);

  user.refreshTokens.splice(matchIndex, 1, newRefreshTokenHash);
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return; // token already invalid/expired — nothing to revoke
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user) return;

  const matchIndex = await findMatchingTokenIndex(refreshToken, user.refreshTokens);
  if (matchIndex !== -1) {
    user.refreshTokens.splice(matchIndex, 1);
    await user.save();
  }
}

export async function getUserProfile(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return toSafeUser(user);
}

/** Hashed tokens can't be looked up with a direct query, so compare against each. */
async function findMatchingTokenIndex(token: string, hashes: string[]): Promise<number> {
  for (let i = 0; i < hashes.length; i++) {
    // eslint-disable-next-line no-await-in-loop -- sequential bcrypt.compare is intentional here
    if (await bcrypt.compare(token, hashes[i])) return i;
  }
  return -1;
}
