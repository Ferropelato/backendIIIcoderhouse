const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');

class UserController {
  getAll = catchAsync(async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json({ status: 'success', payload: users });
  });

  getById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.uid);
    res.status(200).json({ status: 'success', payload: user });
  });

  register = catchAsync(async (req, res) => {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ status: 'success', payload: user });
  });

  login = catchAsync(async (req, res) => {
    const user = await userService.loginUser(req.body);
    res.status(200).json({ status: 'success', payload: user });
  });

  updateRole = catchAsync(async (req, res) => {
    const { role, requesterRole } = req.body;
    const user = await userService.changeUserRole(req.params.uid, requesterRole, role);
    res.status(200).json({ status: 'success', payload: user });
  });
}

module.exports = new UserController();
