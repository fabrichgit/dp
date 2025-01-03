"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deploymentController_1 = require("../controllers/deploymentController");
const router = (0, express_1.Router)();
router.post('/', deploymentController_1.createDeployment);
router.get('/', deploymentController_1.getAllDeployments);
router.get('/:id', deploymentController_1.getDeployment);
router.delete('/:id', deploymentController_1.deleteDeployment);
exports.default = router;
