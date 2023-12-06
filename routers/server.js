const {Router} = require('express');

const serverController = require('../controllers/server.js');
const {validate , createServerValidator , editServerValidator , fetchOneServerValidator} = require('../hooks/validationHandler');

const router = Router();

router.post('/get-all' , serverController.fetchAll);

router.post('/create' , createServerValidator()  , validate , serverController.createServer);
router.post('/edit' , editServerValidator()  , validate , serverController.editServer);
router.post('/get' , fetchOneServerValidator() , validate , serverController.getServer);
router.post('/delete' , fetchOneServerValidator() , validate , serverController.deleteServer);
router.post('/recover' , fetchOneServerValidator() , validate , serverController.recoverServer);



module.exports = router;