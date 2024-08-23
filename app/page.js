"use client";
import Image from "next/image";
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { AppBar, Button, Container, Toolbar, Typography, Box } from "@mui/material";
import Head from 'next/head';
import {useRouter} from 'next/navigation'


export default function Home() {
  const router = useRouter()
  const { isSignedIn } = useUser();

  const handleSubmit = async () => {
    if (!isSignedIn) {
      alert('You need to sign in to continue.');
    }

    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000'
      },
    })
  
    const chechoutSessionJson = await checkoutSession.json()
    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message)
      return
    }
    const stripe = await getStripe()
    const error = await stripe.redirectToCheckout({
      sessionId: chechoutSessionJson.id,
    })
  
    if (error) {
      console.warn(error.message)
    }
  }

  const handleGetStarted = () => {
    if (isSignedIn) {
      // If the user is signed in, show an alert
      alert('You are already signed in. Please choose to subscribe or continue with the free version.');
    } else {
      // If the user is not signed in, navigate to the sign-up page
      router.push('/sign-up');
    }
  };

  const handleFreeVersion = () => {
    if (isSignedIn) {
      router.push('/generate')
    } else {
      alert('You need to sign in to continue.');
    }
  }


  return (
    <Container maxWidth="lg">
      <Head>
        <title>Flashcard Generator</title>
        <meta name="description" content="Create Flash cards" />
      </Head>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>Flashcard Generator</Typography>
          <SignedOut>
            <Button color="inherit" href="sign-in">Login</Button>
            <Button color="inherit" href="sign-up">Sign up</Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="h2">Welcome to flashcard generator</Typography>
        <Typography variant="h5">Need help making flashcards? We're here to help</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleGetStarted}>Get Started</Button>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          padding: 2,
        }}
      >
        <Button variant="outlined" color="secondary" onClick={handleFreeVersion}>Use Free Version</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>Subscribe</Button>
      </Box>
    </Container>
  );
}