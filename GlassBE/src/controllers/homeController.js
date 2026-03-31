import db from "../models/index.js";

const getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll();
        console.log("------------------");
        console.log(data);
        return res.render("homepage.ejs", { data: JSON.stringify(data) });
    } catch (e) {
        console.log(e);
        return res.status(500).send("Internal Server Error");
    }
};

export default getHomePage;
