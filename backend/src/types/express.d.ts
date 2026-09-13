import { IUserDocument } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
