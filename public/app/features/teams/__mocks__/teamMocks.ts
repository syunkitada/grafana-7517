import { Team, TeamMember } from '../../../types';

export const getMultipleMockTeams = (numberOfTeams: number): Team[] => {
  let teams: Team[] = [];
  for (let i = 1; i <= numberOfTeams; i++) {
    teams.push({
      id: i,
      name: `test-${i}`,
      avatarUrl: 'some/url/',
      email: `test-${i}@test.com`,
      memberCount: i,
    });
  }

  return teams;
};

export const getMockTeam = (): Team => {
  return {
    id: 1,
    name: 'test',
    avatarUrl: 'some/url/',
    email: 'test@test.com',
    memberCount: 1,
  };
};

export const getMockTeamMembers = (amount: number): TeamMember[] => {
  let teamMembers: TeamMember[] = [];

  for (let i = 1; i <= amount; i++) {
    teamMembers.push({
      userId: i,
      teamId: 1,
      avatarUrl: 'some/url/',
      email: 'test@test.com',
      login: `testUser-${i}`,
    });
  }

  return teamMembers;
};

export const getMockTeamMember = (): TeamMember => {
  return {
    userId: 1,
    teamId: 1,
    avatarUrl: 'some/url/',
    email: 'test@test.com',
    login: 'testUser',
  };
};
