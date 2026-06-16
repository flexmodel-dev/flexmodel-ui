export interface LogEntry {
  id: string;
  timestamp: string;
  model: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  source: string;
  thread: string;
  message: string;
  data?: any;
}
