import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  IconButton,
  SpeedDial,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { RouterPaths, useNavigator } from '../AppRouter';
import { useLoading } from '../contexts/LoadingContext';
import { Project } from '../schemas/Project';
import { deleteProject, listProjects } from '../services/Project.service';

interface Column {
  id: 'id' | 'name' | 'status' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  element?: any;
}

const columns: readonly Column[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'status', label: 'Status', minWidth: 120 },
  {
    id: 'actions',
    label: 'Actions',
    minWidth: 170,
  },
];

interface Row {
  id: string;
  name: string;
}

export function ProjectList() {
  const navigate = useNavigator();
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [flag, setFlag] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<Project[]>([]);
  const { setLoading } = useLoading();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const refresh = () => setFlag(!flag);

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

  useEffect(() => {
    (async () => {
      const route: RouterPaths = '/projects';
      if (location.pathname !== route) return;

      setLoading(true);
      try {
        setRows(await listProjects());
      } catch (error) {}
      setLoading(false);
    })();
  }, [location, flag]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      <Stack>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column, i) => {
                        if (column.id === 'actions') {
                          return (
                            <TableCell key={column.id}>
                              <Stack direction={'row'}>
                                <IconButton
                                  color="default"
                                  type="button"
                                  onClick={() => {
                                    navigate(row.id as RouterPaths, {
                                      readonly: true,
                                    });
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  color="primary"
                                  type="button"
                                  onClick={() => {
                                    navigate(row.id as RouterPaths, {
                                      readonly: false,
                                    });
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  type="button"
                                  onClick={() => {
                                    setProjectToDelete(row);
                                    setShowDeleteDialog(true);
                                    refresh();
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          );
                        }

                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.id === 'name' ? (
                              <>{value}</>
                            ) : column.id === 'status' ? (
                              getReadableStatus(value)
                            ) : (
                              <>{value}</>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Tooltip title="New Project" placement="left">
          <SpeedDial
            ariaLabel="New Record"
            sx={{ position: 'absolute', bottom: 32, right: 32 }}
            icon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
          />
        </Tooltip>
        <Outlet />
      </Stack>
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the project{' '}
          <strong>{projectToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={async () => {
              if (!projectToDelete) return;
              setLoading(true);
              try {
                await deleteProject(projectToDelete.id);
              } catch (error) {}
              setLoading(false);
              setShowDeleteDialog(false);
              refresh();
            }}
          >
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
