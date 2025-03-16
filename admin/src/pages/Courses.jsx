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
  Rating,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import PageTransition from '../components/common/PageTransition';
import { format } from 'date-fns';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    instructor_id: '',
    duration: '',
    level: '',
    image_url: ''
  });

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await axios.get('/api/users/instructors');
      setInstructors(response.data);
    } catch (err) {
      console.error('Error fetching instructors:', err);
      setError('Failed to load instructors');
    }
  };

  const fetchCourses = async (search = '') => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/courses', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search,
        },
      });
      
      setCourses(response.data.courses);
      setTotalRows(response.data.pagination.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchInstructors();
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      fetchCourses(searchTerm);
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

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        price: course.price.toString(),
        category_id: course.category_id,
        instructor_id: course.instructor_id,
        duration: course.duration || '',
        level: course.level || '',
        image_url: course.image_url || ''
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        category_id: '',
        instructor_id: '',
        duration: '',
        level: '',
        image_url: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category_id: '',
      instructor_id: '',
      duration: '',
      level: '',
      image_url: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await axios.put(`/api/admin/courses/${editingCourse.id}`, formData);
      } else {
        await axios.post('/api/admin/courses', formData);
      }
      handleCloseDialog();
      fetchCourses(searchTerm);
      setError(null);
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err.response?.data?.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await axios.delete(`/api/admin/courses/${courseId}`);
      fetchCourses(searchTerm);
      setError(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
      <Box sx={{ 
        p: { xs: 1, sm: 2, md: 3 },
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3 
        }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            Courses Management
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <TextField
              placeholder="Search courses..."
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
              sx={{ 
                width: { xs: '100%', sm: 300 },
                minWidth: { sm: 200 }
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add Course
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ 
          width: '100%', 
          overflow: 'hidden',
          '& .MuiTableCell-root': {
            px: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.5 },
            '&:first-of-type': {
              pl: { xs: 1, sm: 2 }
            },
            '&:last-of-type': {
              pr: { xs: 1, sm: 2 }
            }
          }
        }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    minWidth: { xs: 200, sm: 250 }
                  }}>Title</TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', md: 'table-cell' }
                  }}>Instructor</TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', sm: 'table-cell' }
                  }}>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', sm: 'table-cell' }
                  }}>Students</TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', md: 'table-cell' }
                  }}>Rating</TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', lg: 'table-cell' }
                  }}>Created</TableCell>
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
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{course.title}</Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              maxWidth: { xs: 150, sm: 200, md: 300 },
                              display: { xs: '-webkit-box', md: 'block' },
                              WebkitLineClamp: { xs: 2, md: 1 },
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }} 
                          >
                            {course.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        display: { xs: 'none', md: 'table-cell' }
                      }}>{course.instructor_name}</TableCell>
                      <TableCell sx={{ 
                        display: { xs: 'none', sm: 'table-cell' }
                      }}>
                        <Chip
                          label={course.category_name}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatPrice(course.price)}</TableCell>
                      <TableCell sx={{ 
                        display: { xs: 'none', sm: 'table-cell' }
                      }}>{course.enrolled_students}</TableCell>
                      <TableCell sx={{ 
                        display: { xs: 'none', md: 'table-cell' }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating
                            value={course.average_rating}
                            precision={0.5}
                            size="small"
                            readOnly
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({course.review_count})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        display: { xs: 'none', lg: 'table-cell' }
                      }}>{formatDate(course.created_at)}</TableCell>
                      <TableCell>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          justifyContent: { xs: 'flex-end', sm: 'flex-start' }
                        }}>
                          <Tooltip title="Edit course">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(course)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={course.enrolled_students > 0 ? "Can't delete course with enrolled students" : "Delete course"}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteCourse(course.id)}
                                disabled={course.enrolled_students > 0}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
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
            sx={{
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                display: { xs: 'none', sm: 'block' }
              }
            }}
          />
        </Paper>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: 2, sm: 4 },
              width: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' }
            }
          }}
        >
          <DialogTitle>
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2
              }}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
                <TextField
                  fullWidth
                  label="Duration (e.g., '30 hours')"
                  name="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </Box>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2
              }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    label="Category"
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    label="Level"
                  >
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Instructor</InputLabel>
                <Select
                  value={formData.instructor_id}
                  onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                  label="Instructor"
                  required
                >
                  {instructors.map((instructor) => (
                    <MenuItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Image URL"
                name="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2 }
          }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingCourse ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageTransition>
  );
}