import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';
import PageTransition from '../components/common/PageTransition';
import { format } from 'date-fns';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchUsers = async (search = '') => {
    try {
      setLoading(true);
      console.log('Fetching users with params:', { page: page + 1, limit: rowsPerPage, search });
      
      const response = await axios.get('/api/admin/users', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search,
        },
      });
      
      console.log('Users API Response:', response.data);
      
      if (!response.data.users || !Array.isArray(response.data.users)) {
        throw new Error('Invalid response format from server');
      }

      setUsers(response.data.users);
      setTotalRows(response.data.pagination.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 500);
    setSearchTimeout(timeout);
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [page, rowsPerPage, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      console.log('Toggling user status:', { userId, currentStatus });
      
      await axios.patch(`/api/admin/users/${userId}/status`, {
        status: currentStatus === 'active' ? 'blocked' : 'active',
      });
      
      console.log('Status updated successfully');
      fetchUsers(searchTerm);
      setError(null);
    } catch (err) {
      console.error('Error updating user status:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <PageTransition>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Users Management
          </Typography>
          <TextField
            placeholder="Search users..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Courses</TableCell>
                  <TableCell>Reviews</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {user.avatar ? (
                            <Avatar src={user.avatar} alt={user.name} />
                          ) : (
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            {user.bio && (
                              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }} noWrap>
                                {user.bio}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status || 'active'}
                          color={(user.status || 'active') === 'active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={user.last_enrollment ? `Last enrolled: ${formatDate(user.last_enrollment)}` : 'No enrollments'}>
                          <span>{user.enrolled_courses || 0}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={user.last_review ? `Last review: ${formatDate(user.last_review)}` : 'No reviews'}>
                          <span>{user.reviews_count || 0}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            user.role === 'admin'
                              ? "Admin users can't be blocked"
                              : (user.status || 'active') === 'active'
                              ? 'Block user'
                              : 'Unblock user'
                          }
                        >
                          <span>
                            <IconButton
                              onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                              color={(user.status || 'active') === 'active' ? 'error' : 'success'}
                              disabled={user.role === 'admin'}
                            >
                              {(user.status || 'active') === 'active' ? (
                                <BlockIcon />
                              ) : (
                                <CheckCircleIcon />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalRows}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </PageTransition>
  );
}