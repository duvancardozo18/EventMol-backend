import { Router } from 'express';
import * as LocationController from '../controllers/locationController.js';

const router = Router();

router.get('/locations', LocationController.getLocations);
router.get('/locations/:id', LocationController.getLocation);
router.post('/locations', LocationController.createLocation);
router.put('/locations/:id', LocationController.updateLocation);
router.delete('/locations/:id', LocationController.deleteLocation);

export default router;
