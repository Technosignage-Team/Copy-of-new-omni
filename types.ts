export interface Ticket {
  id: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Pending';
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  type: string;
  assignee: User;
  createdAt: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Agent' | 'Manager' | 'User';
  status: 'Active' | 'Inactive' | 'Suspended';
  avatar: string;
}

export interface TicketType {
  id: string;
  name: string;
  active: boolean;
  fieldsCount: number;
}

export interface Stat {
  label: string;
  value: number;
  change: string; // e.g., "+5%"
  icon: string;
  colorClass: string;
  bgClass: string;
}