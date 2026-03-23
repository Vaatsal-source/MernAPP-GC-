import 'dotenv/config';
import jwt from 'jsonwebtoken';


const auth = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send({ error: "Access Denied" });

  try {
    const data = jwt.verify(token, process.env.JWT_SEC); 
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Invalid Token" });
  }
};

export default auth;