import models from "../models/index.js";

const { ProductImage, ProductVariation } = models;

/**
 * Add an image for a product variation. If display_order is not provided, append to end.
 * Also keep pic_url on the variation in sync (use first image as pic_url).
 */
const addImage = async ({
  productVariationId,
  pic_url,
  display_order = null,
}) => {
  try {
    // Determine display_order if not provided
    if (display_order == null) {
      const last = await ProductImage.findOne({
        where: { product_variation_id: productVariationId },
        order: [["display_order", "DESC"]],
      });
      display_order =
        last && last.display_order != null ? last.display_order + 1 : 1;
    }

    const img = await ProductImage.create({
      product_variation_id: productVariationId,
      pic_url,
      display_order,
    });

    // If this is first image (display_order === 1) or variation has no pic_url, set it
    const variation = await ProductVariation.findByPk(productVariationId);
    if (variation && (!variation.pic_url || display_order === 1)) {
      variation.pic_url = pic_url;
      await variation.save();
    }

    return img;
  } catch (err) {
    console.error("addImage error", err);
    throw err;
  }
};

const updateImage = async (id, { pic_url, display_order }) => {
  try {
    const img = await ProductImage.findByPk(id);
    if (!img) return null;
    if (pic_url != null) img.pic_url = pic_url;
    if (display_order != null) img.display_order = display_order;
    await img.save();

    // If this image is the primary (display_order === 1), sync variation pic_url
    if (img.display_order === 1) {
      const variation = await ProductVariation.findByPk(
        img.product_variation_id
      );
      if (variation) {
        variation.pic_url = img.pic_url;
        await variation.save();
      }
    }

    return img;
  } catch (err) {
    console.error("updateImage error", err);
    throw err;
  }
};

const deleteImage = async (id) => {
  try {
    const img = await ProductImage.findByPk(id);
    if (!img) return false;
    const variationId = img.product_variation_id;
    const wasPrimary = img.display_order === 1;
    await img.destroy();

    if (wasPrimary) {
      // find next image and set as variation pic_url
      const next = await ProductImage.findOne({
        where: { product_variation_id: variationId },
        order: [["display_order", "ASC"]],
      });
      const variation = await ProductVariation.findByPk(variationId);
      if (variation) {
        variation.pic_url = next ? next.pic_url : null;
        await variation.save();
      }
    }

    return true;
  } catch (err) {
    console.error("deleteImage error", err);
    throw err;
  }
};

export default { addImage, updateImage, deleteImage };
