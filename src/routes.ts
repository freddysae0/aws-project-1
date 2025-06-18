import { Router } from 'express';
import { getAll, post } from './controllers';

const router = Router();

router.get('/shifts', getAll);
router.post('/shifts', post);

export default router;
