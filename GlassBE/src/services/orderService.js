import { Sequelize } from "sequelize";
import models, { sequelize } from "../models/index.js";

const { Order, OrderItem, Cart, CartItem, ProductVariation, Product } = models;

export const listOrders = async (userId) => {
  const orders = await Order.findAll({
    where: { user_id: userId },
    order: [["id", "DESC"]],
  });
  return orders;
};

export const getOrderDetail = async (orderId, userId) => {
  const order = await Order.findOne({
    where: { id: orderId, user_id: userId },
    include: [
      {
        model: OrderItem,
        include: [{ model: ProductVariation, include: [Product] }],
      },
    ],
  });
  return order;
};

export const createOrderFromCart = async (userId, payload) => {
  const t = await sequelize.transaction();
  try {
    const cart = await Cart.findOne({
      where: { user_id: userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!cart) throw new Error("Cart not found");
    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [
        {
          model: ProductVariation,
          include: [Product],
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (cartItems.length === 0) throw new Error("Cart is empty");

    // Calculate subtotal using Product.price (variation has no price column)
    const subtotal = cartItems.reduce((sum, ci) => {
      const price =
        ci.ProductVariation &&
        ci.ProductVariation.Product &&
        ci.ProductVariation.Product.price
          ? parseFloat(ci.ProductVariation.Product.price)
          : 0;
      return sum + price * ci.quantity;
    }, 0);
    const shippingCost = payload?.shipping_cost
      ? parseFloat(payload.shipping_cost)
      : 0;
    const total = subtotal + shippingCost;

    const order = await Order.create(
      {
        user_id: userId,
        province: payload?.province,
        district: payload?.district,
        ward: payload?.ward,
        address: payload?.address,
        order_date: new Date(),
        delivery_date: payload?.delivery_date || null,
        status: "PENDING",
        note: payload?.note || null,
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        total_amount: total.toFixed(2),
      },
      { transaction: t }
    );

    for (const ci of cartItems) {
      const price =
        ci.ProductVariation &&
        ci.ProductVariation.Product &&
        ci.ProductVariation.Product.price
          ? parseFloat(ci.ProductVariation.Product.price)
          : 0;
      await OrderItem.create(
        {
          order_id: order.id,
          product_variation_id: ci.product_variation_id,
          quantity: ci.quantity,
          price_at_purchase: price.toFixed(2),
        },
        { transaction: t }
      );
    }

    // Clear cart
    await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

    await t.commit();
    return order;
  } catch (e) {
    await t.rollback();
    throw e;
  }
};

export const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({
    where: { id: orderId, user_id: userId },
  });
  if (!order) return null;
  if (order.status === "CANCELLED") return order;
  order.status = "CANCELLED";
  await order.save();
  return order;
};

export default { listOrders, getOrderDetail, createOrderFromCart, cancelOrder };
