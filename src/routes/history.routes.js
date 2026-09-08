import {Router} from 'express';
import { getHistory } from '../controllers/history.controller';

const historyRoute = Router();

historyRoute.get('/', getHistory);

export default historyRoute;