import React from 'react';
import { Card, CardContent, Box, Typography, IconButton } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, trendValue }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1A2E', mt: 0.5 }}>
              {value}
            </Typography>
            {trend && (
              <Typography variant="caption" sx={{ color: trend === 'up' ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </Typography>
            )}
          </Box>
          <IconButton sx={{ backgroundColor: `${color}15`, color: color, '&:hover': { backgroundColor: `${color}25` } }}>
            {icon}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;