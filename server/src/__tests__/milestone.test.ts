import request from 'supertest';
import { Types } from 'mongoose';
import { createApp } from '../app';
import { Project } from '../models/Project';
import { Milestone } from '../models/Milestone';
import { signAccessToken } from '../utils/jwt';

jest.mock('../models/Project', () => {
  const actual = jest.requireActual('../models/Project');
  return {
    ...actual,
    Project: {
      findById: jest.fn(),
    },
  };
});

jest.mock('../models/Milestone', () => {
  const actual = jest.requireActual('../models/Milestone');
  return {
    ...actual,
    Milestone: {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn(),
    },
  };
});

const mockedProjectFindById = Project.findById as jest.Mock;
const mockedMilestoneCreate = Milestone.create as jest.Mock;
const mockedMilestoneFind = Milestone.find as jest.Mock;
const mockedMilestoneFindById = Milestone.findById as jest.Mock;
const mockedMilestoneCountDocuments = Milestone.countDocuments as jest.Mock;

const app = createApp();

const BUSINESS_ID = new Types.ObjectId().toString();
const DEVELOPER_ID = new Types.ObjectId().toString();
const OUTSIDER_ID = new Types.ObjectId().toString();
const PROJECT_ID = new Types.ObjectId().toString();
const MILESTONE_ID = new Types.ObjectId().toString();

const businessToken = signAccessToken({ sub: BUSINESS_ID, role: 'business' });
const developerToken = signAccessToken({ sub: DEVELOPER_ID, role: 'developer' });
const outsiderToken = signAccessToken({ sub: OUTSIDER_ID, role: 'developer' });

function buildMockProject(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(PROJECT_ID),
    business: new Types.ObjectId(BUSINESS_ID),
    developer: new Types.ObjectId(DEVELOPER_ID),
    status: 'active',
    ...overrides,
  };
}

function buildMockMilestone(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(MILESTONE_ID),
    project: new Types.ObjectId(PROJECT_ID),
    title: 'UI Design',
    amount: 200,
    status: 'pending',
    order: 0,
    save: jest.fn().mockResolvedValue(undefined),
    deleteOne: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => {
  mockedMilestoneCountDocuments.mockResolvedValue(0);
});

describe('POST /api/projects/:projectId/milestones', () => {
  it('allows the owning business to create a milestone', async () => {
    mockedProjectFindById.mockResolvedValue(buildMockProject());
    mockedMilestoneCreate.mockResolvedValue(buildMockMilestone());

    const res = await request(app)
      .post(`/api/projects/${PROJECT_ID}/milestones`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ title: 'UI Design', amount: 200 });

    expect(res.status).toBe(201);
    expect(mockedMilestoneCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'UI Design', amount: 200 })
    );
  });

  it('blocks a developer from creating a milestone', async () => {
    const res = await request(app)
      .post(`/api/projects/${PROJECT_ID}/milestones`)
      .set('Authorization', `Bearer ${developerToken}`)
      .send({ title: 'UI Design', amount: 200 });

    expect(res.status).toBe(403);
    expect(mockedMilestoneCreate).not.toHaveBeenCalled();
  });
});

describe('GET /api/projects/:projectId/milestones', () => {
  it('lets the assigned developer see the project milestones', async () => {
    mockedProjectFindById.mockResolvedValue(buildMockProject());
    mockedMilestoneFind.mockReturnValue({
      sort: jest.fn().mockResolvedValue([buildMockMilestone()]),
    });

    const res = await request(app)
      .get(`/api/projects/${PROJECT_ID}/milestones`)
      .set('Authorization', `Bearer ${developerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.milestones).toHaveLength(1);
  });

  it('blocks a user with no relationship to the project', async () => {
    mockedProjectFindById.mockResolvedValue(buildMockProject());

    const res = await request(app)
      .get(`/api/projects/${PROJECT_ID}/milestones`)
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/milestones/:id — status transitions', () => {
  it('lets the developer submit a milestone that is in progress', async () => {
    mockedMilestoneFindById.mockResolvedValue(buildMockMilestone({ status: 'in_progress' }));
    mockedProjectFindById.mockResolvedValue(buildMockProject());

    const res = await request(app)
      .patch(`/api/milestones/${MILESTONE_ID}`)
      .set('Authorization', `Bearer ${developerToken}`)
      .send({ status: 'submitted' });

    expect(res.status).toBe(200);
  });

  it('lets the business approve a submitted milestone', async () => {
    mockedMilestoneFindById.mockResolvedValue(buildMockMilestone({ status: 'submitted' }));
    mockedProjectFindById.mockResolvedValue(buildMockProject());

    const res = await request(app)
      .patch(`/api/milestones/${MILESTONE_ID}`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
  });

  it('lets the business reject a submitted milestone', async () => {
    mockedMilestoneFindById.mockResolvedValue(buildMockMilestone({ status: 'submitted' }));
    mockedProjectFindById.mockResolvedValue(buildMockProject());

    const res = await request(app)
      .patch(`/api/milestones/${MILESTONE_ID}`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(200);
  });

  it('blocks the business from approving a milestone that has not been submitted', async () => {
    mockedMilestoneFindById.mockResolvedValue(buildMockMilestone({ status: 'pending' }));
    mockedProjectFindById.mockResolvedValue(buildMockProject());

    const res = await request(app)
      .patch(`/api/milestones/${MILESTONE_ID}`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(400);
  });

  it('blocks a user with no relationship to the project from updating it', async () => {
    mockedMilestoneFindById.mockResolvedValue(buildMockMilestone({ status: 'submitted' }));
    mockedProjectFindById.mockResolvedValue(buildMockProject());

    const res = await request(app)
      .patch(`/api/milestones/${MILESTONE_ID}`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/milestones/:id', () => {
  it('lets the owning business delete a non-approved milestone', async () => {
    mockedMilestoneFindById.mockResolvedValue(buildMockMilestone({ status: 'pending' }));
    mockedProjectFindById.mockResolvedValue(buildMockProject());

    const res = await request(app)
      .delete(`/api/milestones/${MILESTONE_ID}`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.status).toBe(200);
  });
});
