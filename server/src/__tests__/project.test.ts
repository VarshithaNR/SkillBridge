import request from 'supertest';
import { Types } from 'mongoose';
import { createApp } from '../app';
import { Proposal } from '../models/Proposal';
import { Problem } from '../models/Problem';
import { Project } from '../models/Project';
import { signAccessToken } from '../utils/jwt';

jest.mock('../models/Proposal', () => {
  const actual = jest.requireActual('../models/Proposal');
  return {
    ...actual,
    Proposal: {
      findById: jest.fn(),
      updateMany: jest.fn(),
    },
  };
});

jest.mock('../models/Problem', () => {
  const actual = jest.requireActual('../models/Problem');
  return {
    ...actual,
    Problem: {
      findById: jest.fn(),
    },
  };
});

jest.mock('../models/Project', () => {
  const actual = jest.requireActual('../models/Project');
  return {
    ...actual,
    Project: {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    },
  };
});

const mockedProposalFindById = Proposal.findById as jest.Mock;
const mockedProposalUpdateMany = Proposal.updateMany as jest.Mock;
const mockedProblemFindById = Problem.findById as jest.Mock;
const mockedProjectCreate = Project.create as jest.Mock;
const mockedProjectFindById = Project.findById as jest.Mock;

const app = createApp();

const BUSINESS_ID = new Types.ObjectId().toString();
const OTHER_BUSINESS_ID = new Types.ObjectId().toString();
const DEVELOPER_ID = new Types.ObjectId().toString();
const OTHER_DEVELOPER_ID = new Types.ObjectId().toString();
const PROBLEM_ID = new Types.ObjectId().toString();
const PROPOSAL_ID = new Types.ObjectId().toString();
const PROJECT_ID = new Types.ObjectId().toString();

const businessToken = signAccessToken({ sub: BUSINESS_ID, role: 'business' });
const otherBusinessToken = signAccessToken({ sub: OTHER_BUSINESS_ID, role: 'business' });
const developerToken = signAccessToken({ sub: DEVELOPER_ID, role: 'developer' });
const otherDeveloperToken = signAccessToken({ sub: OTHER_DEVELOPER_ID, role: 'developer' });

/** A findById(...).populate(...) chain that's also directly awaitable, mirroring mockQuery. */
function chain<T>(result: T) {
  return {
    populate: jest.fn().mockResolvedValue(result),
    then: (resolve: (value: T) => void, reject?: (reason: unknown) => void): Promise<void> =>
      Promise.resolve(result).then(resolve, reject),
  };
}

function buildMockProblem(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(PROBLEM_ID),
    title: 'Inventory dashboard',
    description: 'Build an inventory dashboard for a small warehouse.',
    postedBy: new Types.ObjectId(BUSINESS_ID),
    status: 'open',
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildMockProposal(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(PROPOSAL_ID),
    problem: new Types.ObjectId(PROBLEM_ID),
    developer: new Types.ObjectId(DEVELOPER_ID),
    proposedBudget: 800,
    status: 'pending',
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildMockProject(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(PROJECT_ID),
    problem: new Types.ObjectId(PROBLEM_ID),
    business: new Types.ObjectId(BUSINESS_ID),
    developer: new Types.ObjectId(DEVELOPER_ID),
    title: 'Inventory dashboard',
    description: 'Build an inventory dashboard for a small warehouse.',
    totalBudget: 800,
    status: 'active',
    save: jest.fn().mockResolvedValue(undefined),
    populate: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('PATCH /api/proposals/:id/accept — project creation', () => {
  it('creates a project when a business accepts a pending proposal', async () => {
    mockedProposalFindById.mockResolvedValue(buildMockProposal());
    mockedProblemFindById.mockResolvedValue(buildMockProblem());
    mockedProposalUpdateMany.mockResolvedValue({ acknowledged: true });
    mockedProjectCreate.mockResolvedValue(buildMockProject());

    const res = await request(app)
      .patch(`/api/proposals/${PROPOSAL_ID}/accept`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
    expect(mockedProjectCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        business: expect.anything(),
        developer: expect.anything(),
        totalBudget: 800,
      })
    );
  });

  it('does not fail the request if a project already exists for the problem (double accept)', async () => {
    mockedProposalFindById.mockResolvedValue(buildMockProposal());
    mockedProblemFindById.mockResolvedValue(buildMockProblem());
    mockedProposalUpdateMany.mockResolvedValue({ acknowledged: true });

    const duplicateKeyError = Object.assign(new Error('duplicate'), { code: 11000 });
    mockedProjectCreate.mockRejectedValue(duplicateKeyError);

    const res = await request(app)
      .patch(`/api/proposals/${PROPOSAL_ID}/accept`)
      .set('Authorization', `Bearer ${businessToken}`);

    // The proposal/problem side of accepting still succeeds — the duplicate
    // project attempt is swallowed, not surfaced as a failure.
    expect(res.status).toBe(200);
  });
});

describe('GET /api/projects/:id — membership access control', () => {
  it('allows the assigned developer to view the project', async () => {
    mockedProjectFindById.mockReturnValue(chain(buildMockProject()));

    const res = await request(app)
      .get(`/api/projects/${PROJECT_ID}`)
      .set('Authorization', `Bearer ${developerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.project._id).toBeDefined();
  });

  it('allows the owning business to view the project', async () => {
    mockedProjectFindById.mockReturnValue(chain(buildMockProject()));

    const res = await request(app)
      .get(`/api/projects/${PROJECT_ID}`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
  });

  it('blocks a business that does not own the project', async () => {
    mockedProjectFindById.mockReturnValue(chain(buildMockProject()));

    const res = await request(app)
      .get(`/api/projects/${PROJECT_ID}`)
      .set('Authorization', `Bearer ${otherBusinessToken}`);

    expect(res.status).toBe(403);
  });

  it('blocks a developer who is not assigned to the project', async () => {
    mockedProjectFindById.mockReturnValue(chain(buildMockProject()));

    const res = await request(app)
      .get(`/api/projects/${PROJECT_ID}`)
      .set('Authorization', `Bearer ${otherDeveloperToken}`);

    expect(res.status).toBe(403);
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get(`/api/projects/${PROJECT_ID}`);
    expect(res.status).toBe(401);
  });
});
