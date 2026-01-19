export interface ResourceNode {
  id: string;
  name: string;
  type: string;
  children?: ResourceNode[];
  permission?: string;
}
