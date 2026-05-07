import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export class UsuarioService {
  static async getAllUsuarios() {
    try {
      const query = `
        SELECT u.id, u.nombre, u.email, u.activo, GROUP_CONCAT(r.nombre) as roles
        FROM usuario u
        LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
        LEFT JOIN rol r ON ur.rol_id = r.id
        GROUP BY u.id
        ORDER BY u.nombre
      `;
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      logger.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  static async getUsuarioById(id) {
    try {
      const query = `
        SELECT u.id, u.nombre, u.email, u.activo, GROUP_CONCAT(r.nombre) as roles
        FROM usuario u
        LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
        LEFT JOIN rol r ON ur.rol_id = r.id
        WHERE u.id = ?
        GROUP BY u.id
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener usuario ${id}:`, error);
      throw error;
    }
  }

  static async getUsuarioByEmail(email) {
    try {
      const query = `
        SELECT u.id, u.nombre, u.email, u.activo, u.password_hash
        FROM usuario u
        WHERE u.email = ?
      `;
      const [rows] = await pool.query(query, [email]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener usuario por email ${email}:`, error);
      throw error;
    }
  }

  static async createUsuario(data) {
    try {
      const passwordHash = await bcrypt.hash(data.password, 10);
      const query = `
        INSERT INTO usuario (nombre, email, password_hash, activo)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [
        data.nombre,
        data.email,
        passwordHash,
        data.activo !== false ? true : false
      ]);
      
      if (data.roles && data.roles.length > 0) {
        await this.asignarRoles(result.insertId, data.roles);
      }

      return { id: result.insertId, nombre: data.nombre, email: data.email };
    } catch (error) {
      logger.error('Error al crear usuario:', error);
      throw error;
    }
  }

  static async updateUsuario(id, data) {
    try {
      const query = `
        UPDATE usuario
        SET nombre = ?, email = ?, activo = ?
        WHERE id = ?
      `;
      await pool.query(query, [
        data.nombre,
        data.email,
        data.activo,
        id
      ]);

      if (data.roles) {
        await this.removerRoles(id);
        await this.asignarRoles(id, data.roles);
      }

      return await this.getUsuarioById(id);
    } catch (error) {
      logger.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  }

  static async cambiarPassword(id, passwordActual, passwordNueva) {
    try {
      const usuario = await this.getUsuarioByEmail(id);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      const esValida = await bcrypt.compare(passwordActual, usuario.password_hash);
      if (!esValida) {
        throw new Error('Contraseña actual incorrecta');
      }

      const passwordHash = await bcrypt.hash(passwordNueva, 10);
      const query = 'UPDATE usuario SET password_hash = ? WHERE id = ?';
      await pool.query(query, [passwordHash, id]);

      return true;
    } catch (error) {
      logger.error(`Error al cambiar password del usuario ${id}:`, error);
      throw error;
    }
  }

  static async deleteUsuario(id) {
    try {
      await this.removerRoles(id);
      const query = 'DELETE FROM usuario WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar usuario ${id}:`, error);
      throw error;
    }
  }

  static async asignarRoles(usuarioId, rolIds) {
    try {
      for (const rolId of rolIds) {
        const query = 'INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)';
        await pool.query(query, [usuarioId, rolId]);
      }
      return true;
    } catch (error) {
      logger.error(`Error al asignar roles al usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  static async removerRoles(usuarioId) {
    try {
      const query = 'DELETE FROM usuario_rol WHERE usuario_id = ?';
      await pool.query(query, [usuarioId]);
      return true;
    } catch (error) {
      logger.error(`Error al remover roles del usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  static async autenticar(email, password) {
    try {
      const usuario = await this.getUsuarioByEmail(email);
      if (!usuario || !usuario.activo) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      const esValida = await bcrypt.compare(password, usuario.password_hash);
      if (!esValida) {
        throw new Error('Contraseña incorrecta');
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return {
        usuario: await this.getUsuarioById(usuario.id),
        token
      };
    } catch (error) {
      logger.error(`Error al autenticar usuario ${email}:`, error);
      throw error;
    }
  }

  static async verificarToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      return decoded;
    } catch (error) {
      logger.error('Error al verificar token:', error);
      throw error;
    }
  }

  static async desactivarUsuario(id) {
    try {
      const query = 'UPDATE usuario SET activo = false WHERE id = ?';
      await pool.query(query, [id]);
      return await this.getUsuarioById(id);
    } catch (error) {
      logger.error(`Error al desactivar usuario ${id}:`, error);
      throw error;
    }
  }

  static async activarUsuario(id) {
    try {
      const query = 'UPDATE usuario SET activo = true WHERE id = ?';
      await pool.query(query, [id]);
      return await this.getUsuarioById(id);
    } catch (error) {
      logger.error(`Error al activar usuario ${id}:`, error);
      throw error;
    }
  }
}
