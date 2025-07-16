const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ status: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_PASS);
    req.userId = decoded.id;
    next(); // move to the next function (controller)
  } catch (err) {
    return res.status(401).send({ status: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
