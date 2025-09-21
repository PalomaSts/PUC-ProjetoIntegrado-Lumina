import { InferType, object, string } from 'yup';
export const userSchema = object({
	id: string().default('').required(''),
	name: string().label('Name').default('').required(),
	email: string().label('Email').default('').required(),
	password: string().label('Password').default('').required(),
	picture: string().label('Picture').default('').required(),
});

export type User = InferType<typeof userSchema>;