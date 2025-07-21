const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send({ status: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_PASS); // match secret with controller
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({ status: false, message: "Invalid or expired token." });
  }
};

module.exports = verifyToken;

