import { Router } from "express";

const authRoute = Router();

authRoute.post('/login', (req, res) => res.json({message: 'LOGIN USER'}));
authRoute.post('/logout', (req, res) => res.json({message: 'LOGOUT USER'}));

export default authRoute;