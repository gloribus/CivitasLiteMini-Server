const Router = require('express').Router;
const Controller = require('../Controllers/marafonPublic');
const router = new Router();

router.post('/idea', Controller.createIdea);
router.post('/participant', Controller.createParticipant);

router.get('/vk/:code', Controller.authVK);

module.exports = router;
