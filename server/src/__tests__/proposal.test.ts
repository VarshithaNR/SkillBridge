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
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn(),
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
    },
  };
});

const mockedCreate = Proposal.create as jest.Mock;
const mockedFind = Proposal.find as jest.Mock;
const mockedFindById = Proposal.findById as jest.Mock;
const mockedCountDocuments = Proposal.countDocuments as jest.Mock;
const mockedUpdateMany = Proposal.updateMany as jest.Mock;
const mockedProblemFindById = Problem.findById as jest.Mock;
const mockedProjectCreate = Project.create as jest.Mock;

const app = createApp();

const BUSINESS_ID = new Types.ObjectId().toString();
const OTHER_BUSINESS_ID = new Types.ObjectId().toString();
const DEVELOPER_ID = new Types.ObjectId().toString();
const OTHER_DEVELOPER_ID = new Types.ObjectId().toString();
const PROBLEM_ID = new Types.ObjectId().toString();

const businessToken = signAccessToken({ sub: BUSINESS_ID, role: 'business' });
const otherBusinessToken = signAccessToken({ sub: OTHER_BUSINESS_ID, role: 'business' });
const developerToken = signAccessToken({ sub: DEVELOPER_ID, role: 'developer' });
const otherDeveloperToken = signAccessToken({ sub: OTHER_DEVELOPER_ID, role: 'developer' });

const validPayload = {
  coverLetter: 'I have built three inventory systems before and can deliver this in two weeks.',
  proposedBudget: 800,
  estimatedDuration: '2 weeks',
};

