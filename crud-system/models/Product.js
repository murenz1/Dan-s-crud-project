const { pool } = require('../config/db');

class Product {
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding product by ID:', error.message);
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM products');
      return rows;
    } catch (error) {
      console.error('Error finding all products:', error.message);
      throw error;
    }
  }

  static async create(productData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
        [productData.name, productData.description, productData.price]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating product:', error.message);
      throw error;
    }
  }

  static async update(id, productData) {
    try {
      const [result] = await pool.execute(
        'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?',
        [productData.name, productData.description, productData.price, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product:', error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting product:', error.message);
      throw error;
    }
  }

  static async search(query) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE name LIKE ?',
        [`%${query}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error searching products:', error.message);
      throw error;
    }
  }
}

module.exports = Product;