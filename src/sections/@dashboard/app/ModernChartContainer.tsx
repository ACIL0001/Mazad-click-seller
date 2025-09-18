import React, { useState, useEffect } from 'react';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Fade,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { BaseOptionChart } from '../../../components/chart';
import SellerStatsService, { ChartData } from '../../../api/sellerStatsService';
import Iconify from '../../../components/Iconify';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
  backdropFilter: 'blur(24px)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const TimeframeButton = styled(Button)(({ theme, active }) => ({
  borderRadius: 16,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: theme.spacing(1.2, 2.4),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  minWidth: 48,
  ...(active && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: 'scale(1.05)',
  }),
  '&:hover': {
    transform: active ? 'scale(1.05)' : 'scale(1.02)',
    boxShadow: active 
      ? `0 8px 20px ${alpha(theme.palette.primary.main, 0.5)}`
      : `0 4px 12px ${alpha(theme.palette.action.hover, 0.2)}`,
  },
}));

// ----------------------------------------------------------------------

interface ModernChartContainerProps {
  title: string;
  subtitle?: string;
  chartType: 'auction' | 'offer';
  defaultTimeframe?: number;
}

export default function ModernChartContainer({
  title,
  subtitle,
  chartType,
  defaultTimeframe = 6,
}: ModernChartContainerProps) {
  const theme = useTheme();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(defaultTimeframe);

  const timeframeOptions = [
    { value: 3, label: '3M' },
    { value: 6, label: '6M' },
    { value: 12, label: '1Y' },
  ];

  useEffect(() => {
    // Add a delay to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      fetchChartData();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [timeframe, chartType]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      let data: ChartData;
      
      if (chartType === 'auction') {
        data = await SellerStatsService.getAuctionTimeSeries(timeframe);
      } else {
        data = await SellerStatsService.getOfferTimeSeries(timeframe);
      }
      
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Set empty data on error
      setChartData({
        labels: [],
        datasets: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getChartOptions = () => {
    if (!chartData) return {};

    return {
      ...BaseOptionChart(),
      chart: {
        type: 'line',
        height: 350,
        zoom: { enabled: false },
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000,
        },
        background: 'transparent',
      },
      stroke: {
        width: 4,
        curve: 'smooth',
        lineCap: 'round',
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: chartData.datasets.map(dataset => alpha(dataset.color, 0.1)),
          inverseColors: false,
          opacityFrom: 0.8,
          opacityTo: 0.1,
          stops: [0, 100],
        },
      },
      markers: {
        size: 6,
        strokeWidth: 3,
        strokeColors: '#fff',
        hover: {
          size: 8,
        },
      },
      xaxis: {
        categories: chartData.labels,
        labels: {
          style: {
            colors: theme.palette.text.secondary,
            fontSize: '13px',
            fontWeight: 500,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: theme.palette.text.secondary,
            fontSize: '13px',
            fontWeight: 500,
          },
          formatter: (value) => {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value.toString();
          },
        },
      },
      grid: {
        borderColor: alpha(theme.palette.divider, 0.1),
        strokeDashArray: 0,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        offsetY: -10,
        labels: {
          colors: theme.palette.text.primary,
          useSeriesColors: false,
        },
        markers: {
          width: 12,
          height: 12,
          radius: 6,
        },
      },
      tooltip: {
        theme: theme.palette.mode,
        fillSeriesColor: false,
        style: {
          fontSize: '13px',
          fontFamily: theme.typography.fontFamily,
        },
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
          const label = w.globals.labels[dataPointIndex];
          const seriesName = w.globals.seriesNames[seriesIndex];
          const color = w.globals.colors[seriesIndex];
          
          return `
            <div style="
              background: ${theme.palette.background.paper};
              border: 1px solid ${alpha(theme.palette.divider, 0.2)};
              border-radius: 12px;
              padding: 12px 16px;
              box-shadow: 0 8px 32px ${alpha(theme.palette.common.black, 0.12)};
              font-family: ${theme.typography.fontFamily};
            ">
              <div style="
                display: flex;
                align-items: center;
                margin-bottom: 8px;
              ">
                <div style="
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: ${color};
                  margin-right: 8px;
                "></div>
                <span style="
                  font-weight: 600;
                  color: ${theme.palette.text.primary};
                  font-size: 13px;
                ">${seriesName}</span>
              </div>
              <div style="
                font-size: 14px;
                font-weight: 700;
                color: ${theme.palette.text.primary};
                margin-bottom: 4px;
              ">${data.toLocaleString()}</div>
              <div style="
                font-size: 12px;
                color: ${theme.palette.text.secondary};
              ">${label}</div>
            </div>
          `;
        },
      },
      colors: chartData.datasets.map(dataset => dataset.color),
      dataLabels: {
        enabled: false,
      },
    };
  };

  const getChartSeries = () => {
    if (!chartData) return [];

    return chartData.datasets.map(dataset => ({
      name: dataset.name,
      data: dataset.data,
    }));
  };

  return (
    <Fade in timeout={800}>
      <StyledCard>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4,
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 0.5,
                  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    opacity: 0.8,
                    fontWeight: 500,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>

            {/* Timeframe Selector */}
            <ButtonGroup variant="outlined" size="small">
              {timeframeOptions.map((option) => (
                <TimeframeButton
                  key={option.value}
                  active={timeframe === option.value}
                  onClick={() => setTimeframe(option.value)}
                >
                  {option.label}
                </TimeframeButton>
              ))}
            </ButtonGroup>
          </Box>

          {/* Chart Content */}
          <Box sx={{ position: 'relative', minHeight: 350 }}>
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 350,
                  gap: 2,
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <CircularProgress size={40} />
                </motion.div>
                <Typography variant="body2" color="text.secondary">
                  Loading chart data...
                </Typography>
              </Box>
            ) : chartData && chartData.datasets.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ReactApexChart
                  type="line"
                  series={getChartSeries()}
                  options={getChartOptions()}
                  height={350}
                />
              </motion.div>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 350,
                  gap: 2,
                }}
              >
                <Iconify 
                  icon="mdi:chart-line-variant" 
                  width={64} 
                  height={64} 
                  sx={{ color: 'text.disabled' }} 
                />
                <Typography variant="h6" color="text.secondary">
                  No Data Available
                </Typography>
                <Typography variant="body2" color="text.disabled" textAlign="center">
                  {chartType === 'auction' 
                    ? 'Create your first auction to see performance data'
                    : 'Start receiving offers to see trends'
                  }
                </Typography>
              </Box>
            )}
          </Box>

          {/* Summary Stats */}
          {chartData && chartData.datasets.length > 0 && (
            <Box sx={{ 
              mt: 4, 
              pt: 3, 
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              display: 'flex',
              gap: 4,
              flexWrap: 'wrap',
              justifyContent: 'space-around',
            }}>
              {chartData.datasets.map((dataset, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(dataset.color, 0.05)} 0%, ${alpha(dataset.color, 0.02)} 100%)`,
                    border: `1px solid ${alpha(dataset.color, 0.1)}`,
                    minWidth: 120,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(dataset.color, 0.15)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: dataset.color,
                      display: 'inline-block',
                      mr: 1.5,
                      boxShadow: `0 2px 8px ${alpha(dataset.color, 0.3)}`,
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    {dataset.name}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 800,
                      background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${dataset.color} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {dataset.data.reduce((sum, val) => sum + val, 0).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </StyledCard>
    </Fade>
  );
}
