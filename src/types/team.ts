import { User } from './user';

// Base team types
export interface Team {
  id: number;
  name: string;
  category: string;
  tenant_id: number;
  goals?: string;
  total_members: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  joined_at: string;
  is_active: boolean;
  role: TeamMemberRole;
  user?: User;
}

export interface TeamGame {
  id: number;
  team_id: number;
  name: string;
  played_on: string;
  played_against: string;
  result: GameResult;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamActivity {
  id: number;
  name: string;
  description?: string;
  team_id: number;
  created_at: string;
}

export interface TeamSchedule {
  id: number;
  team_id: number;
  name: string;
  type: ScheduleType;
  description?: string;
  scheduled_at: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Enum types
export type TeamMemberRole = 'captain' | 'co-captain' | 'member' | 'coach' | 'manager';
export type GameResult = 'win' | 'loss' | 'draw';
export type ScheduleType = 'game' | 'activity' | 'session';

// Request types
export interface CreateTeamRequest {
  name: string;
  category: string;
  tenant_id: number;
  goals?: string;
  members?: {
    user_id: number;
    role: TeamMemberRole;
  }[];
}

export interface UpdateTeamRequest {
  name?: string;
  category?: string;
  goals?: string;
}

export interface AddTeamMembersRequest {
  members: {
    user_id: number;
    role: TeamMemberRole;
  }[];
}

export interface UpdateTeamMemberRequest {
  role?: TeamMemberRole;
  is_active?: boolean;
}

export interface CreateTeamGameRequest {
  name: string;
  played_on: string;
  played_against: string;
  result: GameResult;
  description?: string;
}

export interface UpdateTeamGameRequest {
  name?: string;
  result?: GameResult;
  description?: string;
}

export interface CreateTeamActivityRequest {
  name: string;
  description?: string;
}

export interface CreateTeamScheduleRequest {
  name: string;
  type: ScheduleType;
  description?: string;
  scheduled_at: string;
  location?: string;
}

export interface CreateTeamSchedulesRequest {
  schedules: CreateTeamScheduleRequest[];
}

export interface UpdateTeamScheduleRequest {
  name?: string;
  scheduled_at?: string;
  location?: string;
  description?: string;
}

// Response types
export interface TeamWithDetails extends Team {
  members: TeamMemberWithUser[];
  recent_games: TeamGame[];
  upcoming_schedules: TeamSchedule[];
  recent_activities: TeamActivity[];
  wins?: number;
  losses?: number;
  draws?: number;
}

export interface TeamMemberWithUser extends TeamMember {
  user: User;
}

export interface TeamSummary extends Team {
  wins: number;
  losses: number;
  draws: number;
  captains_count: number;
  coaches_count: number;
}

export interface TeamGameStatistics {
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  win_percentage: number;
}

export interface TeamDashboard {
  team_summary: TeamSummary;
  upcoming_events: TeamSchedule[];
  recent_activities: TeamActivity[];
  recent_games: TeamGame[];
  team_roles: {
    captains: number;
    co_captains: number;
    coaches: number;
    members: number;
  };
}

export interface UserTeamOverview {
  team_id: number;
  team_name: string;
  team_category: string;
  my_role: TeamMemberRole;
  joined_at: string;
  total_members: number;
  wins: number;
  upcoming_events_count: number;
}

export interface UserTeamsSummary {
  teams: UserTeamOverview[];
  summary: {
    total_teams: number;
    captain_of: number;
    member_of: number;
    total_upcoming_events: number;
  };
}

export interface TenantTeamsAnalytics {
  overview: {
    total_teams: number;
    total_members: number;
    total_games: number;
    active_teams: number;
    categories: string[];
  };
  performance_stats: {
    overall_win_rate: number;
    total_wins: number;
    total_losses: number;
    total_draws: number;
  };
  category_breakdown: {
    category: string;
    teams_count: number;
    members_count: number;
    games_count: number;
    win_rate: number;
  }[];
  upcoming_events: {
    games: number;
    sessions: number;
    activities: number;
  };
  recent_activity_summary: {
    new_teams_this_month: number;
    new_members_this_month: number;
    games_played_this_month: number;
  };
}

// Query parameters
export interface TeamListQuery {
  page?: number;
  limit?: number;
  category?: string;
  tenant_id?: number;
  search?: string;
  sort_by?: 'name' | 'created_at' | 'total_members' | 'category';
  sort_order?: 'asc' | 'desc';
  include_inactive?: boolean;
}

export interface TeamGameQuery {
  page?: number;
  limit?: number;
  result?: GameResult;
  from_date?: string;
  to_date?: string;
  sort_by?: 'played_on' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface TeamActivityQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: 'created_at' | 'name';
  sort_order?: 'asc' | 'desc';
}

export interface TeamScheduleQuery {
  page?: number;
  limit?: number;
  type?: ScheduleType;
  upcoming?: boolean;
  from_date?: string;
  to_date?: string;
  sort_by?: 'scheduled_at' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface TeamSearchQuery {
  q?: string;
  category?: string;
  tenant_id?: number;
  has_members?: boolean;
  active_only?: boolean;
  page?: number;
  limit?: number;
}

// Utility functions for transforming data
export function transformTeam(data: any): Team {
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    tenant_id: data.tenantId || data.tenant_id,
    goals: data.goals,
    total_members: data.totalMembers || data.total_members,
    created_at: data.createdAt || data.created_at,
    updated_at: data.updatedAt || data.updated_at,
  };
}

export function transformTeamMember(data: any): TeamMember {
  const member: TeamMember = {
    id: data.id,
    team_id: data.teamId || data.team_id,
    user_id: data.userId || data.user_id,
    joined_at: data.joinedAt || data.joined_at,
    is_active: data.isActive !== undefined ? data.isActive : data.is_active,
    role: data.role as TeamMemberRole,
  };

  if (data.user) {
    member.user = transformUser(data.user);
  }

  return member;
}

export function transformTeamGame(data: any): TeamGame {
  return {
    id: data.id,
    team_id: data.teamId || data.team_id,
    name: data.name,
    played_on: data.playedOn || data.played_on,
    played_against: data.playedAgainst || data.played_against,
    result: data.result as GameResult,
    description: data.description,
    created_at: data.createdAt || data.created_at,
    updated_at: data.updatedAt || data.updated_at,
  };
}

export function transformTeamActivity(data: any): TeamActivity {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    team_id: data.teamId || data.team_id,
    created_at: data.createdAt || data.created_at,
  };
}

export function transformTeamSchedule(data: any): TeamSchedule {
  return {
    id: data.id,
    team_id: data.teamId || data.team_id,
    name: data.name,
    type: data.type as ScheduleType,
    description: data.description,
    scheduled_at: data.scheduledAt || data.scheduled_at,
    location: data.location,
    created_at: data.createdAt || data.created_at,
    updated_at: data.updatedAt || data.updated_at,
  };
}

// Helper function for user transformation (reuse from user types)
function transformUser(data: any): User {
  return {
    id: data.id,
    email: data.email,
    role: data.role,
    first_name: data.firstName || data.first_name,
    last_name: data.lastName || data.last_name,
    tenant_unique_id: data.tenantUniqueId || data.tenant_unique_id,
    date_of_birth: data.dateOfBirth || data.date_of_birth,
    age: data.age,
    height: data.height,
    weight: data.weight,
    emergency_contact_number: data.emergencyContactNumber || data.emergency_contact_number,
    emergency_contact_name: data.emergencyContactName || data.emergency_contact_name,
    phone: data.phone,
    created_at: data.createdAt || data.created_at,
    updated_at: data.updatedAt || data.updated_at,
  };
}

// Export all types
export * from './user';