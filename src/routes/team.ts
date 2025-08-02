import { Router } from 'express';
import { TeamController } from '../controllers/team';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMembersSchema,
  updateTeamMemberSchema,
  createTeamGameSchema,
  updateTeamGameSchema,
  createTeamActivitySchema,
  createTeamSchedulesSchema,
  updateTeamScheduleSchema,
  teamListQuerySchema,
  teamGameQuerySchema,
  teamActivityQuerySchema,
  teamScheduleQuerySchema,
  teamSearchQuerySchema,
  teamIdSchema,
  memberIdSchema,
  gameIdSchema,
  scheduleIdSchema,
} from '../validations/team';

const router = Router();
const teamController = new TeamController();

// All team routes require authentication
router.use(authenticate);

// Teams CRUD
router.post(
  '/',
  validate(createTeamSchema),
  teamController.createTeam
);

router.get(
  '/',
  validateQuery(teamListQuerySchema),
  teamController.getTeamsList
);

router.get(
  '/search',
  validateQuery(teamSearchQuerySchema),
  teamController.searchTeams
);

router.get(
  '/creation-data',
  teamController.getTeamCreationData
);

router.get(
  '/:id',
  validateParams(teamIdSchema),
  teamController.getTeam
);

router.get(
  '/:id/complete',
  validateParams(teamIdSchema),
  teamController.getTeamComplete
);

router.get(
  '/:id/edit-data',
  validateParams(teamIdSchema),
  teamController.getTeamEditData
);

router.put(
  '/:id',
  validateParams(teamIdSchema),
  validate(updateTeamSchema),
  teamController.updateTeam
);

router.delete(
  '/:id',
  validateParams(teamIdSchema),
  teamController.deleteTeam
);

// Team Members
router.post(
  '/:id/members',
  validateParams(teamIdSchema),
  validate(addTeamMembersSchema),
  teamController.addTeamMembers
);

router.patch(
  '/:id/members/:member_id',
  validateParams(memberIdSchema),
  validate(updateTeamMemberSchema),
  teamController.updateTeamMember
);

router.delete(
  '/:id/members/:member_id',
  validateParams(memberIdSchema),
  teamController.removeTeamMember
);

// Team Games
router.post(
  '/:id/games',
  validateParams(teamIdSchema),
  validate(createTeamGameSchema),
  teamController.addTeamGame
);

router.get(
  '/:id/games',
  validateParams(teamIdSchema),
  validateQuery(teamGameQuerySchema),
  teamController.getTeamGames
);

router.put(
  '/:id/games/:game_id',
  validateParams(gameIdSchema),
  validate(updateTeamGameSchema),
  teamController.updateTeamGame
);

router.delete(
  '/:id/games/:game_id',
  validateParams(gameIdSchema),
  teamController.deleteTeamGame
);

// Team Activities
router.post(
  '/:id/activities',
  validateParams(teamIdSchema),
  validate(createTeamActivitySchema),
  teamController.addTeamActivity
);

router.get(
  '/:id/activities',
  validateParams(teamIdSchema),
  validateQuery(teamActivityQuerySchema),
  teamController.getTeamActivities
);

// Team Schedules
router.post(
  '/:id/schedules',
  validateParams(teamIdSchema),
  validate(createTeamSchedulesSchema),
  teamController.addTeamSchedules
);

router.get(
  '/:id/schedules',
  validateParams(teamIdSchema),
  validateQuery(teamScheduleQuerySchema),
  teamController.getTeamSchedules
);

router.put(
  '/:id/schedules/:schedule_id',
  validateParams(scheduleIdSchema),
  validate(updateTeamScheduleSchema),
  teamController.updateTeamSchedule
);

router.delete(
  '/:id/schedules/:schedule_id',
  validateParams(scheduleIdSchema),
  teamController.deleteTeamSchedule
);

// Dashboard and Analytics
router.get(
  '/:id/dashboard',
  validateParams(teamIdSchema),
  teamController.getTeamDashboard
);

export default router;