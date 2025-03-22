import express from 'express';
import { 
  registerParticipant, 
  getParticipants,
  getParticipantsByEvent, 
  updateParticipant, 
  deleteParticipant 
} from '../controllers/participantsController.js';

const router = express.Router();

router.post('/participants/register', registerParticipant);
router.get('/participants/list', getParticipants);
router.get('/participants/event/:event_id', getParticipantsByEvent);
router.put('/participants/update/:user_id', updateParticipant);
router.delete('/participants/delete/:user_id', deleteParticipant);


export default router;
