'use client'

import { AppBar, Toolbar, Button, Box, styled, Typography } from "@mui/material";
import Link from "next/link"; // Import Link from Next.js
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/navigation';



const StickyAppBar = styled(AppBar)`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  z-index: 1000; /* Ensure it's above other content */
`;

export default function Navbar() {
  const router = useRouter();
  return (
    <>
      <StickyAppBar position="static" sx={{ backgroundColor: 'gray' }}>
        <Toolbar >
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%'}} px={2}>
            <Button color="inherit" sx={{ width: '50%'}} onClick={()=>{
              router.push('/')
            }}> 
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
                <Typography sx={{ mt: 1, color: 'white', textTransform: 'none' }}><HomeRoundedIcon fontSize="large"/></Typography>
                <Typography sx={{fontSize: '0.75rem', color: 'white', textTransform: 'none'}} >Home</Typography>
              </Box>
            </Button>
            
            <Button color="inherit"  sx={{ width: '50%'}} onClick={()=>{
              router.push('/account')
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={{ mt: 1, color: 'white', textTransform: 'none' }}><SettingsIcon fontSize="large"/></Typography>
                <Typography sx={{fontSize: '0.75rem', color: 'white', textTransform: 'none'}}>Settings</Typography>
              </Box>
            </Button>
            
          </Box>
        </Toolbar>
      </StickyAppBar>
    </>
  );
}