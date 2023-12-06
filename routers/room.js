const {Router} = require('express');

const roomController = require('../controllers/room.js');
const {validate , startMeetingValidator , joinMeetingValidator , endMeetingValidator} = require('../hooks/validationHandler');


const router = Router();

router.post('/create' , startMeetingValidator() , validate , roomController.getCreateRoomLink);
router.post('/join' , joinMeetingValidator() , validate , roomController.getJoinRoomLink);
router.post('/end' , endMeetingValidator() , validate , roomController.getEndRoomLink);
router.post('/find-server' , roomController.findServer);



module.exports = router;