import orderService from "../services/orderService.js";

const list = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await orderService.listOrders(userId);
    return res.status(200).json({ errCode: 0, message: "OK", data: orders });
  } catch (error) {
    return res
      .status(500)
      .json({
        errCode: 1,
        message: "Error listing orders",
        error: error.message,
      });
  }
};

const detail = async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    const order = await orderService.getOrderDetail(orderId, userId);
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

const createFromCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const order = await orderService.createOrderFromCart(userId, req.body);
    return res
      .status(201)
      .json({ errCode: 0, message: "Created", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({ errCode: 1, message: error.message || "Error creating order" });
  }
};

const cancel = async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    const order = await orderService.cancelOrder(orderId, userId);
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

export default { list, detail, createFromCart, cancel };
