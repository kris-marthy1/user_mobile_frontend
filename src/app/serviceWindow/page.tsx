'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '../navbar/page';
import { Box, Typography, Button, TextField } from '@mui/material';

// Utility function to format labels
const formatLabel = (snakeCase: string) => {
  return snakeCase
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Separate component to handle search params
function ServiceWindowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableName = searchParams.get('page'); // Get table name from query params

  const [columns, setColumns] = useState<string[]>([]);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const tableName = searchParams.get('page')?.toLowerCase(); // Get table name from query params
    const fetchQueueStatus = async () => {
      try {
        const userIP = await axios.get('http://localhost:8001/fetch-ip');


        const response = await axios.post('http://localhost:8001/queue-status', {
          table_name: tableName
        });
        
        if (response.data.in_queue) {
          if(tableName === response.data.window_name.toLowerCase() && userIP.data.ip_address === response.data.ip_address  ){
            alert(`You are already in queue for ${tableName}`)
            router.push(`/queuePage?page=${tableName}`);
          }
        } 
      } catch (err) {
        console.log('No queue active for the user')
      }
    };

    if (tableName) {
      fetchQueueStatus();
    }
  }, [tableName, router]);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await axios.post('http://localhost:8001/get-table-columns', {
          table_name: tableName,
        });
        setColumns(response.data);
        // Initialize form data with empty strings for each column
        const initialFormData = response.data.reduce((acc: any, column: string) => {
          acc[column] = '';
          return acc;
        }, {});
        setFormData(initialFormData);
      } catch {
        setError('Failed to fetch table columns. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [tableName]);

  const handleInputChange = (column: string, value: string) => {
    setFormData((prev) => ({ ...prev, [column]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8001/join-queue', {
        table_name: tableName,
        ...formData,
      });

      if (response.data.message === 'Joined queue successfully') {
        alert('Data submitted successfully!');
        router.push(`/queuePage?page=${tableName}`);
      } else {
        alert('Failed to join queue. Please try again.');
      }
    } catch (error) {
      alert('Failed to submit data. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ textAlign: 'center', marginTop: 6 }}>
          <Typography variant="h5">Loading form...</Typography>
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

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          gap: 2,
        }}
      >
        <Typography variant="h5" mb={6} mt={2}>
          Fill out the form for: {tableName}
        </Typography>

        {columns.filter(column => column !== 'queue_id').map((column) => (
          <TextField
            key={column}
            label={formatLabel(column)}
            value={formData[column]}
            onChange={(e) => handleInputChange(column, e.target.value)}
            variant="outlined"
            fullWidth
          />
        ))}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ marginTop: '1rem' }}
        >
          Submit
        </Button>
      </Box>
    </>
  );
}

export default function ServiceWindow() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServiceWindowContent />
    </Suspense>
  );
}