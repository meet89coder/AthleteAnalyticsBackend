import { UserService } from '@/services/user';
import { UserModel } from '@/models/user';
import { AppError } from '@/middleware/errorHandler';
import * as passwordUtils from '@/utils/password';
import { userFixtures } from '@/tests/helpers/fixtures';

jest.mock('@/models/user');
jest.mock('@/utils/password');

const MockedUserModel = UserModel as jest.MockedClass<typeof UserModel>;
const mockedPasswordUtils = passwordUtils as jest.Mocked<typeof passwordUtils>;

describe('UserService', () => {
  let userService: UserService;
  let mockUserModel: jest.Mocked<UserModel>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserModel = new MockedUserModel() as jest.Mocked<UserModel>;
    userService = new UserService();
    (userService as any).userModel = mockUserModel;
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = userFixtures.validUser;
      const hashedPassword = 'hashed-password';
      const createdUser = { id: 1, ...userData, password_hash: hashedPassword };

      mockUserModel.findByEmail.mockResolvedValue(null);
      mockedPasswordUtils.hashPassword.mockResolvedValue(hashedPassword);
      mockUserModel.create.mockResolvedValue(createdUser as any);

      const result = await userService.createUser(userData);

      expect(mockUserModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockedPasswordUtils.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...userData,
        password_hash: hashedPassword,
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw error if email already exists', async () => {
      const userData = userFixtures.validUser;
      const existingUser = { id: 1, email: userData.email };

      mockUserModel.findByEmail.mockResolvedValue(existingUser as any);

      await expect(userService.createUser(userData)).rejects.toThrow(AppError);
      await expect(userService.createUser(userData)).rejects.toThrow('Email already exists');

      expect(mockUserModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockedPasswordUtils.hashPassword).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    it('should handle password hashing failure', async () => {
      const userData = userFixtures.validUser;

      mockUserModel.findByEmail.mockResolvedValue(null);
      mockedPasswordUtils.hashPassword.mockRejectedValue(new Error('Hashing failed'));

      await expect(userService.createUser(userData)).rejects.toThrow('Hashing failed');

      expect(mockUserModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockedPasswordUtils.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const userId = 1;
      const user = { id: userId, email: 'test@example.com' };

      mockUserModel.findById.mockResolvedValue(user as any);

      const result = await userService.getUserById(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });

    it('should throw error if user not found', async () => {
      const userId = 999;

      mockUserModel.findById.mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(AppError);
      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const updateData = userFixtures.updateUserData;
      const existingUser = { id: userId, email: 'test@example.com' };
      const updatedUser = { ...existingUser, ...updateData };

      mockUserModel.findById.mockResolvedValue(existingUser as any);
      mockUserModel.update.mockResolvedValue(updatedUser as any);

      const result = await userService.updateUser(userId, updateData);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUserModel.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should throw error if user not found', async () => {
      const userId = 999;
      const updateData = userFixtures.updateUserData;

      mockUserModel.findById.mockResolvedValue(null);

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(AppError);
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow('User not found');

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    it('should throw error if update fails', async () => {
      const userId = 1;
      const updateData = userFixtures.updateUserData;
      const existingUser = { id: userId, email: 'test@example.com' };

      mockUserModel.findById.mockResolvedValue(existingUser as any);
      mockUserModel.update.mockResolvedValue(null);

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(AppError);
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow('Failed to update user');

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUserModel.update).toHaveBeenCalledWith(userId, updateData);
    });
  });

  describe('changePassword', () => {
    it('should allow admin to change any user\'s password', async () => {
      const userId = 2;
      const newPassword = 'NewPassword123!';
      const requestingUserId = 1;
      const requestingUserRole = 'admin';
      const hashedPassword = 'new-hashed-password';
      const existingUser = { id: userId, email: 'user@example.com' };

      mockUserModel.findById.mockResolvedValue(existingUser as any);
      mockedPasswordUtils.hashPassword.mockResolvedValue(hashedPassword);
      mockUserModel.updatePassword.mockResolvedValue(true);

      await userService.changePassword(
        userId,
        undefined,
        newPassword,
        requestingUserId,
        requestingUserRole as any
      );

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockedPasswordUtils.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(mockUserModel.updatePassword).toHaveBeenCalledWith(userId, hashedPassword);
    });

    it('should allow user to change their own password with correct current password', async () => {
      const userId = 2;
      const currentPassword = 'CurrentPass123!';
      const newPassword = 'NewPassword123!';
      const requestingUserId = 2;
      const requestingUserRole = 'user';
      const hashedPassword = 'new-hashed-password';
      const existingUser = { id: userId, email: 'user@example.com' };
      const userWithPassword = { ...existingUser, password_hash: 'old-hashed-password' };

      mockUserModel.findById.mockResolvedValue(existingUser as any);
      mockUserModel.findByEmail.mockResolvedValue(userWithPassword as any);
      mockedPasswordUtils.comparePassword.mockResolvedValue(true);
      mockedPasswordUtils.hashPassword.mockResolvedValue(hashedPassword);
      mockUserModel.updatePassword.mockResolvedValue(true);

      await userService.changePassword(
        userId,
        currentPassword,
        newPassword,
        requestingUserId,
        requestingUserRole as any
      );

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockedPasswordUtils.comparePassword).toHaveBeenCalledWith(currentPassword, userWithPassword.password_hash);
      expect(mockedPasswordUtils.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(mockUserModel.updatePassword).toHaveBeenCalledWith(userId, hashedPassword);
    });

    it('should deny user changing another user\'s password', async () => {
      const userId = 2;
      const newPassword = 'NewPassword123!';
      const requestingUserId = 3;
      const requestingUserRole = 'user';
      const existingUser = { id: userId, email: 'user@example.com' };

      mockUserModel.findById.mockResolvedValue(existingUser as any);

      await expect(userService.changePassword(
        userId,
        undefined,
        newPassword,
        requestingUserId,
        requestingUserRole as any
      )).rejects.toThrow(AppError);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockedPasswordUtils.hashPassword).not.toHaveBeenCalled();
      expect(mockUserModel.updatePassword).not.toHaveBeenCalled();
    });

    it('should deny password change with incorrect current password', async () => {
      const userId = 2;
      const currentPassword = 'WrongPassword';
      const newPassword = 'NewPassword123!';
      const requestingUserId = 2;
      const requestingUserRole = 'user';
      const existingUser = { id: userId, email: 'user@example.com' };
      const userWithPassword = { ...existingUser, password_hash: 'old-hashed-password' };

      mockUserModel.findById.mockResolvedValue(existingUser as any);
      mockUserModel.findByEmail.mockResolvedValue(userWithPassword as any);
      mockedPasswordUtils.comparePassword.mockResolvedValue(false);

      await expect(userService.changePassword(
        userId,
        currentPassword,
        newPassword,
        requestingUserId,
        requestingUserRole as any
      )).rejects.toThrow(AppError);
      await expect(userService.changePassword(
        userId,
        currentPassword,
        newPassword,
        requestingUserId,
        requestingUserRole as any
      )).rejects.toThrow('Current password is incorrect');

      expect(mockedPasswordUtils.comparePassword).toHaveBeenCalledWith(currentPassword, userWithPassword.password_hash);
      expect(mockedPasswordUtils.hashPassword).not.toHaveBeenCalled();
      expect(mockUserModel.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 1;
      const existingUser = { id: userId, email: 'test@example.com' };

      mockUserModel.findById.mockResolvedValue(existingUser as any);
      mockUserModel.delete.mockResolvedValue(true);

      await userService.deleteUser(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUserModel.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      const userId = 999;

      mockUserModel.findById.mockResolvedValue(null);

      await expect(userService.deleteUser(userId)).rejects.toThrow(AppError);
      await expect(userService.deleteUser(userId)).rejects.toThrow('User not found');

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUserModel.delete).not.toHaveBeenCalled();
    });
  });
});