import models from "../models/index.js";

const {
  Cart,
  CartItem,
  ProductVariation,
  Product,
  Brand,
  Shape,
  Material,
  Color,
  ProductImage,
} = models;

const getOrCreateCart = async (userId) => {
  const [cart] = await Cart.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId },
  });
  return cart;
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  const items = await CartItem.findAll({
    where: { cart_id: cart.id },
    include: [
      {
        model: ProductVariation,
        include: [
          {
            model: Product,
            include: [{ model: Shape }, { model: Material }],
          },
          { model: Color },
          { model: ProductImage, limit: 1 },
        ],
      },
    ],
    order: [["id", "ASC"]],
  });
  return { cartId: cart.id, items };
};

export const addItem = async (userId, productVariationId, quantity = 1) => {
  const cart = await getOrCreateCart(userId);
  const [item, created] = await CartItem.findOrCreate({
    where: { cart_id: cart.id, product_variation_id: productVariationId },
    defaults: {
      cart_id: cart.id,
      product_variation_id: productVariationId,
      quantity,
    },
  });
  if (!created) {
    item.quantity += quantity;
    await item.save();
  }
  return item;
};

export const updateItem = async (userId, productVariationId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const item = await CartItem.findOne({
    where: { cart_id: cart.id, product_variation_id: productVariationId },
  });
  if (!item) return null;
  item.quantity = quantity;
  await item.save();
  return item;
};

export const removeItem = async (userId, productVariationId) => {
  const cart = await getOrCreateCart(userId);
  const deleted = await CartItem.destroy({
    where: { cart_id: cart.id, product_variation_id: productVariationId },
  });
  return deleted > 0;
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await CartItem.destroy({ where: { cart_id: cart.id } });
  return true;
};

export default { getCart, addItem, updateItem, removeItem, clearCart };
