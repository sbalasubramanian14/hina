export interface TaskSpace {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  createdAt: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // Every N days/weeks/months
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  endDate?: string;
  endAfterOccurrences?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  taskSpaceId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  reminderMinutesBefore?: number;
  completed: boolean;
  createdAt: string;
  metadata?: Record<string, any>; // For storing task-specific data
}

export interface UserInterest {
  category: string;
  items: string[];
}

export interface UserProfile {
  name?: string;
  interests: UserInterest[];
  geminiApiKey?: string;
  locationPermission: boolean;
  notificationsPermission: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AIContextData {
  currentTime: string;
  currentDate: string;
  dayOfWeek: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  todayTasks: Task[];
  activeTaskSpaces: string[];
  userInterests: string[];
}

export interface AINotification {
  id: string;
  type: 'task_reminder' | 'proactive_suggestion' | 'learning_content' | 'fun_fact' | 'weekend_activity';
  title: string;
  body: string;
  data?: any;
  scheduledTime?: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'day' | 'week' | 'month';
  aiSuggestionsEnabled: boolean;
  proactiveNotificationsEnabled: boolean;
}
