import { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team';
import { ApiResponse } from '../types/api';
import { AppError } from '../middleware/errorHandler';

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  // Teams CRUD
  createTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      if (!reqUser) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const result = await this.teamService.createTeam(req.body);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Team created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teamId = parseInt(req.params.id!);
      const team = await this.teamService.getTeamById(teamId);

      const response: ApiResponse = {
        success: true,
        data: team,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getTeamComplete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teamId = parseInt(req.params.id!);
      const team = await this.teamService.getTeamWithDetails(teamId);

      const response: ApiResponse = {
        success: true,
        data: team,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getTeamsList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.teamService.getTeamsList(req.query as any);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  updateTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to update this team', 403, 'FORBIDDEN');
      }

      const team = await this.teamService.updateTeam(teamId, req.body);

      const response: ApiResponse = {
        success: true,
        data: team,
        message: 'Team updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);

      // Only admins can delete teams
      if (reqUser.role !== 'admin') {
        throw new AppError('Only admins can delete teams', 403, 'FORBIDDEN');
      }

      await this.teamService.deleteTeam(teamId);

      const response: ApiResponse = {
        success: true,
        message: 'Team deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Team Members
  addTeamMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to add members to this team', 403, 'FORBIDDEN');
      }

      const result = await this.teamService.addTeamMembers(teamId, req.body);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Team members added successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);
      const memberId = parseInt(req.params.member_id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to update team members', 403, 'FORBIDDEN');
      }

      const member = await this.teamService.updateTeamMember(teamId, memberId, req.body);

      const response: ApiResponse = {
        success: true,
        data: member,
        message: 'Team member updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  removeTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);
      const memberId = parseInt(req.params.member_id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to remove team members', 403, 'FORBIDDEN');
      }

      const result = await this.teamService.removeTeamMember(teamId, memberId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Team member removed successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Team Games
  addTeamGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to add games for this team', 403, 'FORBIDDEN');
      }

      const game = await this.teamService.addTeamGame(teamId, req.body);

      const response: ApiResponse = {
        success: true,
        data: game,
        message: 'Game result added successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTeamGames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teamId = parseInt(req.params.id!);
      const result = await this.teamService.getTeamGames(teamId, req.query as any);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  updateTeamGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);
      const gameId = parseInt(req.params.game_id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to update games for this team', 403, 'FORBIDDEN');
      }

      const game = await this.teamService.updateTeamGame(teamId, gameId, req.body);

      const response: ApiResponse = {
        success: true,
        data: game,
        message: 'Game updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteTeamGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);
      const gameId = parseInt(req.params.game_id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to delete games for this team', 403, 'FORBIDDEN');
      }

      await this.teamService.deleteTeamGame(teamId, gameId);

      const response: ApiResponse = {
        success: true,
        message: 'Game deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Team Activities
  addTeamActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to add activities for this team', 403, 'FORBIDDEN');
      }

      const activity = await this.teamService.addTeamActivity(teamId, req.body);

      const response: ApiResponse = {
        success: true,
        data: activity,
        message: 'Team activity added successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTeamActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teamId = parseInt(req.params.id!);
      const result = await this.teamService.getTeamActivities(teamId, req.query as any);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Team Schedules
  addTeamSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to add schedules for this team', 403, 'FORBIDDEN');
      }

      const result = await this.teamService.addTeamSchedules(teamId, req.body);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Team schedules added successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTeamSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teamId = parseInt(req.params.id!);
      const result = await this.teamService.getTeamSchedules(teamId, req.query as any);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  updateTeamSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);
      const scheduleId = parseInt(req.params.schedule_id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to update schedules for this team', 403, 'FORBIDDEN');
      }

      const schedule = await this.teamService.updateTeamSchedule(teamId, scheduleId, req.body);

      const response: ApiResponse = {
        success: true,
        data: schedule,
        message: 'Team schedule updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteTeamSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);
      const scheduleId = parseInt(req.params.schedule_id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      if (!permission.hasPermission && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to delete schedules for this team', 403, 'FORBIDDEN');
      }

      await this.teamService.deleteTeamSchedule(teamId, scheduleId);

      const response: ApiResponse = {
        success: true,
        message: 'Team schedule deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Dashboard and Analytics
  getTeamDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);

      // Check if user is a team member
      const permission = await this.teamService.checkTeamPermission(teamId, reqUser.id);

      if (!permission.isMember && reqUser.role !== 'admin') {
        throw new AppError('You do not have permission to view this team dashboard', 403, 'FORBIDDEN');
      }

      const dashboard = await this.teamService.getTeamDashboard(teamId);

      const response: ApiResponse = {
        success: true,
        data: dashboard,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getUserTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const userId = parseInt(req.params.user_id!);

      // Users can only view their own teams unless they're admin
      if (reqUser.id !== userId && reqUser.role !== 'admin') {
        throw new AppError('You can only view your own teams', 403, 'FORBIDDEN');
      }

      const result = await this.teamService.getUserTeamsOverview(userId);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getTenantTeamsAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const tenantId = parseInt(req.params.tenant_id!);

      // Check if user has access to this tenant's data
      if (reqUser.role !== 'admin') {
        throw new AppError('Only admins can view tenant analytics', 403, 'FORBIDDEN');
      }

      const analytics = await this.teamService.getTenantTeamsAnalytics(tenantId);

      const response: ApiResponse = {
        success: true,
        data: analytics,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  searchTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.teamService.searchTeams(req.query as any);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Utility endpoints for UI
  getTeamCreationData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Mock data for team creation - in real implementation, fetch from database
      const response: ApiResponse = {
        success: true,
        data: {
          available_categories: ['Football', 'Basketball', 'Cricket', 'Tennis', 'Swimming', 'Athletics'],
          suggested_roles: ['captain', 'co-captain', 'member', 'coach', 'manager'],
          tenant_info: {
            // This would be fetched based on user's tenant
            id: 1,
            name: 'Sample Organization',
            active_teams_count: 8,
          },
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getTeamEditData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = (req as any).user;
      const teamId = parseInt(req.params.id!);

      // Check permissions
      const permission = await this.teamService.checkTeamPermission(
        teamId,
        reqUser.id,
        ['captain', 'coach']
      );

      const team = await this.teamService.getTeamWithDetails(teamId);

      const response: ApiResponse = {
        success: true,
        data: {
          team: {
            id: team.id,
            name: team.name,
            category: team.category,
            goals: team.goals,
          },
          current_members: team.members,
          permissions: {
            can_edit_team: permission.hasPermission || reqUser.role === 'admin',
            can_manage_members: permission.hasPermission || reqUser.role === 'admin',
            can_add_games: permission.hasPermission || reqUser.role === 'admin',
            can_schedule_events: permission.hasPermission || reqUser.role === 'admin',
          },
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}