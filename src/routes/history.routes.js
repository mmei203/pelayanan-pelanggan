import {Router} from 'express';
import { getHistory } from '../controllers/history.controller.js';

const historyRoute = Router();

historyRoute.get('/', getHistory);

export default historyRoute;