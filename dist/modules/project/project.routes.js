"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("./project.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const project_validation_1 = require("./project.validation");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.post('/', (0, validate_middleware_1.validate)(project_validation_1.createProjectSchema), project_controller_1.create);
router.get('/', project_controller_1.getByOrg);
router.get('/:id', project_controller_1.getOne);
router.post('/:id/invite', project_controller_1.invite);
exports.default = router;
