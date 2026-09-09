export interface Attachment {
  id: string;
  filename: string;
  file_key: string;
  file_size: number;
  mime_type: string;
  task_id: string;
  uploaded_by: string;
  created_at: Date;
}

export interface AttachmentWithUploader extends Attachment {
  file_url: string;
  uploader_username: string;
  uploader_avatar_url: string | null;
}
