"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("./comment.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const comment_validation_1 = require("./comment.validation");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.post('/', (0, validate_middleware_1.validate)(comment_validation_1.createCommentSchema), comment_controller_1.create);
router.get('/:ticketId', comment_controller_1.getByTicket);
exports.default = router;
