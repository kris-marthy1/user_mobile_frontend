'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
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
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import Navbar from '../navbar/page';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

type QueueSession = {
  ip_address: string;
  window_id: string;
  queue_id: string;
  id: number;
};

type EstimatedTime = {
  estimated_duration: number;
}
function ServiceWindowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableName = searchParams.get('page');

  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<EstimatedTime | null>(null);
  const [queueSession, setQueueSession] = useState<QueueSession | null>(null);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const fetchQueueStatus = async () => {
      try {
        const response = await axios.post('http://localhost:8001/queue-status', {
          table_name: tableName?.toLowerCase(),
        });
        setQueueSession(response.data.in_queue ? response.data : null);
      } catch {
        setQueueSession(null);
        router.push('/');
      }
    };
  
    const fetchEstimatedTime = async () => {
      try {
        const timeResponse = await axios.post('http://localhost:8001/duration', {
          table_name: tableName?.toLowerCase(),
        });
        setEstimatedTime(timeResponse.data.estimated_duration ? timeResponse.data : null);
      } catch {
        setError('Failed to fetch estimated time data.');
      }
    };
  
    const fetchTableData = async () => {
      try {
        const columnResponse = await axios.post('http://localhost:8001/get-table-columns', { table_name: tableName });
        const dataResponse = await axios.post('http://localhost:8001/get-table-data', { table_name: tableName });
        setColumns(columnResponse.data);
        setTableData(dataResponse.data);
      } catch {
        setError('Failed to fetch table data.');
      } finally {
        setLoading(false);
      }
    };
  
    if (tableName) {
      // Initial fetch
      fetchQueueStatus();
      fetchTableData();
      fetchEstimatedTime();
  
      // Polling every 2 seconds
      intervalId = setInterval(() => {
        fetchQueueStatus();
        fetchTableData();
        fetchEstimatedTime();
      }, 2000);
    }
  
    return () => {
      // Clear the interval on component unmount or when tableName changes
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [tableName, searchParams]); // Dependencies

  const handleExitQueue = async () => {
    try {
      await axios.post('http://localhost:8001/exit-queue', {
        sessionId: queueSession?.id,
        window_id: queueSession?.window_id,
        queue_id: queueSession?.queue_id,
        
      });
      alert('Exited Successfully.');
      router.push('/');
    } catch {
      alert('Failed to exit queue. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Box sx={{ textAlign: 'center', marginTop: 6 }}>
          <Typography variant="h4" color="error">
            Error
          </Typography>
          <Typography variant="body1">{error}</Typography>
        </Box>
      </>
    );
  }


  if (!queueSession) {
    return (
      <>
        <Navbar />
        <Box sx={{ textAlign: 'center', marginTop: 6 }}>
          <Typography variant="h4" color="error">
            You are not in the queue
          </Typography>
          <Button variant="contained" color="primary" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </Box>
      </>
    );
  }

  const currentRow = tableData[0] || {};
  const remainingRows = tableData.slice(1);

  return (
    <>
      <Navbar />
      <Box sx={{ padding: '1rem' }}>
        <Typography variant="h4" mb={3}>
          Queue for: {tableName}
        </Typography>

        <Box sx={{ marginBottom: '1rem' }}>
          <Button variant="contained" onClick={handleExitQueue}>
            Exit Queue
          </Button>
        </Box>

        {/* Highlight Box for Currently Processing */}
        <Card
          sx={{
            marginBottom: '1rem',
            backgroundColor: queueSession?.queue_id?.toString() === currentRow?.queue_id?.toString() ? 'lightyellow' : 'white',
          }}
        >
          <CardContent>
            <Typography variant="h6">Currently Processing</Typography>
            {Object.entries(currentRow)
              .filter(([key]) => !['created_at', 'updated_at'].includes(key))
              .map(([key, value]) => (
              <Typography key={key} variant="body1">
                {`${key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: ${value || 'N/A'}`}
              </Typography>
            ))}
          </CardContent>
        </Card>

        {/* Table for Remaining Queue Items */}
        {remainingRows.length > 0 ? (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                {columns.map((column) => (
                  <StyledTableCell key={column}>
                    {column.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                  </StyledTableCell>
                ))}
                    <StyledTableCell>Estimated Duration</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {remainingRows.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: queueSession?.queue_id?.toString() === row.queue_id.toString() ? 'lightyellow' : 'white',
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column}>{row[column] || 'N/A'}</TableCell>
                    ))}

                    <TableCell>{estimatedTime?.estimated_duration ? estimatedTime?.estimated_duration * (index + 1) : 5 * (index +1)} minutes</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No remaining items in the queue.
          </Typography>
        )}
      </Box>
    </>
  );
}

export default function ServiceWindow() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <CircularProgress />
        </Box>
      }
    >
      <ServiceWindowContent />
    </Suspense>
  );
}
