export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assignee_id: string | null;
  created_by: string;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface TaskWithAssignee extends Task {
  assignee_member_id: string | null;
  assignee_username: string | null;
  assignee_avatar_url: string | null;
}
