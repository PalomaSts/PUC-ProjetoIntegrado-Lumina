"use-client";
import { FormikHelpers, useFormik } from "formik";
import { InferType, ObjectSchema } from "yup";

export function useZForm<TIn extends ObjectSchema<any>>(
  schema: TIn,
  options?: {
    initialValues?: Partial<InferType<TIn>>;
    onSubmit?: (values: InferType<TIn>, formikHelpers: FormikHelpers<InferType<TIn>>) => void | Promise<any>;
  }
) {
  const formik = useFormik<InferType<TIn>>({
    initialValues: {
      ...schema.getDefault(),
      ...options?.initialValues,
    },
    validationSchema: schema,
    onSubmit: options?.onSubmit || ((v, f) => {}),
  });

  return formik;
}
