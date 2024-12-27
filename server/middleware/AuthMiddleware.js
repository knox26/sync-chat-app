import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log("token from verify token", req.cookies);
  console.log("token from verify token", token);

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