function buildMockProblem(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(PROBLEM_ID),
    postedBy: new Types.ObjectId(BUSINESS_ID),
    status: 'open',
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildMockProposal(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(),
    problem: new Types.ObjectId(PROBLEM_ID),
    developer: new Types.ObjectId(DEVELOPER_ID),
    ...validPayload,
    status: 'pending',
    save: jest.fn().mockResolvedValue(undefined),
    populate: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('POST /api/problems/:problemId/proposals', () => {
  it('allows a developer to submit a proposal on an open problem', async () => {
    mockedProblemFindById.mockResolvedValue(buildMockProblem());
    mockedCreate.mockResolvedValue(buildMockProposal());

    const res = await request(app)
      .post(`/api/problems/${PROBLEM_ID}/proposals`)
      .set('Authorization', `Bearer ${developerToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ problem: PROBLEM_ID, developer: DEVELOPER_ID })
    );
  });

  it('forbids a business user from submitting a proposal', async () => {
    const res = await request(app)
      .post(`/api/problems/${PROBLEM_ID}/proposals`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send(validPayload);

    expect(res.status).toBe(403);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).post(`/api/problems/${PROBLEM_ID}/proposals`).send(validPayload);

    expect(res.status).toBe(401);
  });

  it('rejects a proposal on a problem that is not open', async () => {
    mockedProblemFindById.mockResolvedValue(buildMockProblem({ status: 'assigned' }));

    const res = await request(app)
      .post(`/api/problems/${PROBLEM_ID}/proposals`)
      .set('Authorization', `Bearer ${developerToken}`)
      .send(validPayload);

    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('returns 404 for a nonexistent problem', async () => {
    mockedProblemFindById.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/problems/${PROBLEM_ID}/proposals`)
      .set('Authorization', `Bearer ${developerToken}`)
      .send(validPayload);

    expect(res.status).toBe(404);
  });

  it('rejects a duplicate proposal for the same problem with 409', async () => {
    mockedProblemFindById.mockResolvedValue(buildMockProblem());
    mockedCreate.mockRejectedValue({ code: 11000 });

    const res = await request(app)
      .post(`/api/problems/${PROBLEM_ID}/proposals`)
      .set('Authorization', `Bearer ${developerToken}`)
      .send(validPayload);

    expect(res.status).toBe(409);
  });

  it('rejects invalid input (cover letter too short)', async () => {
    mockedProblemFindById.mockResolvedValue(buildMockProblem());

    const res = await request(app)
      .post(`/api/problems/${PROBLEM_ID}/proposals`)
      .set('Authorization', `Bearer ${developerToken}`)
      .send({ ...validPayload, coverLetter: 'too short' });

    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});

describe('GET /api/problems/:problemId/proposals', () => {
  it('allows the problem owner to list its proposals', async () => {
    mockedProblemFindById.mockResolvedValue(buildMockProblem());
    const proposals = [buildMockProposal(), buildMockProposal()];
    mockedFind.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(proposals),
    });
    mockedCountDocuments.mockResolvedValue(2);

    const res = await request(app)
      .get(`/api/problems/${PROBLEM_ID}/proposals`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.proposals).toHaveLength(2);
  });

  it('forbids a non-owner business from listing proposals', async () => {
    mockedProblemFindById.mockResolvedValue(buildMockProblem());

    const res = await request(app)
      .get(`/api/problems/${PROBLEM_ID}/proposals`)
      .set('Authorization', `Bearer ${otherBusinessToken}`);

    expect(res.status).toBe(403);
  });

  it('forbids a developer from listing proposals on a problem', async () => {
    const res = await request(app)
      .get(`/api/problems/${PROBLEM_ID}/proposals`)
      .set('Authorization', `Bearer ${developerToken}`);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/proposals/me', () => {
  it("returns the developer's own proposals", async () => {
    const proposals = [buildMockProposal()];
    mockedFind.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(proposals),
    });
    mockedCountDocuments.mockResolvedValue(1);

    const res = await request(app).get('/api/proposals/me').set('Authorization', `Bearer ${developerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.proposals).toHaveLength(1);
  });

  it('forbids a business user from calling /me', async () => {
    const res = await request(app).get('/api/proposals/me').set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/proposals/:id/accept', () => {
  it('allows the problem owner to accept a pending proposal and creates a project', async () => {
    const proposal = buildMockProposal();
    const problem = buildMockProblem();
    mockedFindById.mockResolvedValue(proposal);
    mockedProblemFindById.mockResolvedValue(problem);
    mockedUpdateMany.mockResolvedValue({ modifiedCount: 0 });
    mockedProjectCreate.mockResolvedValue({ _id: new Types.ObjectId() });

    const res = await request(app)
      .patch(`/api/proposals/${proposal._id.toString()}/accept`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
    expect(proposal.status).toBe('accepted');
    expect(problem.status).toBe('assigned');
    expect(mockedUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ problem: problem._id, status: 'pending' }),
      { $set: { status: 'rejected' } }
    );
    expect(mockedProjectCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        problem: problem._id,
        business: problem.postedBy,
        developer: proposal.developer,
        totalBudget: proposal.proposedBudget,
      })
    );
  });

  it('does not fail if a project already exists for this problem (duplicate accept call)', async () => {
    const proposal = buildMockProposal();
    const problem = buildMockProblem();
    mockedFindById.mockResolvedValue(proposal);
    mockedProblemFindById.mockResolvedValue(problem);
    mockedUpdateMany.mockResolvedValue({ modifiedCount: 0 });
    mockedProjectCreate.mockRejectedValue({ code: 11000 });

    const res = await request(app)
      .patch(`/api/proposals/${proposal._id.toString()}/accept`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
  });

  it('forbids a non-owner business from accepting', async () => {
    const proposal = buildMockProposal();
    mockedFindById.mockResolvedValue(proposal);
    mockedProblemFindById.mockResolvedValue(buildMockProblem());

    const res = await request(app)
      .patch(`/api/proposals/${proposal._id.toString()}/accept`)
      .set('Authorization', `Bearer ${otherBusinessToken}`);

    expect(res.status).toBe(403);
  });

  it('rejects accepting a proposal that is not pending', async () => {
    const proposal = buildMockProposal({ status: 'accepted' });
    mockedFindById.mockResolvedValue(proposal);
    mockedProblemFindById.mockResolvedValue(buildMockProblem());

    const res = await request(app)
      .patch(`/api/proposals/${proposal._id.toString()}/accept`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/proposals/:id/reject', () => {
  it('allows the problem owner to reject a pending proposal', async () => {
    const proposal = buildMockProposal();
    mockedFindById.mockResolvedValue(proposal);
    mockedProblemFindById.mockResolvedValue(buildMockProblem());

    const res = await request(app)
      .patch(`/api/proposals/${proposal._id.toString()}/reject`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
    expect(proposal.status).toBe('rejected');
  });

  it('forbids a developer from rejecting a proposal', async () => {
    const res = await request(app)
      .patch(`/api/proposals/${new Types.ObjectId().toString()}/reject`)
      .set('Authorization', `Bearer ${developerToken}`);

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/proposals/:id/withdraw', () => {
  it('allows the developer to withdraw their own pending proposal', async () => {
    const proposal = buildMockProposal();
    mockedFindById.mockResolvedValue(proposal);

    const res = await request(app)
      .patch(`/api/proposals/${proposal._id.toString()}/withdraw`)
      .set('Authorization', `Bearer ${developerToken}`);

    expect(res.status).toBe(200);
    expect(proposal.status).toBe('withdrawn');
  });

  it('forbids a different developer from withdrawing', async () => {
    const proposal = buildMockProposal();
    mockedFindById.mockResolvedValue(proposal);

    const res = await request(app)
      .patch(`/api/proposals/${proposal._id.toString()}/withdraw`)
      .set('Authorization', `Bearer ${otherDeveloperToken}`);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/proposals/:id', () => {
  it('allows the proposal owner (developer) to view it', async () => {
    const proposal = buildMockProposal();
    mockedFindById.mockResolvedValue(proposal);

    const res = await request(app)
      .get(`/api/proposals/${proposal._id.toString()}`)
      .set('Authorization', `Bearer ${developerToken}`);

    expect(res.status).toBe(200);
  });

  it("forbids a developer who doesn't own the proposal and isn't the problem owner", async () => {
    const proposal = buildMockProposal();
    mockedFindById.mockResolvedValue(proposal);

    const res = await request(app)
      .get(`/api/proposals/${proposal._id.toString()}`)
      .set('Authorization', `Bearer ${otherDeveloperToken}`);

    expect(res.status).toBe(403);
  });

  it('rejects a malformed id', async () => {
    const res = await request(app)
      .get('/api/proposals/not-a-valid-id')
      .set('Authorization', `Bearer ${developerToken}`);

    expect(res.status).toBe(400);
  });
});
