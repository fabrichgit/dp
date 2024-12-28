import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Deployment } from '../types/deployment';
import { extractZip } from '../utils/fileUtils';

export default class DeploymentService {
  private deploymentsPath: string;
  private deployments: Map<string, Deployment>;
  private baseUrl: string;

  constructor() {
    this.deploymentsPath = path.join(__dirname, '../../uploads');
    this.deployments = new Map();
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    if (!fs.existsSync(this.deploymentsPath)) {
      fs.mkdirSync(this.deploymentsPath, { recursive: true });
    }
  }

  async createDeployment(name: string, files: any): Promise<Deployment> {
    const id = uuidv4();
    const deploymentPath = path.join(this.deploymentsPath, id);
    
    fs.mkdirSync(deploymentPath);

    const uploadedFile = files.build;
    const zipPath = path.join(deploymentPath, 'build.zip');
    await uploadedFile.mv(zipPath);
    
    // Extract ZIP file directly to the deployment path
    await extractZip(zipPath, deploymentPath);
    
    // Remove ZIP file after extraction
    fs.unlinkSync(zipPath);

    const deployment: Deployment = {
      id,
      name,
      createdAt: new Date(),
      path: deploymentPath,
      status: 'active',
      url: `${this.baseUrl}/sites/${id}`
    };

    this.deployments.set(id, deployment);
    return deployment;
  }

  getDeployment(id: string): Deployment | undefined {
    return this.deployments.get(id);
  }

  getAllDeployments(): Deployment[] {
    return Array.from(this.deployments.values());
  }

  deleteDeployment(id: string): boolean {
    const deployment = this.deployments.get(id);
    if (!deployment) return false;

    fs.rmSync(deployment.path, { recursive: true, force: true });
    this.deployments.delete(id);
    return true;
  }
}