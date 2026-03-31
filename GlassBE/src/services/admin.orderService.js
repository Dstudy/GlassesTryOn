import models from "../models/index.js";
import { sequelize } from "../models/index.js";

const { Order, OrderItem, User, ProductVariation, Product } = models;

export const getAllOrders = async () => {
  const orders = await Order.findAll({
    include: [
      { model: User, attributes: ["id", "email", "fullname", "phonenumber"] },
      {
        model: OrderItem,
        include: [{ model: ProductVariation, include: [Product] }],
      },
    ],
    order: [["id", "DESC"]],
  });

  // Add number of items to each order
  const ordersWithItemCount = orders.map((order) => {
    const orderData = order.toJSON();
    orderData.item_count = order.OrderItems ? order.OrderItems.length : 0;
    orderData.total_quantity = order.OrderItems
      ? order.OrderItems.reduce((sum, item) => sum + item.quantity, 0)
      : 0;
    return orderData;
  });

  return ordersWithItemCount;
};

export const getOrderById = async (id) => {
  const order = await Order.findByPk(id, {
    include: [
      { model: User, attributes: ["id", "email", "fullname", "phonenumber"] },
      {
        model: OrderItem,
        include: [{ model: ProductVariation, include: [Product] }],
      },
    ],
  });
  return order;
};

export const createOrder = async (payload) => {
  const t = await sequelize.transaction();
  try {
    const { user_id, items = [], ...fields } = payload;
    if (!user_id || items.length === 0)
      throw new Error("user_id and items are required");

    const order = await Order.create(
      {
        user_id,
        order_date: new Date(),
        status: fields.status || "PENDING",
        province: fields.province,
        district: fields.district,
        ward: fields.ward,
        address: fields.address,
        delivery_date: fields.delivery_date || null,
        note: fields.note || null,
        subtotal: fields.subtotal || 0,
        shipping_cost: fields.shipping_cost || 0,
        total_amount:
          fields.total_amount != null
            ? fields.total_amount
            : Number(
                (
                  Number(fields.subtotal || 0) +
                  Number(fields.shipping_cost || 0)
                ).toFixed(2)
              ),
      },
      { transaction: t }
    );

    for (const it of items) {
      // if price_at_purchase not provided, derive from related product's price
      let price = it.price_at_purchase;
      if (price == null) {
        const pv = await ProductVariation.findByPk(it.product_variation_id, {
          include: [Product],
          transaction: t,
        });
        price = pv && pv.Product ? pv.Product.price : 0;
      }
      await OrderItem.create(
        {
          order_id: order.id,
          product_variation_id: it.product_variation_id,
          quantity: it.quantity,
          price_at_purchase: price,
        },
        { transaction: t }
      );
    }

    await t.commit();
    return await getOrderById(order.id);
  } catch (e) {
    await t.rollback();
    throw e;
  }
};

export const updateOrderStatus = async (id, status) => {
  const [count] = await Order.update({ status }, { where: { id } });
  if (count === 0) return null;
  return await getOrderById(id);
};

export const cancelOrder = async (id) => {
  const order = await Order.findByPk(id);
  if (!order) return null;
  if (order.status === "CANCELLED") return order;
  order.status = "CANCELLED";
  await order.save();
  return order;
};

export default {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
};
