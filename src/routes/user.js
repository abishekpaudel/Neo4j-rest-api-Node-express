import { Router } from "express";
import userModel from "../models/user.js";

const user = Router();

function action(handler) {
  return async (req, res) => {
    try {
      const result = await handler(req);
      if (result === null) return res.status(404).json({ message: "User not found" });
      return res.json(result);
    } catch (error) {
      const status = error.status === 400 ? 400 : 500;
      return res.status(status).json({
        message: status === 400 ? error.message : "Unable to complete this request"
      });
    }
  };
}

user.get("/", action(() => userModel.findAll()));
user.get("/:id", action((req) => userModel.findById(req.params.id)));
user.post("/", action((req) => userModel.create(req.body)));
user.put("/:id", action((req) => userModel.findByIdAndUpdate(req.params.id, req.body)));
user.delete("/:id", action((req) => userModel.findByIdAndDelete(req.params.id)));

export default user;
