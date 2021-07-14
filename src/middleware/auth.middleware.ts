import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';
import { IGetUserAuthInfoRequest } from '../customTypes/interfaces';

export const auth = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json('No authorization');
    }
    const decoded = jwt.verify(token, jwtSecret) as string;
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json('No authorization');
  }
};
