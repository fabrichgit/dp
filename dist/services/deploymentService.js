"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fileUtils_1 = require("../utils/fileUtils");
class DeploymentService {
    constructor() {
        this.deploymentsPath = path_1.default.join(__dirname, '../../uploads');
        this.deployments = new Map();
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        if (!fs_1.default.existsSync(this.deploymentsPath)) {
            fs_1.default.mkdirSync(this.deploymentsPath, { recursive: true });
        }
    }
    async createDeployment(name, files) {
        const id = (0, uuid_1.v4)();
        const deploymentPath = path_1.default.join(this.deploymentsPath, id);
        fs_1.default.mkdirSync(deploymentPath);
        const uploadedFile = files.build;
        const zipPath = path_1.default.join(deploymentPath, 'build.zip');
        await uploadedFile.mv(zipPath);
        // Extract ZIP file directly to the deployment path
        await (0, fileUtils_1.extractZip)(zipPath, deploymentPath);
        // Remove ZIP file after extraction
        fs_1.default.unlinkSync(zipPath);
        const deployment = {
            id,
            name,
            createdAt: new Date(),
            path: deploymentPath,
            status: 'active',
            url: `${this.baseUrl}/~/${id}`
        };
        this.deployments.set(id, deployment);
        return deployment;
    }
    getDeployment(id) {
        return this.deployments.get(id);
    }
    getAllDeployments() {
        return Array.from(this.deployments.values());
    }
    deleteDeployment(id) {
        const deployment = this.deployments.get(id);
        if (!deployment)
            return false;
        fs_1.default.rmSync(deployment.path, { recursive: true, force: true });
        this.deployments.delete(id);
        return true;
    }
}
exports.default = DeploymentService;
