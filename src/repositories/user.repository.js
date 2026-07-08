const UserModel = require('../models/user.model');

class UserRepository {
  async getAll() {
    return UserModel.find().select('-password -__v');
  }

  async getById(id) {
    return UserModel.findById(id).select('-password -__v');
  }

  async getByEmail(email) {
    return UserModel.findOne({ email });
  }

  async create(userData) {
    return UserModel.create(userData);
  }

  async createMany(usersData) {
    return UserModel.insertMany(usersData);
  }

  async updateById(id, updates) {
    return UserModel.findByIdAndUpdate(id, updates, { new: true }).select('-password -__v');
  }

  async deleteById(id) {
    return UserModel.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
