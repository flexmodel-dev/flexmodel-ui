export interface ResourceNode {
  id: string;
  name: string;
  type: string;
  children?: ResourceNode[];
  permission: string;
}

export interface ResourceResponse {
  id: number;
  name: string;
  permission: string;
  type: string;
  parentId: number;
}
