import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Stepper, Step, StepLabel, Chip, Alert, CircularProgress } from '@mui/material';
import api from '../../api/axiosConfig';

const EmployeeLearningPath = () => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        const res = await api.post('/api/ai/recommendation');
        setPhases(res.data.learningPath || []);
      } catch (err) {
        setError('Unable to load learning path.');
      } finally {
        setLoading(false);
      }
    };
    fetchLearningPath();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>My Learning Path</Typography>
      {error && <Alert severity="info">{error}</Alert>}
      {phases.length === 0 ? (
        <Alert severity="info">No learning path generated yet.</Alert>
      ) : (
        <Paper sx={{ p: 4 }}>
          <Stepper orientation="vertical">
            {phases.map((phase, idx) => (
              <Step key={idx} active>
                <StepLabel>
                  <Typography variant="h6" fontWeight={600}>{phase.title}</Typography>
                  <Chip label={phase.duration} size="small" color="primary" sx={{ mt: 1 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>{phase.reason}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}
    </Box>
  );
};
export default EmployeeLearningPath;