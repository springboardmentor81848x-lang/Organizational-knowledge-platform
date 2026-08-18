import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, LinearProgress, Chip,
  Card, CardContent, Alert, CircularProgress
} from '@mui/material';
import api from '../../api/axiosConfig';

const EmployeeGapAnalysis = () => {
  const [gaps, setGaps] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const res = await api.get('/analytics/my/skill-gaps');
        const data = res.data || [];
        setGaps(data);
        const total = data.length;
        const high = data.filter(g => g.priority === 'HIGH').length;
        const medium = data.filter(g => g.priority === 'MEDIUM').length;
        const low = data.filter(g => g.priority === 'LOW').length;
        setSummary({ total, high, medium, low });
      } catch (err) {
        if (err.response?.status === 404) setError('No active job role assigned.');
        else setError('Unable to load skill gaps.');
      } finally {
        setLoading(false);
      }
    };
    fetchGaps();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="info">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>My Skill Gaps</Typography>
      {gaps.length === 0 ? (
        <Alert severity="success">No skill gaps found! You're meeting all requirements.</Alert>
      ) : (
        <>
          {summary && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h4">{summary.total}</Typography><Typography color="textSecondary">Total Gaps</Typography></CardContent></Card></Grid>
              <Grid item xs={6} sm={3}><Card sx={{ borderTop: '4px solid #EF4444' }}><CardContent><Typography variant="h4" color="#EF4444">{summary.high}</Typography><Typography color="textSecondary">High</Typography></CardContent></Card></Grid>
              <Grid item xs={6} sm={3}><Card sx={{ borderTop: '4px solid #F59E0B' }}><CardContent><Typography variant="h4" color="#F59E0B">{summary.medium}</Typography><Typography color="textSecondary">Medium</Typography></CardContent></Card></Grid>
              <Grid item xs={6} sm={3}><Card sx={{ borderTop: '4px solid #10B981' }}><CardContent><Typography variant="h4" color="#10B981">{summary.low}</Typography><Typography color="textSecondary">Low</Typography></CardContent></Card></Grid>
            </Grid>
          )}
          {gaps.map((gap, idx) => (
            <Paper key={idx} sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>{gap.skillName}</Typography>
                <Chip label={gap.priority} color={gap.priority === 'HIGH' ? 'error' : gap.priority === 'MEDIUM' ? 'warning' : 'info'} />
              </Box>
              <Typography variant="body2" color="textSecondary">{gap.gapType}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <LinearProgress variant="determinate" value={100 - gap.gapPercentage} sx={{ flex: 1, height: 10, borderRadius: 5 }} />
                <Typography variant="body2" fontWeight={600}>{gap.gapPercentage}% Gap</Typography>
              </Box>
            </Paper>
          ))}
        </>
      )}
    </Box>
  );
};
export default EmployeeGapAnalysis;