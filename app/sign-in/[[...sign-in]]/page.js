import React from 'react';
import {AppBar, Toolbar, Typography, Button, Box} from '@mui/material';
import Link from 'next/link';
import { SignInButton, SignUpButton, SignIn } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Flashcard Generator
          </Typography>
          <Button color="inherit">
            <Link href="/sign-in" passHref> Login</Link>
          </Button>
          <Button color="inherit">
            <Link href="/sign-up" passHref> Sign Up</Link>
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        display= 'flex'
        flexDirection= 'column'
        alignItems='center'
        justifyContent='center'
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Sign In
        </Typography>
        <SignIn />
      </Box>
    </div>
  );
}
