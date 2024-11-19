export interface Folder {
    id: string;
    name: string;
    parentFolderId: number | null;
    children?: any
  }
  
  export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }