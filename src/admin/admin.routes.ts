import { Router } from 'express';
import { adminLogin } from './admin.controller.js';
import { adminAuth } from './adminauth.js';

export const AdminRouter = Router();

AdminRouter.post('/login', adminLogin);