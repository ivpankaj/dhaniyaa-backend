"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const organization_controller_1 = require("./organization.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const organization_validation_1 = require("./organization.validation");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.post('/', (0, validate_middleware_1.validate)(organization_validation_1.createOrgSchema), organization_controller_1.createOrg);
router.get('/', organization_controller_1.getMyOrgs);
router.post('/:id/invite', organization_controller_1.invite);
exports.default = router;
