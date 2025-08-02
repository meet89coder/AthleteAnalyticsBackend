import { PrismaClient } from '../generated/prisma';
import {
  Team,
  TeamMember,
  TeamGame,
  TeamActivity,
  TeamSchedule,
  TeamWithDetails,
  TeamSummary,
  TeamGameStatistics,
  TeamListQuery,
  TeamGameQuery,
  TeamActivityQuery,
  TeamScheduleQuery,
  transformTeam,
  transformTeamMember,
  transformTeamGame,
  transformTeamActivity,
  transformTeamSchedule,
} from '../types/team';
import { transformUser } from '../types/user';

export class TeamModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Team CRUD operations
  async createTeam(data: {
    name: string;
    category: string;
    tenantId: number;
    goals?: string | null;
  }): Promise<Team> {
    const createData: any = {
      name: data.name,
      category: data.category,
      tenantId: data.tenantId,
    };

    if (data.goals !== undefined) {
      createData.goals = data.goals;
    }

    const team = await this.prisma.team.create({
      data: createData,
    });

    return transformTeam(team);
  }

  async findTeamById(id: number): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    return team ? transformTeam(team) : null;
  }

  async findTeamByIdWithDetails(id: number): Promise<TeamWithDetails | null> {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          where: { isActive: true },
          include: {
            user: true,
          },
          orderBy: { joinedAt: 'asc' },
        },
        games: {
          orderBy: { playedOn: 'desc' },
          take: 5,
        },
        schedules: {
          where: {
            scheduledAt: {
              gte: new Date(),
            },
          },
          orderBy: { scheduledAt: 'asc' },
          take: 5,
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!team) return null;

    // Calculate game statistics
    const gameStats = await this.getTeamGameStatistics(id);

    return {
      ...transformTeam(team),
      members: team.members.map(member => ({
        ...transformTeamMember(member),
        user: transformUser(member.user),
      })),
      recent_games: team.games.map(game => transformTeamGame(game)),
      upcoming_schedules: team.schedules.map(schedule => transformTeamSchedule(schedule)),
      recent_activities: team.activities.map(activity => transformTeamActivity(activity)),
      wins: gameStats.wins,
      losses: gameStats.losses,
      draws: gameStats.draws,
    };
  }

  async findTeamsWithSummary(query: TeamListQuery): Promise<{
    teams: TeamSummary[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 20,
      category,
      tenant_id,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
      include_inactive = false,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (tenant_id) {
      where.tenantId = tenant_id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[sort_by === 'created_at' ? 'createdAt' : sort_by] = sort_order;

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        include: {
          members: {
            where: include_inactive ? {} : { isActive: true },
          },
          games: true,
          _count: {
            select: {
              members: {
                where: { isActive: true },
              },
              games: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.team.count({ where }),
    ]);

    const teamsWithStats = teams.map(team => {
      const wins = team.games.filter(game => game.result === 'win').length;
      const losses = team.games.filter(game => game.result === 'loss').length;
      const draws = team.games.filter(game => game.result === 'draw').length;
      const captains_count = team.members.filter(member => member.role === 'captain').length;
      const coaches_count = team.members.filter(member => member.role === 'coach').length;

      return {
        ...transformTeam(team),
        wins,
        losses,
        draws,
        captains_count,
        coaches_count,
      };
    });

    return { teams: teamsWithStats, total };
  }

  async updateTeam(id: number, data: Partial<{
    name: string;
    category: string;
    goals: string;
  }>): Promise<Team> {
    const team = await this.prisma.team.update({
      where: { id },
      data,
    });

    return transformTeam(team);
  }

  async deleteTeam(id: number): Promise<void> {
    await this.prisma.team.delete({
      where: { id },
    });
  }

  // Team Member operations
  async addTeamMembers(teamId: number, members: {
    userId: number;
    role: string;
  }[]): Promise<TeamMember[]> {
    const createdMembers = await this.prisma.$transaction(
      members.map(member =>
        this.prisma.teamMember.create({
          data: {
            teamId,
            userId: member.userId,
            role: member.role,
          },
          include: {
            user: true,
          },
        })
      )
    );

    return createdMembers.map(member => ({
      ...transformTeamMember(member),
      user: transformUser(member.user),
    }));
  }

  async updateTeamMember(id: number, data: {
    role?: string;
    isActive?: boolean;
  }): Promise<TeamMember> {
    const member = await this.prisma.teamMember.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });

    return {
      ...transformTeamMember(member),
      user: transformUser(member.user),
    };
  }

  async removeTeamMember(id: number): Promise<void> {
    await this.prisma.teamMember.delete({
      where: { id },
    });
  }

  async findTeamMember(teamId: number, userId: number): Promise<TeamMember | null> {
    const member = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      include: {
        user: true,
      },
    });

    return member ? {
      ...transformTeamMember(member),
      user: transformUser(member.user),
    } : null;
  }

  // Team Game operations
  async createTeamGame(data: {
    teamId: number;
    name: string;
    playedOn: Date;
    playedAgainst: string;
    result: string;
    description?: string;
  }): Promise<TeamGame> {
    const game = await this.prisma.teamGame.create({
      data,
    });

    return transformTeamGame(game);
  }

  async findTeamGames(teamId: number, query: TeamGameQuery): Promise<{
    games: TeamGame[];
    statistics: TeamGameStatistics;
    total: number;
  }> {
    const {
      page = 1,
      limit = 20,
      result,
      from_date,
      to_date,
      sort_by = 'played_on',
      sort_order = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = { teamId };

    if (result) {
      where.result = result;
    }

    if (from_date || to_date) {
      where.playedOn = {};
      if (from_date) {
        where.playedOn.gte = new Date(from_date);
      }
      if (to_date) {
        where.playedOn.lte = new Date(to_date);
      }
    }

    const orderBy: any = {};
    orderBy[sort_by === 'played_on' ? 'playedOn' : 'createdAt'] = sort_order;

    const [games, total, statistics] = await Promise.all([
      this.prisma.teamGame.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.teamGame.count({ where }),
      this.getTeamGameStatistics(teamId),
    ]);

    return {
      games: games.map(game => transformTeamGame(game)),
      statistics,
      total,
    };
  }

  async getTeamGameStatistics(teamId: number): Promise<TeamGameStatistics> {
    const games = await this.prisma.teamGame.findMany({
      where: { teamId },
      select: { result: true },
    });

    const total_games = games.length;
    const wins = games.filter(game => game.result === 'win').length;
    const losses = games.filter(game => game.result === 'loss').length;
    const draws = games.filter(game => game.result === 'draw').length;
    const win_percentage = total_games > 0 ? (wins / total_games) * 100 : 0;

    return {
      total_games,
      wins,
      losses,
      draws,
      win_percentage: Math.round(win_percentage * 100) / 100,
    };
  }

  async updateTeamGame(id: number, data: Partial<{
    name: string;
    result: string;
    description: string;
  }>): Promise<TeamGame> {
    const game = await this.prisma.teamGame.update({
      where: { id },
      data,
    });

    return transformTeamGame(game);
  }

  async deleteTeamGame(id: number): Promise<void> {
    await this.prisma.teamGame.delete({
      where: { id },
    });
  }

  // Team Activity operations
  async createTeamActivity(data: {
    name: string;
    description?: string;
    teamId: number;
  }): Promise<TeamActivity> {
    const activity = await this.prisma.teamActivity.create({
      data,
    });

    return transformTeamActivity(activity);
  }

  async findTeamActivities(teamId: number, query: TeamActivityQuery): Promise<{
    activities: TeamActivity[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = { teamId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[sort_by === 'created_at' ? 'createdAt' : 'name'] = sort_order;

    const [activities, total] = await Promise.all([
      this.prisma.teamActivity.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.teamActivity.count({ where }),
    ]);

    return {
      activities: activities.map(activity => transformTeamActivity(activity)),
      total,
    };
  }

  // Team Schedule operations
  async createTeamSchedules(schedules: {
    teamId: number;
    name: string;
    type: string;
    description?: string;
    scheduledAt: Date;
    location?: string;
  }[]): Promise<TeamSchedule[]> {
    const createdSchedules = await this.prisma.$transaction(
      schedules.map(schedule =>
        this.prisma.teamSchedule.create({
          data: schedule,
        })
      )
    );

    return createdSchedules.map(schedule => transformTeamSchedule(schedule));
  }

  async findTeamSchedules(teamId: number, query: TeamScheduleQuery): Promise<{
    schedules: TeamSchedule[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 20,
      type,
      upcoming = false,
      from_date,
      to_date,
      sort_by = 'scheduled_at',
      sort_order = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = { teamId };

    if (type) {
      where.type = type;
    }

    if (upcoming) {
      where.scheduledAt = {
        gte: new Date(),
      };
    } else if (from_date || to_date) {
      where.scheduledAt = {};
      if (from_date) {
        where.scheduledAt.gte = new Date(from_date);
      }
      if (to_date) {
        where.scheduledAt.lte = new Date(to_date);
      }
    }

    const orderBy: any = {};
    orderBy[sort_by === 'scheduled_at' ? 'scheduledAt' : 'createdAt'] = sort_order;

    const [schedules, total] = await Promise.all([
      this.prisma.teamSchedule.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.teamSchedule.count({ where }),
    ]);

    return {
      schedules: schedules.map(schedule => transformTeamSchedule(schedule)),
      total,
    };
  }

  async updateTeamSchedule(id: number, data: Partial<{
    name: string;
    scheduledAt: Date;
    location: string;
    description: string;
  }>): Promise<TeamSchedule> {
    const schedule = await this.prisma.teamSchedule.update({
      where: { id },
      data,
    });

    return transformTeamSchedule(schedule);
  }

  async deleteTeamSchedule(id: number): Promise<void> {
    await this.prisma.teamSchedule.delete({
      where: { id },
    });
  }

  // Analytics and Dashboard operations
  async getUserTeams(userId: number): Promise<any[]> {
    const userTeams = await this.prisma.teamMember.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        team: {
          include: {
            games: true,
            schedules: {
              where: {
                scheduledAt: {
                  gte: new Date(),
                },
              },
            },
          },
        },
      },
    });

    return userTeams.map(membership => {
      const team = membership.team;
      const wins = team.games.filter(game => game.result === 'win').length;
      const upcomingEventsCount = team.schedules.length;

      return {
        team_id: team.id,
        team_name: team.name,
        team_category: team.category,
        my_role: membership.role,
        joined_at: membership.joinedAt,
        total_members: team.totalMembers,
        wins,
        upcoming_events_count: upcomingEventsCount,
      };
    });
  }

  async getTenantTeamsAnalytics(tenantId: number): Promise<any> {
    const [teams, totalMembers, totalGames] = await Promise.all([
      this.prisma.team.findMany({
        where: { tenantId },
        include: {
          members: {
            where: { isActive: true },
          },
          games: true,
          schedules: {
            where: {
              scheduledAt: {
                gte: new Date(),
              },
            },
          },
        },
      }),
      this.prisma.teamMember.count({
        where: {
          isActive: true,
          team: { tenantId },
        },
      }),
      this.prisma.teamGame.count({
        where: {
          team: { tenantId },
        },
      }),
    ]);

    const totalTeams = teams.length;
    const activeTeams = teams.filter(team => team.members.length > 0).length;
    const categories = [...new Set(teams.map(team => team.category))];

    // Performance stats
    const allGames = teams.flatMap(team => team.games);
    const totalWins = allGames.filter(game => game.result === 'win').length;
    const totalLosses = allGames.filter(game => game.result === 'loss').length;
    const totalDraws = allGames.filter(game => game.result === 'draw').length;
    const overallWinRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

    // Category breakdown
    const categoryBreakdown = categories.map(category => {
      const categoryTeams = teams.filter(team => team.category === category);
      const categoryGames = categoryTeams.flatMap(team => team.games);
      const categoryMembers = categoryTeams.reduce((sum, team) => sum + team.members.length, 0);
      const categoryWins = categoryGames.filter(game => game.result === 'win').length;
      const categoryWinRate = categoryGames.length > 0 ? (categoryWins / categoryGames.length) * 100 : 0;

      return {
        category,
        teams_count: categoryTeams.length,
        members_count: categoryMembers,
        games_count: categoryGames.length,
        win_rate: Math.round(categoryWinRate * 100) / 100,
      };
    });

    // Upcoming events
    const allSchedules = teams.flatMap(team => team.schedules);
    const upcomingGames = allSchedules.filter(schedule => schedule.type === 'game').length;
    const upcomingSessions = allSchedules.filter(schedule => schedule.type === 'session').length;
    const upcomingActivities = allSchedules.filter(schedule => schedule.type === 'activity').length;

    return {
      overview: {
        total_teams: totalTeams,
        total_members: totalMembers,
        total_games: totalGames,
        active_teams: activeTeams,
        categories,
      },
      performance_stats: {
        overall_win_rate: Math.round(overallWinRate * 100) / 100,
        total_wins: totalWins,
        total_losses: totalLosses,
        total_draws: totalDraws,
      },
      category_breakdown: categoryBreakdown,
      upcoming_events: {
        games: upcomingGames,
        sessions: upcomingSessions,
        activities: upcomingActivities,
      },
    };
  }

  // Cleanup
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}