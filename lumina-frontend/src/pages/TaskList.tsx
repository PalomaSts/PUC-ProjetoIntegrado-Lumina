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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { RouterPaths, useNavigator } from '../AppRouter';
import { useLoading } from '../contexts/LoadingContext';
import { Task } from '../schemas/Task';
import { deleteTask, listTasks } from '../services/Task.service';
import { listProjects } from '../services/Project.service';
import { Project } from '../schemas/Project';

interface Column {
  id: 'id' | 'title' | 'status' | 'priority' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  element?: any;
}

const columns: readonly Column[] = [
  { id: 'title', label: 'Name', minWidth: 170 },
  { id: 'status', label: 'Status', minWidth: 120 },
  { id: 'priority', label: 'Priority', minWidth: 100 },
  {
    id: 'actions',
    label: 'Actions',
    minWidth: 170,
  },
];

interface Row {
  id: string;
  title: string;
}

export function TaskList() {
  const navigate = useNavigator();
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [flag, setFlag] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<Task[]>([]);
  const { setLoading } = useLoading();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);

  const refresh = () => setFlag(!flag);

  useEffect(() => {
    (async () => {
      const route: RouterPaths = '/tasks';
      if (location.pathname !== route) return;

      setLoading(true);
      try {
        let tasks = await listTasks();

        if (statusFilter) {
          tasks = tasks.filter((t) => t.status === statusFilter);
        }
        if (priorityFilter) {
          tasks = tasks.filter((t) => t.priority === priorityFilter);
        }
        if (projectFilter) {
          tasks = tasks.filter((t) => t.projectId === projectFilter);
        }

        setRows(tasks);

        const allProjects = await listProjects();
        setProjects(allProjects.filter((p) => p.status !== 'cancelled'));
      } catch (error) {}
      setLoading(false);
    })();
  }, [location, flag, statusFilter, priorityFilter, projectFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
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

  const getReadablePriority = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      default:
        return priority;
    }
  };

  return (
    <Stack>
      <Stack direction="row" spacing={2} mb={2}>
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Priorities</MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="new">New</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="paused">Paused</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>

        <Select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Projects</MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="outlined"
          onClick={() => {
            setStatusFilter('');
            setPriorityFilter('');
            setProjectFilter('');
          }}
        >
          Clear Filters
        </Button>
      </Stack>
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
              .filter((row) => {
                return (
                  (!priorityFilter || row.priority === priorityFilter) &&
                  (!statusFilter || row.status === statusFilter) &&
                  (!projectFilter || row.projectId === projectFilter)
                );
              })
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
                                  setSelectedTaskId(row.id);
                                  setConfirmDialogOpen(true);
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
                          <>
                            {column.id === 'status'
                              ? getReadableStatus(value)
                              : column.id === 'priority'
                                ? getReadablePriority(value)
                                : value}
                          </>
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
      <Tooltip title="New Task" placement="left">
        <SpeedDial
          ariaLabel="New Record"
          sx={{ position: 'absolute', bottom: 32, right: 32 }}
          icon={<AddIcon />}
          onClick={() => navigate('/tasks/new')}
        />
      </Tooltip>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this task? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={async () => {
              if (!selectedTaskId) return;
              setConfirmDialogOpen(false);
              setLoading(true);
              try {
                await deleteTask(selectedTaskId);
                refresh();
              } catch (error) {
                console.error(error);
              }
              setLoading(false);
              setSelectedTaskId(null);
            }}
          >
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
      <Outlet />
    </Stack>
  );
}
