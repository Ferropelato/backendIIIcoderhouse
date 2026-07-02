const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { ROLES } = require('../constants');

class UserService {
  async getAllUsers() {
    return userRepository.getAll();
  }

  async getUserById(id) {
    const user = await userRepository.getById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async registerUser({ firstName, lastName, email, password, role }) {
    const existing = await userRepository.getByEmail(email);
    if (existing) {
      throw new Error(`Ya existe un usuario registrado con el email ${email}`);
    }

    if (role && !Object.values(ROLES).includes(role)) {
      throw new Error(`Rol invalido: ${role}`);
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
      throw new Error('Credenciales invalidas');
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciales invalidas');
    }

    return this.toPublicUser(user);
  }

  async changeUserRole(id, requesterRole, newRole) {
    if (requesterRole !== ROLES.ADMIN) {
      throw new Error('No tenes permisos para modificar roles');
    }

    if (!Object.values(ROLES).includes(newRole)) {
      throw new Error(`Rol invalido: ${newRole}`);
    }

    const user = await userRepository.updateById(id, { role: newRole });
    if (!user) {
      throw new Error('Usuario no encontrado');
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
