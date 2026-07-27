const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { ROLES } = require('../constants');
const {
  UserNotFoundError,
  DuplicateResourceError,
  InvalidRoleError,
  InvalidCredentialsError,
  ForbiddenRoleActionError,
} = require('../errors');

class UserService {
  async getAllUsers() {
    return userRepository.getAll();
  }

  async getUserById(id) {
    const user = await userRepository.getById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user;
  }

  async registerUser({ firstName, lastName, email, password, role }) {
    const existing = await userRepository.getByEmail(email);
    if (existing) {
      throw new DuplicateResourceError(`Ya existe un usuario registrado con el email ${email}`, { email });
    }

    if (role && !Object.values(ROLES).includes(role)) {
      throw new InvalidRoleError(role);
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || ROLES.USER,
    });

    return this.toPublicUser(user);
  }

  async loginUser({ email, password }) {
    const user = await userRepository.getByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    return this.toPublicUser(user);
  }

  async changeUserRole(id, requesterRole, newRole) {
    if (requesterRole !== ROLES.ADMIN) {
      throw new ForbiddenRoleActionError('No tenes permisos para modificar roles');
    }

    if (!Object.values(ROLES).includes(newRole)) {
      throw new InvalidRoleError(newRole);
    }

    const user = await userRepository.updateById(id, { role: newRole });
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user;
  }

  toPublicUser(user) {
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }
}

module.exports = new UserService();
