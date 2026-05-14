import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import EmailService from './emailService.js';

export class UsuarioService {
  static async normalizarRolIds(roles = []) {
    const valores = Array.isArray(roles) ? roles : [roles];
    const rolIds = [];

    for (const valor of valores) {
      if (valor === undefined || valor === null || valor === '') continue;

      if (typeof valor === 'number' || /^\d+$/.test(String(valor))) {
        rolIds.push(Number(valor));
        continue;
      }

      const nombres = String(valor)
        .split(',')
        .map((rol) => rol.trim())
        .filter(Boolean);

      for (const nombre of nombres) {
        const [rows] = await pool.query(
          'SELECT id FROM rol WHERE UPPER(nombre) = UPPER(?) LIMIT 1',
          [nombre]
        );

        if (rows.length === 0) {
          throw new Error(`Rol no encontrado: ${nombre}`);
        }

        rolIds.push(rows[0].id);
      }
    }

    return [...new Set(rolIds)];
  }

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
      // Obtener hash de contraseña por ID directamente (no exponer en getUsuarioById)
      const [rows] = await pool.query('SELECT password_hash FROM usuario WHERE id = ?', [id]);
      const usuario = rows[0];
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

  // Genera token de recuperación, lo guarda y envía el email
  static async generarTokenRecuperacion(email) {
    try {
      const usuario = await this.getUsuarioByEmail(email);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      const insertQuery = `
        INSERT INTO password_reset_tokens (usuario_id, token, expires_at, used, created_at)
        VALUES (?, ?, ?, false, NOW())
      `;
      await pool.query(insertQuery, [usuario.id, token, expiresAt]);

      // Enviar email
      await EmailService.sendPasswordResetEmail(usuario.email, token);

      return true;
    } catch (error) {
      logger.error('Error generando token de recuperación:', error);
      throw error;
    }
  }

  static async verificarTokenReset(token) {
    try {
      const [rows] = await pool.query(
        'SELECT id, usuario_id, expires_at, used FROM password_reset_tokens WHERE token = ? LIMIT 1',
        [token]
      );
      const row = rows[0];
      if (!row) return null;
      if (row.used) return null;
      const expiresAt = new Date(row.expires_at);
      if (expiresAt < new Date()) return null;
      return row;
    } catch (error) {
      logger.error('Error verificando token de reset:', error);
      throw error;
    }
  }

  static async resetPasswordWithToken(token, nuevaPassword) {
    try {
      const tokenRow = await this.verificarTokenReset(token);
      if (!tokenRow) {
        throw new Error('Token inválido o expirado');
      }

      const passwordHash = await bcrypt.hash(nuevaPassword, 10);
      await pool.query('UPDATE usuario SET password_hash = ? WHERE id = ?', [passwordHash, tokenRow.usuario_id]);
      await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = ?', [tokenRow.id]);

      return true;
    } catch (error) {
      logger.error('Error reseteando password con token:', error);
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
      const rolesNormalizados = await this.normalizarRolIds(rolIds);

      for (const rolId of rolesNormalizados) {
        const query = 'INSERT IGNORE INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)';
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
