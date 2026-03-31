import db from "../models/index.js";
import { sequelize } from "../models/index.js";

const getAllProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await db.Product.findAll({
        include: [
          { model: db.Brand, attributes: ["id", "name"] },
          { model: db.Shape, attributes: ["id", "name"] },
          { model: db.Material, attributes: ["id", "name"] },
          {
            model: db.ProductFeature,
            attributes: ["id", "product_id", "feature_id"],
            include: [{ model: db.Feature, attributes: ["id", "name", "img"] }],
          },
          {
            model: db.ProductVariation,
            attributes: { exclude: ["price"] },
            include: [
              { model: db.Color, attributes: ["id", "name", "hex_code"] },
              {
                model: db.ProductImage,
                attributes: ["id", "pic_url", "display_order"],
                limit: 1,
              },
            ],
          },
        ],
      });
      resolve(products);
    } catch (error) {
      reject(error);
    }
  });
};

const getProductById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await db.Product.findByPk(id, {
        include: [
          { model: db.Brand, attributes: ["id", "name"] },
          { model: db.Shape, attributes: ["id", "name"] },
          { model: db.Material, attributes: ["id", "name"] },
          {
            model: db.ProductFeature,
            attributes: ["id", "product_id", "feature_id"],
            include: [{ model: db.Feature, attributes: ["id", "name", "img"] }],
          },
          {
            model: db.ProductVariation,
            attributes: { exclude: ["price"] },
            include: [
              { model: db.Color, attributes: ["id", "name", "hex_code"] },
              {
                model: db.ProductImage,
                attributes: ["id", "pic_url", "display_order"],
              },
            ],
          },
        ],
      });
      resolve(product);
    } catch (error) {
      reject(error);
    }
  });
};

const createProduct = (productData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const t = await sequelize.transaction();
      try {
        const { variations, features, ...productFields } = productData;
        const product = await db.Product.create(productFields, {
          transaction: t,
        });

        if (Array.isArray(features)) {
          for (const f of features) {
            // Accept either { id } or { name, img }
            let featureId = null;
            if (f.id) {
              featureId = f.id;
            } else if (f.name || f.title) {
              const name = f.name || f.title;
              const [feat] = await db.Feature.findOrCreate({
                where: { name },
                defaults: { img: f.img || f.image || null },
                transaction: t,
              });
              featureId = feat.id;
            }
            if (featureId) {
              await db.ProductFeature.create(
                { product_id: product.id, feature_id: featureId },
                { transaction: t }
              );
            }
          }
        }

        if (Array.isArray(variations)) {
          for (const v of variations) {
            const { images, ...variationFields } = v;
            const varRow = await db.ProductVariation.create(
              { ...variationFields, product_id: product.id },
              { transaction: t }
            );
            if (Array.isArray(images)) {
              for (const img of images) {
                await db.ProductImage.create(
                  { ...img, product_variation_id: varRow.id },
                  { transaction: t }
                );
              }
            }
          }
        }

        await t.commit();
        resolve(
          await db.Product.findByPk(product.id, {
            include: [
              { model: db.Brand, attributes: ["id", "name"] },
              { model: db.Shape, attributes: ["id", "name"] },
              { model: db.Material, attributes: ["id", "name"] },
              {
                model: db.ProductVariation,
                include: [db.Color, db.ProductImage],
              },
            ],
          })
        );
      } catch (e) {
        await t.rollback();
        throw e;
      }
    } catch (error) {
      reject(error);
    }
  });
};

