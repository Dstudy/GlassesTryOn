import favoriteService from "../services/favoriteService.js";

const add = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res
        .status(400)
        .json({ errCode: 1, message: "userId and productId are required" });
    }
    const fav = await favoriteService.addFavorite(userId, productId);
    return res.status(200).json({ errCode: 0, message: "OK", data: fav });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error adding favorite",
      error: error.message,
    });
  }
};

const remove = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) {
      return res
        .status(400)
        .json({ errCode: 1, message: "userId and productId are required" });
    }
    const ok = await favoriteService.removeFavorite(userId, productId);
    return res
      .status(200)
      .json({ errCode: 0, message: ok ? "Removed" : "Not Found" });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error removing favorite",
      error: error.message,
    });
  }
};

const list = async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await favoriteService.listFavorites(userId);
    return res.status(200).json({ errCode: 0, message: "OK", data: items });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error listing favorites",
      error: error.message,
    });
  }
};

export default { add, remove, list };
