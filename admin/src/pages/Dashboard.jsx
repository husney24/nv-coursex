import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import { 
  School as CourseIcon,
  People as UserIcon,
  Category as CategoryIcon,
  Star as RatingIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  ShoppingCart as EnrollmentIcon,
  Comment as ReviewIcon,
  PersonAdd as NewUserIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, RadialBarChart, RadialBar 
} from 'recharts';
import './Dashboard.scss';

// SVG Patterns for card backgrounds
const CoursesPattern = () => (
  <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="courses-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10h20v1H0z" className="pattern-lines" />
        <path d="M10 0v20h1V0z" className="pattern-lines" />
      </pattern>
    </defs>
    <rect width="150" height="150" fill="url(#courses-pattern)" />
  </svg>
);

const UsersPattern = () => (
  <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="users-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="1" className="pattern-dots" />
      </pattern>
    </defs>
    <rect width="150" height="150" fill="url(#users-pattern)" />
  </svg>
);

const CategoriesPattern = () => (
  <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="categories-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M0 15C5 15 10 10 15 10S25 15 30 15" className="pattern-waves" />
        <path d="M0 5C5 5 10 0 15 0S25 5 30 5" className="pattern-waves" />
        <path d="M0 25C5 25 10 20 15 20S25 25 30 25" className="pattern-waves" />
      </pattern>
    </defs>
    <rect width="150" height="150" fill="url(#categories-pattern)" />
  </svg>
);

const RatingPattern = () => (
  <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="rating-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M15 0l4.5 11.5L30 15l-10.5 4.5L15 30l-4.5-10.5L0 15l10.5-4.5z" className="pattern-dots" />
      </pattern>
    </defs>
    <rect width="150" height="150" fill="url(#rating-pattern)" />
  </svg>
);

// Custom chart components
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Activity item component
const ActivityItem = ({ type, title, time, icon: Icon }) => (
  <motion.div 
    className="dashboard__activity-list-item"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className={`dashboard__activity-list-item-icon dashboard__activity-list-item-icon--${type}`}>
      <Icon />
    </div>
    <div className="dashboard__activity-list-item-content">
      <div className="dashboard__activity-list-item-content-title" dangerouslySetInnerHTML={{ __html: title }} />
      <div className="dashboard__activity-list-item-content-meta">
        <TimeIcon />
        <span>{time}</span>
      </div>
    </div>
    <div className="dashboard__activity-list-item-time">
      {time.includes('ago') ? time : 'Just now'}
    </div>
  </motion.div>
);

