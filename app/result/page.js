'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import getStripe from '../../utils/get-stripe'
import { useSearchParams } from "next/navigation";
import { Container, Typography, CircularProgress, Box, Alert } from '@mui/material';
const resultPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const session_id = searchParams.get('session_id')

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCheckoutSession = async () => {
            if (!session_id) return

            try {
                const res = await fetch(`/api/checkout_sessions?session_id=${session_id}`)
                const sessionData = await res.json()
                if (res.ok) {
                    setSession(sessionData)
                } else {
                    setError(sessionData.error)
                }
            } catch(err) {
                setError('error occured')
            }
            finally {
                setLoading(false)
            }
        }
        fetchCheckoutSession()
    }, [session_id])

    if (loading) {
        return (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
              }}
            >
              <CircularProgress />
            </Box>
          );
    }

    if (error) {
        return (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <Alert severity="error">{error}</Alert>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Please try again later.
            </Typography>
          </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
            {session.payment_status === 'paid' ? (
                <>
                    <Typography variant="h4" gutterBottom>
                        Thank You for Your Purchase!
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4 }}>
                        Your order was successful. You will receive your order details shortly.
                    </Typography>
                </>
            ) : (
                <Typography variant="h6" gutterBottom>
                    There was an issue with your payment. Please contact support if you believe this is a mistake.
                </Typography>
            )}
        </Container>
    );
}