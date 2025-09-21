import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigator } from '../AppRouter';
import { useLoading } from '../contexts/LoadingContext';
import { FormInputControl } from '../form/form-control';
import { useZForm } from '../form/useForm';
import { projectSchema } from '../schemas/Project';
import { getProject } from '../services/Project.service';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export function ProjectDetail() {
  const navigate = useNavigator();
  const [isOpen, setIsOpen] = useState(true);
  const { id } = useParams();
  const { setLoading } = useLoading();
  const location = useLocation();
  const state = location.state;
  const [status, setStatus] = useState('new');
  const [initialStatus, setInitialStatus] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id || id == 'new') {
        setInitialStatus('new');
        return;
      }

      setLoading(true);
      try {
        const project = await getProject(id!);
        setTimeout(() => {
          form.setValues(project);
          setStatus(project.status);
          setInitialStatus(project.status);
        }, 0);
      } catch (error) {}
      setLoading(false);
    })();
  }, []);

  const close = () => {
    setIsOpen(false);
    navigate(-1);
  };

  const getNextStatusOptions = (current: string) => {
    switch (current) {
      case 'new':
        return ['in_progress', 'cancelled'];
      case 'in_progress':
        return ['completed', 'paused', 'cancelled'];
      case 'paused':
        return ['in_progress'];
      case 'completed':
        return ['in_progress'];
      default:
        return [];
    }
  };

  const getReadableStatus = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const form = useZForm(projectSchema, {
    onSubmit: async (values) => {
      if (state?.readonly) return;
      const isNew = id === 'new';
      await fetch(
        `${process.env.REACT_APP_SERVER_URL}/projects${isNew ? '' : '/' + id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: isNew ? 'POST' : 'PATCH',
          credentials: 'include',
          body: JSON.stringify({
            ...values,
            status,
          }),
        },
      );
      close();
    },
  });

  return (
    <>
      <Modal
        open={isOpen}
        onClose={close}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Stack spacing={4}>
            <FormInputControl
              schema={projectSchema}
              form={form}
              field="name"
              disabled={state?.readonly}
            />
            <FormInputControl
              schema={projectSchema}
              form={form}
              field="description"
              disabled={state?.readonly}
            />
            {form.values.createdAt && (
              <TextField
                value={new Date(form.values.createdAt).toLocaleDateString(
                  'pt-BR',
                )}
                label="Criation Date"
                fullWidth
                disabled
                variant="outlined"
              />
            )}
            {!state?.readonly && id !== 'new' && (
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  value={status}
                  label="Status"
                  onChange={(e) => {
                    if (e.target.value === 'cancelled') {
                      setShowConfirmDialog(true);
                    } else {
                      setStatus(e.target.value);
                    }
                  }}
                >
                  {getNextStatusOptions(initialStatus).map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {getReadableStatus(opt)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {state?.readonly && (
              <TextField
                value={getReadableStatus(status)}
                label="Status"
                fullWidth
                disabled
                variant="outlined"
              />
            )}
            <Stack direction={'row-reverse'} spacing={2}>
              <Button
                type="submit"
                variant="contained"
                onClick={form.submitForm}
                disabled={state?.readonly || !form.dirty || !form.isValid}
              >
                Save
              </Button>
              <Button onClick={close}>Cancel</Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Confirm Cancel</DialogTitle>
        <DialogContent>
          Tem certeza que deseja cancelar este projeto? Essa ação é
          irreversível.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Não</Button>
          <Button
            color="error"
            onClick={() => {
              setStatus('cancelled');
              setShowConfirmDialog(false);
            }}
          >
            Sim, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
