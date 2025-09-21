import { date, InferType, object, string } from 'yup';
import { generateId } from '../utils/functions';
export const taskSchema = object({
  id: string().default(generateId()).required(''),
  title: string().label('Name').required(),
  description: string()
    .label('Description')
    .default('')
    .meta({ rows: 5 })
    .required(),
  createdAt: date().label('Created On').default(new Date()),
  dueDate: date().label('Deadline').default(new Date()),
  status: string()
    .label('Status')
    .default('new')
    .oneOf(['new', 'in_progress', 'paused', 'completed', 'cancelled'])
    .required(),
  priority: string().oneOf(['low', 'medium', 'high']).required(),
  projectId: string().label('Project').required(),
});

export type Task = InferType<typeof taskSchema>;
