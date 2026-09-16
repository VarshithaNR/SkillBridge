import bcrypt from 'bcrypt';
import request from 'supertest';
import { Types } from 'mongoose';
import { createApp } from '../app';
import { User } from '../models/User';
import { signAccessToken } from '../utils/jwt';
import { mockQuery } from './mockQuery';

jest.mock('../models/User', () => ({
  User: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  },
}));

const mockedFindOne = User.findOne as jest.Mock;
const mockedFindById = User.findById as jest.Mock;
const mockedCreate = User.create as jest.Mock;

const app = createApp();

function buildMockUser(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(),
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: 'developer',
    isVerified: false,
    isActive: true,
    refreshTokens: [] as string[],
    createdAt: new Date('2026-01-01'),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('POST /api/auth/register', () => {
  it('registers a new user successfully', async () => {
    mockedFindOne.mockReturnValue(mockQuery(null));
    mockedCreate.mockResolvedValue(buildMockUser());

    const res = await request(app).post('/api/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Password123',
      role: 'developer',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('ada@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects registration with a duplicate email', async () => {
    mockedFindOne.mockReturnValue(mockQuery(buildMockUser()));

    const res = await request(app).post('/api/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Password123',
      role: 'developer',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects registration with invalid data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'not-an-email',
      password: 'short',
      role: 'admin', // not a self-registerable role
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login', () => {
  it('logs in successfully with correct credentials', async () => {
    const passwordHash = await bcrypt.hash('Password123', 12);
    mockedFindOne.mockReturnValue(mockQuery(buildMockUser({ passwordHash })));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.user.email).toBe('ada@example.com');
    expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken=/);
  });

  it('rejects login with an incorrect password', async () => {
    const passwordHash = await bcrypt.hash('Password123', 12);
    mockedFindOne.mockReturnValue(mockQuery(buildMockUser({ passwordHash })));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects login for an email that does not exist', async () => {
    mockedFindOne.mockReturnValue(mockQuery(null));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the authenticated user profile with a valid token', async () => {
    const user = buildMockUser();
    mockedFindById.mockResolvedValue(user);

    const token = signAccessToken({ sub: user._id.toString(), role: 'developer' });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('ada@example.com');
  });

  it('rejects a request with no Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects a request with an invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
