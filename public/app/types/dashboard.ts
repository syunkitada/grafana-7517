export interface FolderDTO {
  id: number;
  uid: string;
  title: string;
  url: string;
  version: number;
}

export interface FolderState {
  id: number;
  uid: string;
  title: string;
  url: string;
  version: number;
  canSave: boolean;
  hasChanged: boolean;
}
