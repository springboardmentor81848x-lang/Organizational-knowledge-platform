import React from 'react';
import {
  Grid, Paper, Typography, Box, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, Avatar
} from '@mui/material';
import {
  People, Business, Assessment, TrendingDown, School, Add,
  TrendingUp, Insights, Work, EmojiEvents
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import StatCard from '../../components/StatCard';

const COLORS = ['#7C3AED', '#A855F7', '#F59E0B', '#10B981', '#3B82F6'];

// ---------- MOCK DATA ----------
const stats = {
  totalEmployees: 120,
  departments: 5,
  activeUsers: 98,
  gapIndex: 23,
  assessments: 8
};

const deptGaps = [
  { name: 'Engineering', gap: 18 },
  { name: 'Product', gap: 12 },
  { name: 'Security', gap: 8 },
  { name: 'Data Science', gap: 25 },
  { name: 'Marketing', gap: 30 },
];

const skillDist = [
  { name: 'Cloud', value: 35 },
  { name: 'AI/ML', value: 28 },
  { name: 'Security', value: 22 },
  { name: 'Data', value: 15 },
];

const heatmapData = [
  { dept: 'Engineering', Cloud: 92, AI_ML: 85, Security: 78, Data: 94, Leadership: 65 },
  { dept: 'Product', Cloud: 74, AI_ML: 91, Security: 62, Data: 84, Leadership: 89 },
  { dept: 'Security', Cloud: 88, AI_ML: 72, Security: 98, Data: 82, Leadership: 74 },
  { dept: 'Data Science', Cloud: 95, AI_ML: 90, Security: 70, Data: 99, Leadership: 58 },
  { dept: 'Marketing', Cloud: 62, AI_ML: 74, Security: 55, Data: 68, Leadership: 82 },
];

const recentActivities = [
  { user: 'Jane Smith', action: 'Updated employee profile', time: '10 min ago' },
  { user: 'John Doe', action: 'Completed React assessment', time: '30 min ago' },
  { user: 'Maria Garcia', action: 'Added new training program', time: '1 hour ago' },
];

const trainingStats = { completed: 45, inProgress: 30, pending: 25 };

const getCellColor = (val: number) => {
  if (val < 60) return '#EF4444';
  if (val < 80) return '#F59E0B';
  return '#10B981';
};

const AdminDashboard: React.FC = () => {
  const skillKeys = Object.keys(heatmapData[0]).filter(k => k !== 'dept');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1A2E' }}>Admin Dashboard</Typography>
          <Typography variant="body1" sx={{ color: '#6B7280' }}>Organization-wide workforce intelligence.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: '#7C3AED' }}>Create User</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total Employees" value={stats.totalEmployees} icon={<People />} color="#7C3AED" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Departments" value={stats.departments} icon={<Business />} color="#A855F7" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Active Users" value={stats.activeUsers} icon={<People />} color="#10B981" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Gap Index" value={`${stats.gapIndex}%`} icon={<TrendingDown />} color="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Assessments" value={stats.assessments} icon={<Assessment />} color="#3B82F6" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Department Gap Analysis</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptGaps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="gap" fill="#7C3AED" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 380 }}>
            <Typography variant="h6" gutterBottom>Skill Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={skillDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                  {skillDist.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* HEATMAP */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>🔥 Department Competency Heatmap</Typography>
        <Typography variant="caption" color="textSecondary">
          Color legend: 🔴 High gap (&lt;60%), 🟡 Medium gap (60-80%), 🟢 Low gap (&gt;80%)
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Department</strong></TableCell>
                {skillKeys.map((skill) => (
                  <TableCell key={skill} align="center"><strong>{skill}</strong></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {heatmapData.map((row) => (
                <TableRow key={row.dept}>
                  <TableCell><strong>{row.dept}</strong></TableCell>
                  {skillKeys.map((skill) => {
                    const val = row[skill] || 0;
                    return (
                      <TableCell
                        key={skill}
                        align="center"
                        sx={{
                          backgroundColor: getCellColor(val),
                          color: val < 60 ? 'white' : 'black',
                          fontWeight: 500,
                          borderRadius: 1,
                          padding: '6px 4px',
                        }}
                      >
                        {val}%
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Chip label="High Gap (<60%)" sx={{ bgcolor: '#EF4444', color: 'white' }} />
          <Chip label="Medium Gap (60-80%)" sx={{ bgcolor: '#F59E0B', color: 'black' }} />
          <Chip label="Low Gap (>80%)" sx={{ bgcolor: '#10B981', color: 'white' }} />
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Activities</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow><TableCell>User</TableCell><TableCell>Action</TableCell><TableCell>Time</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((act, i) => (
                    <TableRow key={i}>
                      <TableCell><Avatar sx={{ width: 24, height: 24, bgcolor: '#7C3AED' }}>{act.user[0]}</Avatar> {act.user}</TableCell>
                      <TableCell>{act.action}</TableCell>
                      <TableCell><Chip label={act.time} size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Training Status</Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Completed</Typography><Typography>{trainingStats.completed}%</Typography></Box>
              <LinearProgress variant="determinate" value={trainingStats.completed} sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>In Progress</Typography><Typography>{trainingStats.inProgress}%</Typography></Box>
              <LinearProgress variant="determinate" value={trainingStats.inProgress} sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Pending</Typography><Typography>{trainingStats.pending}%</Typography></Box>
              <LinearProgress variant="determinate" value={trainingStats.pending} sx={{ mb: 1 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;