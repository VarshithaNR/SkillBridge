import request from 'supertest';
import { Types } from 'mongoose';
import { createApp } from '../app';
import { Problem } from '../models/Problem';
import { signAccessToken } from '../utils/jwt';

jest.mock('../models/Problem', () => {
  const actual = jest.requireActual('../models/Problem');
  return {
    ...actual,
    Problem: {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findById: jest.fn(),
    },
  };
});

const mockedCreate = Problem.create as jest.Mock;
const mockedFind = Problem.find as jest.Mock;
const mockedCountDocuments = Problem.countDocuments as jest.Mock;
const mockedFindById = Problem.findById as jest.Mock;

const app = createApp();

const BUSINESS_ID = new Types.ObjectId().toString();
const OTHER_BUSINESS_ID = new Types.ObjectId().toString();
const DEVELOPER_ID = new Types.ObjectId().toString();

const businessToken = signAccessToken({ sub: BUSINESS_ID, role: 'business' });
const otherBusinessToken = signAccessToken({ sub: OTHER_BUSINESS_ID, role: 'business' });
const developerToken = signAccessToken({ sub: DEVELOPER_ID, role: 'developer' });

const validPayload = {
  title: 'Build an inventory tracking app',
  description: 'We need a mobile-friendly way for staff to update stock levels in real time.',
  category: 'Web Development',
  requiredSkills: ['react', 'node'],
  budgetMin: 500,
  budgetMax: 1500,
  difficulty: 'intermediate',
  locationType: 'remote',
};

function buildMockProblem(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(),
    postedBy: new Types.ObjectId(BUSINESS_ID),
    ...validPayload,
    status: 'open',
    save: jest.fn().mockResolvedValue(undefined),
    deleteOne: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('POST /api/problems', () => {
  it('allows a business user to create a problem', async () => {
    mockedCreate.mockResolvedValue(buildMockProblem());

    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${businessToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ postedBy: BUSINESS_ID, title: validPayload.title })
    );
  });

  it('forbids a developer user from creating a problem', async () => {
    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${developerToken}`)
      .send(validPayload);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/problems').send(validPayload);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('rejects invalid input (budgetMax below budgetMin)', async () => {
    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ ...validPayload, budgetMin: 1000, budgetMax: 100 });

    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});

describe('GET /api/problems', () => {
  it('returns a paginated list', async () => {
    const problems = [buildMockProblem(), buildMockProblem()];
    mockedFind.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(problems),
    });
    mockedCountDocuments.mockResolvedValue(2);

    const res = await request(app).get('/api/problems');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.problems).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
  });
});

describe('GET /api/problems/:id', () => {
  it('returns problem details', async () => {
    const problem = buildMockProblem();
    mockedFindById.mockReturnValue({ populate: jest.fn().mockResolvedValue(problem) });

    const res = await request(app).get(`/api/problems/${problem._id.toString()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.problem.title).toBe(validPayload.title);
  });

  it('rejects a malformed id', async () => {
    const res = await request(app).get('/api/problems/not-a-valid-id');
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/problems/:id', () => {
  it('allows the owner to update their problem', async () => {
    const problem = buildMockProblem();
    mockedFindById.mockResolvedValue(problem);

    const res = await request(app)
      .patch(`/api/problems/${problem._id.toString()}`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ title: 'Updated title here' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('forbids a different business from updating the problem', async () => {
    const problem = buildMockProblem();
    mockedFindById.mockResolvedValue(problem);

    const res = await request(app)
      .patch(`/api/problems/${problem._id.toString()}`)
      .set('Authorization', `Bearer ${otherBusinessToken}`)
      .send({ title: 'Sneaky update' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/problems/:id', () => {
  it('allows the owner to delete their problem', async () => {
    const problem = buildMockProblem();
    mockedFindById.mockResolvedValue(problem);

    const res = await request(app)
      .delete(`/api/problems/${problem._id.toString()}`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
    expect(problem.deleteOne).toHaveBeenCalled();
  });
});
