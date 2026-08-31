import {Router} from 'express';

const historyRoute = Router();

historyRoute.get('/', (req, res) => res.json({message: 'LIST HISTORY'}));

export default historyRoute;