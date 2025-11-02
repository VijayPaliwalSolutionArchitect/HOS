const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  getOrders,
  updateOrderToDelivered,
} = require('../controllers/orderController');

// Routes
router.route('/').post(createOrder).get(getOrders);
router.route('/:id').get(getOrderById);
router.route('/:id/pay').put(updateOrderToPaid);
router.route('/:id/deliver').put(updateOrderToDelivered);

module.exports = router;
