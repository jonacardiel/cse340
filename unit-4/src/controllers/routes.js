import express from 'express';
import { showHome } from './index.js';

const router = express.Router();

router.get('/', showHome);

export default router;
