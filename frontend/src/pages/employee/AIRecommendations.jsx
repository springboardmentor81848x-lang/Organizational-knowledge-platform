import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Chip, Button, Alert,
  Card, CardContent, LinearProgress, CircularProgress, Stepper, Step, StepLabel
} from '@mui/material';
import { Link } from '@mui/icons-material';
import api from '../../api/axiosConfig';

const EmployeeAIRecommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.post('/api/ai/recommendation');
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 404) setError('No active job role assigned.');
        else setError('Unable to load AI recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="info">{error}</Alert>;
  if (!data) return <Alert severity="info">No recommendations available.</Alert>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>AI Recommendations</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>Learning Path</Typography>
        <Stepper orientation="vertical" sx={{ mt: 2 }}>
          {data.learningPath?.map((phase, idx) => (
            <Step key={idx} active>
              <StepLabel>
                <Typography variant="subtitle1" fontWeight={600}>{phase.title}</Typography>
                <Typography variant="caption" color="textSecondary">{phase.duration}</Typography>
                <Typography variant="body2">{phase.reason}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Priority Skill Gaps</Typography>
        <Grid container spacing={2}>
          {data.priorityGaps?.map((gap, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" fontWeight={600}>{gap.skillName}</Typography>
                    <Chip label={gap.priority} color={gap.priority === 'HIGH' ? 'error' : 'warning'} size="small" />
                  </Box>
                  <LinearProgress variant="determinate" value={100 - gap.gapPercentage} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                  <Typography variant="caption">{gap.gapPercentage}% Gap - {gap.gapType}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Recommended Courses</Typography>
        <Grid container spacing={2}>
          {data.recommendedCourses?.map((course, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>{course.trainingName}</Typography>
                  <Typography variant="body2" color="textSecondary">{course.provider} • {course.duration}</Typography>
                  <Chip label={course.level} size="small" sx={{ mt: 1 }} />
                  <Button variant="contained" startIcon={<Link />} href={course.courseUrl} target="_blank" sx={{ mt: 2, bgcolor: '#7C3AED' }}>View Course</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};
export default EmployeeAIRecommendations;\