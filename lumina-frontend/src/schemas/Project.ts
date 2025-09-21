import { date, InferType, object, string } from 'yup';
import { generateId } from '../utils/functions';
export const projectSchema = object({
  id: string().default(generateId()).required(''),
  name: string()
    .label('Name')
    .min(5, (f) => `Mínimo de ${f.min} caracteres`)
    .max(30, (f) => `Máximo de ${f.max} caracteres`)
    .required(),
  description: string()
    .label('Description')
    .min(5, (f) => `Mínimo de ${f.min} caracteres`)
    .max(500, (f) => `Máximo de ${f.max} caracteres`)
    .default('')
    .meta({ rows: 5 })
    .required(),
  createdAt: date().label('Created On').default(new Date()),
  status: string()
    .oneOf(['new', 'in_progress', 'paused', 'completed', 'cancelled'])
    .required()
    .meta({ select: true })
    .label('Status')
    .default('new'),
  //   userId: string().label("User").default(""),
});

export type Project = InferType<typeof projectSchema>;
