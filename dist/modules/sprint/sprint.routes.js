"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sprint_controller_1 = require("./sprint.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.post('/', sprint_controller_1.create);
router.get('/', sprint_controller_1.getByProject);
router.patch('/:id', sprint_controller_1.update);
router.patch('/:id/complete', sprint_controller_1.complete);
exports.default = router;
