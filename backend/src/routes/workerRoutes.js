const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  toggleWorkerStatus
} = require('../controllers/workerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getWorkers)
  .post(createWorker);

router.route('/:id')
  .get(getWorkerById)
  .put(updateWorker);

router.route('/:id/status')
  .patch(toggleWorkerStatus);

module.exports = router;

