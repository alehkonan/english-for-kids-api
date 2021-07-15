import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import { pool } from '../database';
import { jwtSecret } from '../config';

const router = Router();

router.post(
  '/register',
  [
    check('email', 'Incorrect email').isEmail(),
    check('password', 'Incorrect password').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect registration data',
        });
      }
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);
      const query = 'INSERT INTO public.users(email, password) VALUES($1, $2)';
      const values = [email, hashedPassword];
      await pool.query(query, values);
      return res.send('User created');
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },
);

router.post(
  '/login',
  [
    check('email', 'Incorrect email').normalizeEmail().isEmail(),
    check('password', 'Enter password').exists(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect email or password',
        });
      }
      const { email, password } = req.body;
      const query = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
      if (!query.rowCount) {
        return res.status(400).json({ message: 'No such user' });
      }
      const user = query.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }
      const token = jwt.sign(
        { userId: user.user_id },
        jwtSecret,
        { expiresIn: '24h' },
      );
      return res.status(201).json({ token });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },
);

export default router;
