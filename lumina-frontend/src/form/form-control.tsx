import { Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { InferType, ObjectSchema } from 'yup';

type FormInputControlProps<TIn extends ObjectSchema<any>> = {
  schema: TIn;
  field: keyof InferType<TIn>;
  form: ReturnType<typeof useFormik<InferType<TIn>>>;
  rows?: number;
  label?: string;
  disabled?: boolean;
  options?: { id: string; value: string }[];
  onChange?: (props: any) => any;
};

export function FormInputControl<TIn extends ObjectSchema<any>>({
  schema,
  field,
  form,
  rows: rowsProp,
  disabled,
  label,
  onChange,
}: FormInputControlProps<TIn>) {
  const fieldObj = schema.fields[field] as ObjectSchema<TIn>;

  let rows: number | undefined = rowsProp;
  if (!rows && fieldObj.meta()?.rows) {
    rows = fieldObj.meta()?.rows;
  }

  const { select, options } = fieldObj.meta() || {};

  return (
    <>
      <Stack>
        <TextField
          // id={String(field)}
          // variant="outlined"
          // onChange={(ev) => {
          //   form.setFieldValue(String(field), ev.target.value);
          //   form.handleChange(ev);
          //   if (onChange) onChange(ev.target.value);
          // }}
          // onBlur={form.handleBlur}
          // disabled={disabled}
          // value={form.values[field]}
          // //
          // //
          // {...(disabled ? { focused: true } : {})}
          // {...(form.values[field]
          //   ? { defaultValue: form.values[field], focused: true }
          //   : {})}
          // {...(label || fieldObj.spec.label
          //   ? { label: fieldObj.spec.label }
          //   : {})}
          // {...(rows ? { rows: rows, multiline: true } : {})}
          // {...(Boolean(form.touched[field]) && Boolean(form.errors[field])
          //   ? { error: true, helperText: String(form.errors[field]) }
          //   : {})}
          id={String(field)}
          variant="outlined"
          value={form.values[field] ?? ''}
          onChange={(ev) => {
            form.setFieldValue(String(field), ev.target.value);
            form.handleChange(ev);
            if (onChange) onChange(ev.target.value);
          }}
          onBlur={form.handleBlur}
          disabled={disabled}
          label={label || fieldObj.spec.label}
          multiline={!!rows}
          rows={rows}
          error={Boolean(form.touched[field]) && Boolean(form.errors[field])}
          helperText={
            Boolean(form.touched[field]) && Boolean(form.errors[field])
              ? String(form.errors[field])
              : ''
          }
        />
      </Stack>
    </>
  );
}
