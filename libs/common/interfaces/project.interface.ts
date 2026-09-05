export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  workspace_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
}
