import adminOrderService from "../services/admin.orderService.js";

const getAllOrders = async (_req, res) => {
  try {
    const orders = await adminOrderService.getAllOrders();
    return res.status(200).json({ errCode: 0, message: "OK", data: orders });
  } catch (error) {
    return res
      .status(500)
      .json({
        errCode: 1,
        message: "Error getting orders",
        error: error.message,
      });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await adminOrderService.getOrderById(id);
    if (!order)
      return res.status(404).json({ errCode: 1, message: "Order not found" });
    return res.status(200).json({ errCode: 0, message: "OK", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({
        errCode: 1,
        message: "Error getting order",
        error: error.message,
      });
  }
};

const createOrder = async (req, res) => {
  try {
    const order = await adminOrderService.createOrder(req.body);
    return res
      .status(201)
      .json({ errCode: 0, message: "Created", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({ errCode: 1, message: error.message || "Error creating order" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status)
      return res
        .status(400)
        .json({ errCode: 1, message: "status is required" });
    const order = await adminOrderService.updateOrderStatus(id, status);
    if (!order)
      return res.status(404).json({ errCode: 1, message: "Order not found" });
    return res
      .status(200)
      .json({ errCode: 0, message: "Updated", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({
        errCode: 1,
        message: "Error updating status",
        error: error.message,
      });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await adminOrderService.cancelOrder(id);
    if (!order)
      return res.status(404).json({ errCode: 1, message: "Order not found" });
    return res
      .status(200)
      .json({ errCode: 0, message: "Cancelled", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({
        errCode: 1,
        message: "Error cancelling order",
        error: error.message,
      });
  }
};

export default {
  getAllOrders,
  getOrderById,
  createOrder,
  updateStatus,
  cancelOrder,
};
