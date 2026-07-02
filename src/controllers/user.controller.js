const userService = require('../services/user.service');

class UserController {
  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.uid);
      res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async register(req, res) {
    try {
      const user = await userService.registerUser(req.body);
      res.status(201).json({ status: 'success', payload: user });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async login(req, res) {
    try {
      const user = await userService.loginUser(req.body);
      res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
      res.status(401).json({ status: 'error', message: error.message });
    }
  }

  async updateRole(req, res) {
    try {
      const { role, requesterRole } = req.body;
      const user = await userService.changeUserRole(req.params.uid, requesterRole, role);
      res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new UserController();
