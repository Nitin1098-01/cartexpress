const userSign = () => {
  async (req, res) => {
    console.log("Hello");
    let userdetail = {};
    try {
      userdetail = await db.query("SELECT * FROM users;");
    } catch (e) {
      console.log(e);
    }
    let cleanResult = userdetail.rows.map(row => {
      delete row.password;
      return row;
    });
    res.json(cleanResult);
  };
};

const userLogin = () => {
  async (req, res) => {
    //Return success message if successful, else show success false and message

    let { username, password, number, email, roleid } = req.body;
    let passHash = bcrypt.hashSync(password, 10);
    let result = {};
    try {
      result = await db.query(
        `INSERT into users (username,password,phone,email,roleid) values ('${username}','${passHash}','${number}','${email}','${roleid}')`
      );
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error });
      return;
    }
    res.json({
      success: true,
      message: "Inserted successfully"
    });
  };
};

const loginSecure = () => {
  async (req, res) => {
    let allUsers = await db.query(`SELECT * from users`).catch(err => {
      res.json({
        success: false,
        message: "Something went wrong"
      });
      return;
    });
    let matchedUsers = allUsers.rows.filter(entry => {
      return entry.username == req.body.username;
    });
    console.log(req.body);
    if (matchedUsers.length == 0) {
      res.json({
        sucess: false,
        message: "User does not exist"
      });
      return;
    } else {
      let matchedUser = matchedUsers[0];
      // console.log('Received from req ', req.body)
      if (bcrypt.compareSync(req.body.password, matchedUser.password)) {
        const token = jwt.sign(matchedUser, "1234567890!@#^&*()_qwiasjm");
        res.json({
          success: true,
          message: "Valid Customer",
          token,
          user: matchedUser
        });
        return;
      } else {
        res.json({
          success: false,
          message: "Password Mismatch"
        });
      }

      // res.status(404).json({
      //   success: false,
      //   message: "Password is invalid"
      // });
    }
  };
};

const customer = () => {
  async (req, res) => {
    let userdetail = {};
    try {
      userdetail = await db.query("SELECT * FROM users WHERE roleid=0;");
    } catch (e) {
      console.log(e);
    }
    let cleanResult = userdetail.rows.map(row => {
      delete row.password;
      return row;
    });
    res.json(cleanResult);
  };
};

const deleteUser = () => {
  async (req, res) => {
    console.log("The request ", req.body);
    let result = await db.query(
      `DELETE FROM users WHERE userid= ${req.body.userid};`
    );
    res.json({
      success: true,
      message: "Deleted Successfully"
    });
    return;
  };
};

const dummy = () => {
  (req, res) => {
    res.json({
      body: req.body,
      headers: req.headers
    });
  };
};

module.exports = {
  userSign,
  userLogin,
  loginSecure,
  customer,
  deleteUser,
  dummy
};
