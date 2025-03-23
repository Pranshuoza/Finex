const express = require("express");
const router = express.Router();
const goalController = require("../Controller/goalController");

router.post("/create", goalController.createGoal);
router.get("/user", goalController.getUserGoals);
router.put("/update/:id", goalController.updateGoal);
router.delete("/delete/:id", goalController.deleteGoal);
router.get("/userprofile", goalController.getUserProfile);

module.exports = router;