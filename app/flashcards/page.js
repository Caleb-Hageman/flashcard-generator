'use client'
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import { Button, Box, Card, CardActionArea, CardContent, Typography, Grid } from "@mui/material";
export default function flashcards() {
    const {isSignedIn, isLoaded, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const router = useRouter()

    useEffect(() => {
        async function getFlashcards() {
            if (!user) {
                return
            }
            const docRef = doc(collection(db, 'users'), user.id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || []
                setFlashcards(collections)
            } else {
                await setDoc(docRef, {flashcards: []})
            }
        }
        getFlashcards()
    }, [user])
    if (!isLoaded || !isSignedIn) {
        return <div>Loading...</div>
    }

    const handleCardClick = (id) => {
        router.push(`/flashcard?id=${id}`)
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Flashcards
            </Typography>
            {flashcards.length > 0 ? (
                <Grid container spacing={4}>
                    {flashcards.map((flashcard, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                            <Card sx={{ height: '200px', display: 'flex', flexDirection: 'column' }}>
                                <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                                    <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="h5" component="div" textAlign="center">
                                            {flashcard.name}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="h6" color="text.secondary">
                    No flashcards found. Create some to get started!
                </Typography>
            )}
        </Box>
    )
}
