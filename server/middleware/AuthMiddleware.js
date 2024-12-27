import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req?.headers?.authorization;

  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) {
      return res.status(403).send("token not valid");
    }

    req.userId = payload.userId;
    next();
  });
};
