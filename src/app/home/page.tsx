'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Router instance for navigation
import axios from 'axios';
import Navbar from '../navbar/page';
import { Box, Typography, Button } from '@mui/material';

export default function Home() {
  const router = useRouter();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://localhost:8001/get-tables'); // Laravel endpoint
        setTables(response.data); // Directly set tables
      } catch(error){
        setError('Failed to fetch tables. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleTableClick = (tableName: string) => {
    router.push(`/serviceWindow?page=${tableName}`);
  };

  if (loading) {
    return (
      <Box sx={{ padding: '1rem', textAlign: 'center' }}>
        <Typography variant="h6">Loading tables...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: '1rem', textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error
        </Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ padding: '1rem' }}>
        <Typography variant="h4" gutterBottom>
          Queue Track
        </Typography>
        <Typography variant="body1" gutterBottom>
          Welcome! Choose purpose for queueing:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tables.map(
            (
              table: { window_id: number; window_name: string; status: string },
              index: number
            ) => {
              const isDisabled = table.status !== 'open'; // Disable if status is not 'open'
              const backgroundColor =
                table.status === 'hold'
                  ? '#fffec8'
                  : table.status === 'closed'
                  ? '#ffdadb'
                  : 'transparent';

              return (
                <Button
                  key={table.window_id}
                  onClick={() =>
                    !isDisabled && handleTableClick(table.window_name)
                  }
                  variant="outlined"
                  disabled={isDisabled}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    padding: '1rem',
                    border: '1px solid #ffeb3d',
                    borderRadius: '4px',
                    color: 'black',
                    backgroundColor,
                    '&:hover': {
                      backgroundColor: isDisabled ? backgroundColor : '#ADD8E6',
                      color: 'black',
                      border: isDisabled
                        ? '1px solid #ffeb3d'
                        : '2px solid #fff176',
                    },
                  }}
                >
                  {table.window_name} ({table.status})
                </Button>
              );
            }
          )}
        </Box>
      </Box>
    </>
  );
}
