import { Request } from 'express';

export interface IWordWithCategory {
  id: number
  en: string
  ru: string
  image: string
  audio: string
  category: string
}

export interface IGetUserAuthInfoRequest extends Request {
  user: string
}
