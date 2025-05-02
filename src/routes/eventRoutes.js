import { Router } from 'express';
import * as EventController from '../controllers/eventController.js';
import { verifyAuth } from '../middleware/authMiddleware.js'; 


const router = Router();

router.get('/events', EventController.getEvents);
router.get('/events/:id', EventController.getEvent);
router.get('/events/users/:id', verifyAuth, EventController.getEventByIdForUserId); 
router.get('/events/prices/:id', EventController.getPriceEventById);
router.post('/events', EventController.createEvent);
router.put('/events/:id', EventController.uploadImage, EventController.updateEvent);
router.put('/events/:id/status', EventController.updateEventStatusController);
router.delete('/events/:id', EventController.deleteEvent);

export default router;
