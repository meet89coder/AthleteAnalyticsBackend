import { TeamModel } from '../models/team';
import {
  Team,
  TeamMember,
  TeamGame,
  TeamActivity,
  TeamSchedule,
  TeamWithDetails,
  TeamSummary,
  TeamGameStatistics,
  TeamDashboard,
  UserTeamsSummary,
  TenantTeamsAnalytics,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMembersRequest,
  UpdateTeamMemberRequest,
  CreateTeamGameRequest,
  UpdateTeamGameRequest,
  CreateTeamActivityRequest,
  CreateTeamSchedulesRequest,
  UpdateTeamScheduleRequest,
  TeamListQuery,
  TeamGameQuery,
  TeamActivityQuery,
  TeamScheduleQuery,
  TeamSearchQuery,
} from '../types/team';
import { AppError } from '../middleware/errorHandler';

export class TeamService {
  private teamModel: TeamModel;

  constructor() {
    this.teamModel = new TeamModel();
  }

  // Team CRUD operations
  async createTeam(data: CreateTeamRequest): Promise<{
    team: Team;
    members?: TeamMember[];
  }> {
    try {
      // Create the team
      const team = await this.teamModel.createTeam({
        name: data.name,
        category: data.category,
        tenantId: data.tenant_id,
        goals: data.goals || null,
      });

      let members: TeamMember[] = [];

      // Add initial members if provided
      if (data.members && data.members.length > 0) {
        // Validate that user IDs are unique
        const userIds = data.members.map(member => member.user_id);
        const uniqueUserIds = new Set(userIds);
        if (userIds.length !== uniqueUserIds.size) {
          throw new AppError('Duplicate user IDs found in members list', 400, 'DUPLICATE_MEMBERS');
        }

        members = await this.teamModel.addTeamMembers(
          team.id,
          data.members.map(member => ({
            userId: member.user_id,
            role: member.role,
          }))
        );
      }

      return { team, members };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create team', 500, 'TEAM_CREATION_FAILED');
    }
  }

  async getTeamById(id: number): Promise<Team> {
    const team = await this.teamModel.findTeamById(id);
    if (!team) {
      throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
    }
    return team;
  }

  async getTeamWithDetails(id: number): Promise<TeamWithDetails> {
    const team = await this.teamModel.findTeamByIdWithDetails(id);
    if (!team) {
      throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
    }
    return team;
  }

