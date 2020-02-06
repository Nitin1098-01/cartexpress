const addFavorite = () => {
  async (req, res) => {
    console.log(req.headers);
    if (!req.headers.authorization) {
      res.status(400).json({
        success: false,
        message: "Authorization failed... Try Again"
      });
      return;
    }
    let usr = null;
    try {
      usr = jwt.verify(req.headers.authorization, "1234567890!@#^&*()_qwiasjm");
      const { product_id } = req.body.data;
      console.log("The request ", req.body);
      console.log(usr);

      let selectProductsResult = await db.query(
        `SELECT * FROM favorite WHERE product_id = ${product_id} AND user_id=${usr.userid};`
      );
      if (selectProductsResult.rowCount != 0) {
        //There are products already
        res.json({
          success: false,
          message: "Already exists"
        });
        return;
      }
      if (usr) {
        let result = await db.query(
          `INSERT INTO favorite (product_id,user_id) VALUES (${product_id},${usr.userid});`
        );
        res.json({
          success: true,
          ...result
        });
        return;
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error
      });
    }
  };
};

const viewFavorite = () => {
  async (req, res) => {
    console.log(req.headers.authorization);
    if (!req.headers.authorization) {
      res.status(400).json({
        success: false,
        message: "Authorization failed... Try Again"
      });
      return;
    }
    let usr = null;
    try {
      usr = jwt.verify(req.headers.authorization, "1234567890!@#^&*()_qwiasjm");
      const { product_id, user_id } = req.body;
      console.log(usr);

      if (usr) {
        let result = await db.query(
          `SELECT products.productid ,users.username, products.productname, products.image, products.description, products.quantity, products.price FROM users, products, favorite WHERE users.userid = ${usr.userid} AND users.userid = favorite.user_id AND products.productId = favorite.product_id;`
        );
        res.json({
          success: true,
          data: result.rows
        });
        return;
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error
      });
    }
  };
};

const deleteFavorite = () => {
  async (req, res) => {
    console.log("The request ", req.body);
    let result = await db.query(
      `DELETE FROM favorite WHERE product_id= ${req.body.product_id};`
    );
    res.json({
      success: true,
      message: "Deleted Successfully"
    });
    return;
  };
};

module.exports = { addFavorite, viewFavorite, deleteFavorite };
