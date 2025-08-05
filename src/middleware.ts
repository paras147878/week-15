import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";





const   JWT_PASSWORD = "121212";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  const decoded = jwt.verify(header as string, JWT_PASSWORD )
  if(decoded) {
    //@ts-ignore
    req.userID = decoded.id;
    next()

  } else {
    res.status(403).json({
        message: "you are not logged in"
    })
  }
};
