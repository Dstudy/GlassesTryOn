import productImageService from "../services/productImageService.js";

const addImage = async (req, res) => {
  try {
    const { variationId } = req.params;
    const { pic_url, display_order } = req.body;
    if (!variationId || !pic_url) {
      return res
        .status(400)
        .json({ errCode: 1, message: "variationId and pic_url required" });
    }
    const img = await productImageService.addImage({
      productVariationId: variationId,
      pic_url,
      display_order,
    });
    return res
      .status(201)
      .json({ errCode: 0, message: "Image added", image: img });
  } catch (err) {
    return res
      .status(500)
      .json({ errCode: 1, message: "Error adding image", error: err.message });
  }
};

const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const img = await productImageService.updateImage(id, payload);
    if (!img)
      return res.status(404).json({ errCode: 1, message: "Image not found" });
    return res.status(200).json({ errCode: 0, message: "Updated", image: img });
  } catch (err) {
    return res.status(500).json({
      errCode: 1,
      message: "Error updating image",
      error: err.message,
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await productImageService.deleteImage(id);
    if (!ok)
      return res.status(404).json({ errCode: 1, message: "Image not found" });
    return res.status(200).json({ errCode: 0, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({
      errCode: 1,
      message: "Error deleting image",
      error: err.message,
    });
  }
};

export default { addImage, updateImage, deleteImage };
