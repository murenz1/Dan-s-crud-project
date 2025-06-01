const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by username:', error.message);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, role FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error.message);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const [result] = await pool.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [userData.username, hashedPassword, userData.role]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, role FROM users'
      );
      return rows;
    } catch (error) {
      console.error('Error finding all users:', error.message);
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      let query = 'UPDATE users SET ';
      const params = [];
      const updates = [];

      if (userData.username) {
        updates.push('username = ?');
        params.push(userData.username);
      }

      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        updates.push('password = ?');
        params.push(hashedPassword);
      }

      if (userData.role) {
        updates.push('role = ?');
        params.push(userData.role);
      }

      if (updates.length === 0) {
        return false;
      }

      query += updates.join(', ') + ' WHERE id = ?';
      params.push(id);

      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error.message);
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;