  async getTeamsList(query: TeamListQuery): Promise<{
    teams: TeamSummary[];
    pagination: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const { teams, total } = await this.teamModel.findTeamsWithSummary(query);
    
    const page = query.page || 1;
    const limit = query.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      teams,
      pagination: {
        current_page: page,
        per_page: limit,
        total_pages: totalPages,
        total_count: total,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async updateTeam(id: number, data: UpdateTeamRequest): Promise<Team> {
    // Verify team exists
    await this.getTeamById(id);

    try {
      return await this.teamModel.updateTeam(id, data);
    } catch (error) {
      throw new AppError('Failed to update team', 500, 'TEAM_UPDATE_FAILED');
    }
  }

  async deleteTeam(id: number): Promise<void> {
    // Verify team exists
    await this.getTeamById(id);

    try {
      await this.teamModel.deleteTeam(id);
    } catch (error) {
      throw new AppError('Failed to delete team', 500, 'TEAM_DELETE_FAILED');
    }
  }

  // Team Members operations
  async addTeamMembers(teamId: number, data: AddTeamMembersRequest): Promise<{
    added_members: TeamMember[];
    team_total_members: number;
  }> {
    // Verify team exists
    await this.getTeamById(teamId);

    // Validate that user IDs are unique
    const userIds = data.members.map(member => member.user_id);
    const uniqueUserIds = new Set(userIds);
    if (userIds.length !== uniqueUserIds.size) {
      throw new AppError('Duplicate user IDs found in members list', 400, 'DUPLICATE_MEMBERS');
    }

    // Check if any users are already members
    for (const member of data.members) {
      const existingMember = await this.teamModel.findTeamMember(teamId, member.user_id);
      if (existingMember) {
        throw new AppError(`User ${member.user_id} is already a member of this team`, 409, 'MEMBER_ALREADY_EXISTS');
      }
    }

    try {
      const addedMembers = await this.teamModel.addTeamMembers(
        teamId,
        data.members.map(member => ({
          userId: member.user_id,
          role: member.role,
        }))
      );

      // Get updated team to return total members count
      const updatedTeam = await this.teamModel.findTeamById(teamId);

      return {
        added_members: addedMembers,
        team_total_members: updatedTeam!.total_members,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to add team members', 500, 'ADD_MEMBERS_FAILED');
    }
  }

  async updateTeamMember(teamId: number, memberId: number, data: UpdateTeamMemberRequest): Promise<TeamMember> {
    // Verify team exists
    await this.getTeamById(teamId);

    try {
      return await this.teamModel.updateTeamMember(memberId, data);
    } catch (error) {
      throw new AppError('Failed to update team member', 500, 'UPDATE_MEMBER_FAILED');
    }
  }

  async removeTeamMember(teamId: number, memberId: number): Promise<{
    team_total_members: number;
  }> {
    // Verify team exists
    await this.getTeamById(teamId);

    try {
      await this.teamModel.removeTeamMember(memberId);

      // Get updated team to return total members count
      const updatedTeam = await this.teamModel.findTeamById(teamId);

      return {
        team_total_members: updatedTeam!.total_members,
      };
    } catch (error) {
      throw new AppError('Failed to remove team member', 500, 'REMOVE_MEMBER_FAILED');
    }
  }

  // Team Games operations
  async addTeamGame(teamId: number, data: CreateTeamGameRequest): Promise<TeamGame> {
    // Verify team exists
    await this.getTeamById(teamId);

    try {
      const gameData: any = {
        teamId,
        name: data.name,
        playedOn: new Date(data.played_on),
        playedAgainst: data.played_against,
        result: data.result,
      };

      if (data.description) {
        gameData.description = data.description;
      }

      return await this.teamModel.createTeamGame(gameData);
    } catch (error) {
      throw new AppError('Failed to add team game', 500, 'ADD_GAME_FAILED');
    }
  }

  async getTeamGames(teamId: number, query: TeamGameQuery): Promise<{
    games: TeamGame[];
    statistics: TeamGameStatistics;
    pagination: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    // Verify team exists
    await this.getTeamById(teamId);

    const { games, statistics, total } = await this.teamModel.findTeamGames(teamId, query);
    
    const page = query.page || 1;
    const limit = query.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      games,
      statistics,
      pagination: {
        current_page: page,
        per_page: limit,
        total_pages: totalPages,
        total_count: total,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async updateTeamGame(teamId: number, gameId: number, data: UpdateTeamGameRequest): Promise<TeamGame> {
    // Verify team exists
    await this.getTeamById(teamId);

    try {
      return await this.teamModel.updateTeamGame(gameId, data);
    } catch (error) {
      throw new AppError('Failed to update team game', 500, 'UPDATE_GAME_FAILED');
    }
  }

  async deleteTeamGame(teamId: number, gameId: number): Promise<void> {
    // Verify team exists
    await this.getTeamById(teamId);

    try {
      await this.teamModel.deleteTeamGame(gameId);
    } catch (error) {
      throw new AppError('Failed to delete team game', 500, 'DELETE_GAME_FAILED');
    }
  }

  // Team Activities operations
  async addTeamActivity(teamId: number, data: CreateTeamActivityRequest): Promise<TeamActivity> {
    // Verify team exists
    await this.getTeamById(teamId);

    try {
      const activityData: any = {
        name: data.name,
        teamId,
      };

      if (data.description) {
        activityData.description = data.description;
      }

      return await this.teamModel.createTeamActivity(activityData);
    } catch (error) {
      throw new AppError('Failed to add team activity', 500, 'ADD_ACTIVITY_FAILED');
    }
  }

  async getTeamActivities(teamId: number, query: TeamActivityQuery): Promise<{
    activities: TeamActivity[];
    pagination: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    // Verify team exists
    await this.getTeamById(teamId);

    const { activities, total } = await this.teamModel.findTeamActivities(teamId, query);
    
    const page = query.page || 1;
    const limit = query.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      activities,
      pagination: {
        current_page: page,
        per_page: limit,
        total_pages: totalPages,
        total_count: total,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  // Team Schedules operations
  async addTeamSchedules(teamId: number, data: CreateTeamSchedulesRequest): Promise<{
    added_schedules: TeamSchedule[];
  }> {
    // Verify team exists
    await this.getTeamById(teamId);

    try {
      const schedules = await this.teamModel.createTeamSchedules(
        data.schedules.map(schedule => {
          const scheduleData: any = {
            teamId,
            name: schedule.name,
            type: schedule.type,
            scheduledAt: new Date(schedule.scheduled_at),
          };

          if (schedule.description) {
            scheduleData.description = schedule.description;
          }

          if (schedule.location) {
            scheduleData.location = schedule.location;
          }

          return scheduleData;
        })
      );

      return { added_schedules: schedules };
    } catch (error) {
      throw new AppError('Failed to add team schedules', 500, 'ADD_SCHEDULES_FAILED');
    }
  }

  async getTeamSchedules(teamId: number, query: TeamScheduleQuery): Promise<{
    schedules: TeamSchedule[];
    pagination: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    // Verify team exists
    await this.getTeamById(teamId);

    const { schedules, total } = await this.teamModel.findTeamSchedules(teamId, query);
    
    const page = query.page || 1;
    const limit = query.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      schedules,
      pagination: {
        current_page: page,
        per_page: limit,
        total_pages: totalPages,
        total_count: total,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async updateTeamSchedule(teamId: number, scheduleId: number, data: UpdateTeamScheduleRequest): Promise<TeamSchedule> {
    // Verify team exists
    await this.getTeamById(teamId);

    const updateData: any = { ...data };
    if (data.scheduled_at) {
      updateData.scheduledAt = new Date(data.scheduled_at);
      delete updateData.scheduled_at;
    }

    try {
      return await this.teamModel.updateTeamSchedule(scheduleId, updateData);
    } catch (error) {
      throw new AppError('Failed to update team schedule', 500, 'UPDATE_SCHEDULE_FAILED');
    }
  }

  async deleteTeamSchedule(teamId: number, scheduleId: number): Promise<void> {
    // Verify team exists
    await this.getTeamById(teamId);

    try {
      await this.teamModel.deleteTeamSchedule(scheduleId);
    } catch (error) {
      throw new AppError('Failed to delete team schedule', 500, 'DELETE_SCHEDULE_FAILED');
    }
  }

  // Dashboard and Analytics
  async getTeamDashboard(teamId: number): Promise<TeamDashboard> {
    const teamWithDetails = await this.getTeamWithDetails(teamId);
    
    // Calculate team role counts
    const teamRoles = {
      captains: teamWithDetails.members.filter(member => member.role === 'captain').length,
      co_captains: teamWithDetails.members.filter(member => member.role === 'co-captain').length,
      coaches: teamWithDetails.members.filter(member => member.role === 'coach').length,
      members: teamWithDetails.members.filter(member => member.role === 'member').length,
    };

    const teamSummary: TeamSummary = {
      ...teamWithDetails,
      wins: teamWithDetails.wins || 0,
      losses: teamWithDetails.losses || 0,
      draws: teamWithDetails.draws || 0,
      captains_count: teamRoles.captains,
      coaches_count: teamRoles.coaches,
    };

    return {
      team_summary: teamSummary,
      upcoming_events: teamWithDetails.upcoming_schedules,
      recent_activities: teamWithDetails.recent_activities,
      recent_games: teamWithDetails.recent_games,
      team_roles: teamRoles,
    };
  }

  async getUserTeamsOverview(userId: number): Promise<UserTeamsSummary> {
    const userTeams = await this.teamModel.getUserTeams(userId);
    
    const summary = {
      total_teams: userTeams.length,
      captain_of: userTeams.filter(team => team.my_role === 'captain').length,
      member_of: userTeams.filter(team => team.my_role === 'member').length,
      total_upcoming_events: userTeams.reduce((sum, team) => sum + team.upcoming_events_count, 0),
    };

    return {
      teams: userTeams,
      summary,
    };
  }

  async getTenantTeamsAnalytics(tenantId: number): Promise<TenantTeamsAnalytics> {
    return await this.teamModel.getTenantTeamsAnalytics(tenantId);
  }

  // Search teams
  async searchTeams(query: TeamSearchQuery): Promise<{
    teams: TeamSummary[];
    filters: {
      available_categories: string[];
      member_count_ranges: string[];
    };
    pagination: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const teamListQuery: TeamListQuery = {};
    
    if (query.page) teamListQuery.page = query.page;
    if (query.limit) teamListQuery.limit = query.limit;
    if (query.q) teamListQuery.search = query.q;
    if (query.category) teamListQuery.category = query.category;
    if (query.tenant_id) teamListQuery.tenant_id = query.tenant_id;
    if (query.active_only !== undefined) teamListQuery.include_inactive = !query.active_only;

    const result = await this.getTeamsList(teamListQuery);

    // Mock filters - in a real implementation, these would come from the database
    const filters = {
      available_categories: ['Football', 'Basketball', 'Cricket', 'Tennis'],
      member_count_ranges: ['1-10', '11-20', '21+'],
    };

    return {
      teams: result.teams,
      filters,
      pagination: result.pagination,
    };
  }

  // Helper method to check if user has permission to manage team
  async checkTeamPermission(teamId: number, userId: number, requiredRoles: string[] = []): Promise<{
    isMember: boolean;
    role?: string;
    hasPermission: boolean;
  }> {
    const member = await this.teamModel.findTeamMember(teamId, userId);
    
    if (!member || !member.is_active) {
      return { isMember: false, hasPermission: false };
    }

    const hasPermission = requiredRoles.length === 0 || requiredRoles.includes(member.role);

    return {
      isMember: true,
      role: member.role,
      hasPermission,
    };
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.teamModel.disconnect();
  }
}