const updateProduct = (id, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const t = await sequelize.transaction();
      try {
        const { variations, features, ...productFields } = updateData;
        const [updatedRowsCount] = await db.Product.update(productFields, {
          where: { id },
          transaction: t,
        });
        if (updatedRowsCount === 0) {
          await t.rollback();
          return resolve(null);
        }

        if (Array.isArray(features)) {
          await db.ProductFeature.destroy({
            where: { product_id: id },
            transaction: t,
          });
          for (const f of features) {
            let featureId = null;
            if (f.id) {
              featureId = f.id;
            } else if (f.name || f.title) {
              const name = f.name || f.title;
              const [feat] = await db.Feature.findOrCreate({
                where: { name },
                defaults: { img: f.img || f.image || null },
                transaction: t,
              });
              featureId = feat.id;
            }
            if (featureId) {
              await db.ProductFeature.create(
                { product_id: id, feature_id: featureId },
                { transaction: t }
              );
            }
          }
        }

        if (Array.isArray(variations)) {
          // Replace strategy: delete old and recreate
          const oldVars = await db.ProductVariation.findAll({
            where: { product_id: id },
            transaction: t,
          });
          const oldVarIds = oldVars.map((v) => v.id);
          if (oldVarIds.length) {
            await db.ProductImage.destroy({
              where: { product_variation_id: oldVarIds },
              transaction: t,
            });
            await db.ProductVariation.destroy({
              where: { id: oldVarIds },
              transaction: t,
            });
          }

          for (const v of variations) {
            const { images, ...variationFields } = v;
            const varRow = await db.ProductVariation.create(
              { ...variationFields, product_id: id },
              { transaction: t }
            );
            if (Array.isArray(images)) {
              for (const img of images) {
                await db.ProductImage.create(
                  { ...img, product_variation_id: varRow.id },
                  { transaction: t }
                );
              }
            }
          }
        }

        await t.commit();
        const updatedProduct = await db.Product.findByPk(id, {
          include: [
            { model: db.Brand, attributes: ["id", "name"] },
            { model: db.Shape, attributes: ["id", "name"] },
            { model: db.Material, attributes: ["id", "name"] },
            {
              model: db.ProductFeature,
              attributes: ["id", "product_id", "feature_id"],
              include: [
                { model: db.Feature, attributes: ["id", "name", "img"] },
              ],
            },
            {
              model: db.ProductVariation,
              include: [db.Color, db.ProductImage],
            },
          ],
        });
        resolve(updatedProduct);
      } catch (e) {
        await t.rollback();
        throw e;
      }
    } catch (error) {
      reject(error);
    }
  });
};

const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const t = await sequelize.transaction();
      try {
        const vars = await db.ProductVariation.findAll({
          where: { product_id: id },
          transaction: t,
        });
        const varIds = vars.map((v) => v.id);
        if (varIds.length) {
          await db.ProductImage.destroy({
            where: { product_variation_id: varIds },
            transaction: t,
          });
          await db.ProductVariation.destroy({
            where: { id: varIds },
            transaction: t,
          });
        }
        const deletedRowsCount = await db.Product.destroy({
          where: { id },
          transaction: t,
        });
        await t.commit();
        resolve(deletedRowsCount > 0);
      } catch (e) {
        await t.rollback();
        throw e;
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getProductVariations = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const variations = await db.ProductVariation.findAll({
        where: { product_id: productId },
        include: [
          { model: db.Color, attributes: ["id", "name", "hex_code"] },
          {
            model: db.ProductImage,
            attributes: ["id", "pic_url", "display_order"],
          },
        ],
      });
      resolve(variations);
    } catch (error) {
      reject(error);
    }
  });
};

const toggleProductActive = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await db.Product.findByPk(id);
      if (!product) {
        return resolve(null);
      }

      const newActiveState = !product.active;
      await db.Product.update({ active: newActiveState }, { where: { id } });

      const updatedProduct = await db.Product.findByPk(id, {
        include: [
          { model: db.Brand, attributes: ["id", "name"] },
          { model: db.Shape, attributes: ["id", "name"] },
          { model: db.Material, attributes: ["id", "name"] },
          {
            model: db.ProductFeature,
            attributes: ["id", "product_id", "feature_id"],
            include: [{ model: db.Feature, attributes: ["id", "name", "img"] }],
          },
          {
            model: db.ProductVariation,
            attributes: { exclude: ["price"] },
            include: [
              { model: db.Color, attributes: ["id", "name", "hex_code"] },
              {
                model: db.ProductImage,
                attributes: ["id", "pic_url", "display_order"],
                limit: 1,
              },
            ],
          },
        ],
      });

      resolve(updatedProduct);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  getProductVariations,
  async setProductFeatures(productId, rawFeatures) {
    const t = await sequelize.transaction();
    try {
      await db.ProductFeature.destroy({
        where: { product_id: productId },
        transaction: t,
      });
      if (Array.isArray(rawFeatures) && rawFeatures.length) {
        const now = new Date();
        const rows = [];
        for (const f of rawFeatures) {
          let featureId = null;
          if (f.id) {
            featureId = f.id;
          } else if (f.name || f.title) {
            const name = f.name || f.title;
            const [feat] = await db.Feature.findOrCreate({
              where: { name },
              defaults: { img: f.img || f.image || null },
              transaction: t,
            });
            featureId = feat.id;
          }
          if (featureId) {
            rows.push({
              product_id: productId,
              feature_id: featureId,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
        if (rows.length)
          await db.ProductFeature.bulkCreate(rows, { transaction: t });
      }
      await t.commit();
      return await db.Product.findByPk(productId, {
        include: [
          {
            model: db.ProductFeature,
            attributes: ["id", "product_id", "feature_id"],
            include: [{ model: db.Feature, attributes: ["id", "name", "img"] }],
          },
        ],
      });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },
};
