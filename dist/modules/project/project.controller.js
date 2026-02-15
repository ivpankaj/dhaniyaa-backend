"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.changeMemberRole = exports.removeMember = exports.update = exports.invite = exports.getOne = exports.getByOrg = exports.create = void 0;
const projectService = __importStar(require("./project.service"));
const create = async (req, res, next) => {
    try {
        const project = await projectService.createProject(req.user._id.toString(), req.body);
        res.status(201).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const getByOrg = async (req, res, next) => {
    try {
        const organizationId = req.query.organizationId;
        const search = req.query.search;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        let result;
        if (organizationId) {
            result = await projectService.getProjectsByOrg(organizationId, search, page, limit);
        }
        else {
            // If no org ID provided, return all projects the user is a member of (with pagination)
            result = await projectService.getProjectsForUser(req.user._id.toString(), search, page, limit);
        }
        const { projects, total } = result;
        res.status(200).json({
            success: true,
            data: projects,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getByOrg = getByOrg;
const getOne = async (req, res, next) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
const invite = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { email } = req.body;
        const project = await projectService.addMemberByEmail(id, email);
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.invite = invite;
const update = async (req, res, next) => {
    try {
        const project = await projectService.updateProject(req.params.id, req.body);
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const removeMember = async (req, res, next) => {
    try {
        const { id, memberId } = req.params;
        const project = await projectService.removeMember(id, memberId);
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.removeMember = removeMember;
const changeMemberRole = async (req, res, next) => {
    try {
        const { id, memberId } = req.params;
        const { role } = req.body;
        const project = await projectService.changeMemberRole(id, memberId, role);
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.changeMemberRole = changeMemberRole;
const deleteProject = async (req, res, next) => {
    try {
        const id = req.params.id;
        const project = await projectService.deleteProject(id, req.user._id.toString());
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Project deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProject = deleteProject;