// Stat card component
const StatCard = ({ title, value, icon: Icon, color, trend, loading, background: Background }) => (
  <motion.div 
    className="dashboard__stats-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="dashboard__stats-card-content">
      <div className={`dashboard__stats-card-icon dashboard__stats-card-icon--${color}`}>
        <Icon />
      </div>
      <div className="dashboard__stats-card-title">{title}</div>
      {loading ? (
        <div className="dashboard__stats-card-value shimmer" style={{ width: '80px', height: '40px' }}></div>
      ) : (
        <div className="dashboard__stats-card-value">{value}</div>
      )}
      {trend && (
        <div className={`dashboard__stats-card-trend dashboard__stats-card-trend--${trend.direction}`}>
          {trend.direction === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
          <span>{trend.value}% {trend.direction === 'up' ? 'increase' : 'decrease'}</span>
        </div>
      )}
    </div>
    <div className="dashboard__stats-card-background">
      <Background />
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    coursesCount: 0,
    usersCount: 0,
    categoriesCount: 0,
    averageRating: 0,
    enrollmentStats: [],
    recentActivity: [],
    topCourses: [],
    categoryDistribution: [],
    userGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/stats');
        
        // Enhance the data with trends (in a real app, this would come from the API)
        const enhancedData = {
          ...response.data,
          trends: {
            courses: { direction: 'up', value: 12 },
            users: { direction: 'up', value: 8 },
            categories: { direction: 'up', value: 5 },
            rating: { direction: 'down', value: 2 }
          },
          // Sample data for additional charts
          topCourses: [
            { name: 'Web Development', students: 120, revenue: 5900 },
            { name: 'Data Science', students: 85, revenue: 4200 },
            { name: 'Mobile App Dev', students: 65, revenue: 3200 },
            { name: 'UI/UX Design', students: 45, revenue: 2200 },
            { name: 'Machine Learning', students: 35, revenue: 1700 }
          ],
          categoryDistribution: [
            { name: 'Development', value: 45 },
            { name: 'Business', value: 25 },
            { name: 'Design', value: 15 },
            { name: 'Marketing', value: 10 },
            { name: 'Other', value: 5 }
          ],
          userGrowth: [
            { name: 'Jan', users: 400 },
            { name: 'Feb', users: 500 },
            { name: 'Mar', users: 600 },
            { name: 'Apr', users: 800 },
            { name: 'May', users: 1000 },
            { name: 'Jun', users: 1200 }
          ],
          recentActivity: [
            { 
              type: 'enrollment', 
              title: 'New enrollment in <span>Web Development Bootcamp</span>', 
              time: '2 mins ago' 
            },
            { 
              type: 'course', 
              title: 'New course <span>Advanced React Patterns</span> created', 
              time: '1 hour ago' 
            },
            { 
              type: 'user', 
              title: '<span>John Smith</span> registered as a new instructor', 
              time: '3 hours ago' 
            },
            { 
              type: 'review', 
              title: 'New 5-star review for <span>Python for Beginners</span>', 
              time: '5 hours ago' 
            },
            { 
              type: 'enrollment', 
              title: '10 new enrollments in <span>UI/UX Masterclass</span>', 
              time: '1 day ago' 
            }
          ]
        };
        
        setStats(enhancedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format date for header
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Colors for charts
  const COLORS = ['#4361ee', '#7209b7', '#3a0ca3', '#f72585', '#10b981', '#0ea5e9'];

  if (loading && !stats.coursesCount) {
    return (
      <PageTransition>
        <div className="dashboard">
          <div className="dashboard__header">
            <h1 className="dashboard__header-title">Dashboard</h1>
            <p className="dashboard__header-subtitle">Loading your analytics data...</p>
          </div>

          <div className="dashboard__loading">
            <div className="dashboard__loading-spinner"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="dashboard">
          <div className="dashboard__header">
            <h1 className="dashboard__header-title">Dashboard</h1>
            <p className="dashboard__header-subtitle">There was a problem loading your data.</p>
          </div>

          <div className="dashboard__error">
            <div className="dashboard__error-message">
              <ErrorIcon />
              <span>{error}</span>
            </div>
          </div>

          <div className="dashboard__stats">
            {[
              { title: 'Total Courses', value: '—', icon: CourseIcon, color: 'courses', background: CoursesPattern },
              { title: 'Total Users', value: '—', icon: UserIcon, color: 'users', background: UsersPattern },
              { title: 'Categories', value: '—', icon: CategoryIcon, color: 'categories', background: CategoriesPattern },
              { title: 'Avg. Rating', value: '—', icon: RatingIcon, color: 'rating', background: RatingPattern },
            ].map((card, index) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                background={card.background}
                loading={false}
              />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  const statCards = [
    { 
      title: 'Total Courses', 
      value: stats.coursesCount.toLocaleString(), 
      icon: CourseIcon, 
      color: 'courses',
      trend: stats.trends?.courses,
      background: CoursesPattern
    },
    { 
      title: 'Total Users', 
      value: stats.usersCount.toLocaleString(), 
      icon: UserIcon, 
      color: 'users',
      trend: stats.trends?.users,
      background: UsersPattern
    },
    { 
      title: 'Categories', 
      value: stats.categoriesCount.toLocaleString(), 
      icon: CategoryIcon, 
      color: 'categories',
      trend: stats.trends?.categories,
      background: CategoriesPattern
    },
    { 
      title: 'Avg. Rating', 
      value: stats.averageRating?.toFixed(1) || '0.0', 
      icon: RatingIcon, 
      color: 'rating',
      trend: stats.trends?.rating,
      background: RatingPattern
    },
  ];

  return (
    <PageTransition>
      <div className="dashboard">
        <div className="dashboard__header">
          <h1 className="dashboard__header-title">Dashboard Overview</h1>
          <p className="dashboard__header-subtitle">Welcome back! Here's what's happening with your platform today.</p>
          <div className="dashboard__header-date">
            <CalendarIcon />
            <span>{formatDate(currentDate)}</span>
          </div>
        </div>

        {error && (
          <div className="dashboard__error">
            <div className="dashboard__error-message">
              <ErrorIcon />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="dashboard__stats">
          {statCards.map((card, index) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              trend={card.trend}
              loading={loading}
              background={card.background}
            />
          ))}
        </div>

        <div className="dashboard__charts">
          <motion.div 
            className="dashboard__charts-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="dashboard__charts-card-header">
              <h2 className="dashboard__charts-card-header-title">Course Enrollments</h2>
              <div className="dashboard__charts-card-header-actions">
                <button aria-label="Refresh data">
                  <RefreshIcon />
                </button>
                <button aria-label="More options">
                  <MoreIcon />
                </button>
              </div>
            </div>
            <div className="dashboard__charts-card-content">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.enrollmentStats}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4361ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="enrollments" 
                    name="Course Enrollments"
                    stroke="#4361ee" 
                    fillOpacity={1} 
                    fill="url(#colorEnrollments)" 
                    activeDot={{ r: 8 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            className="dashboard__charts-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="dashboard__charts-card-header">
              <h2 className="dashboard__charts-card-header-title">Category Distribution</h2>
              <div className="dashboard__charts-card-header-actions">
                <button aria-label="Refresh data">
                  <RefreshIcon />
                </button>
                <button aria-label="More options">
                  <MoreIcon />
                </button>
              </div>
            </div>
            <div className="dashboard__charts-card-content">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="dashboard__activity"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="dashboard__activity-header">
            <h2 className="dashboard__activity-header-title">Recent Activity</h2>
            <div className="dashboard__activity-header-actions">
              <button>
                <FilterIcon />
                Filter
              </button>
            </div>
          </div>
          <div className="dashboard__activity-list">
            {stats.recentActivity.map((activity, index) => (
              <ActivityItem
                key={index}
                type={activity.type}
                title={activity.title}
                time={activity.time}
                icon={
                  activity.type === 'enrollment' ? EnrollmentIcon :
                  activity.type === 'course' ? CourseIcon :
                  activity.type === 'user' ? NewUserIcon :
                  activity.type === 'review' ? ReviewIcon :
                  CourseIcon
                }
              />
            ))}
          </div>
        </motion.div>

        <div className="dashboard__performance">
          <motion.div 
            className="dashboard__performance-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="dashboard__performance-card-header">
              <h2 className="dashboard__performance-card-header-title">Top Performing Courses</h2>
            </div>
            <div className="dashboard__performance-card-content">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.topCourses}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="students" 
                    name="Students" 
                    fill="#4361ee" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            className="dashboard__performance-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="dashboard__performance-card-header">
              <h2 className="dashboard__performance-card-header-title">User Growth</h2>
            </div>
            <div className="dashboard__performance-card-content">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.userGrowth}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Users" 
                    stroke="#7209b7" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="dashboard__charts-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="dashboard__charts-card-header">
            <h2 className="dashboard__charts-card-header-title">Revenue Overview</h2>
            <div className="dashboard__charts-card-header-actions">
              <button aria-label="Download report">
                <DownloadIcon />
              </button>
              <button aria-label="More options">
                <MoreIcon />
              </button>
            </div>
          </div>
          <div className="dashboard__charts-card-content">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.enrollmentStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#4361ee" />
                <YAxis yAxisId="right" orientation="right" stroke="#f72585" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="enrollments" 
                  name="Enrollments" 
                  fill="#4361ee" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="revenue" 
                  name="Revenue ($)" 
                  fill="#f72585" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}