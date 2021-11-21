import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json('No authorization');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as jwt.JwtPayload;
    const { exp } = decoded as jwt.JwtPayload;
    if ((exp as number) * 1000 - Date.now() < 0) {
      return res.status(401).json('Your authorization has been expired. Relogin');
    }
    return next();
  } catch (e) {
    return res.status(401).json('No authorization');
  }
};
