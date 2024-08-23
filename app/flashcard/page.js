'use client'
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "../firebase/config"
import { Button, Box, Card, CardActionArea, CardContent, Typography, Grid } from "@mui/material";
import {collection, doc, getDoc, getDocs} from 'firebase/firestore'
import { useSearchParams } from "next/navigation"

export default function flashcard() {
    const {isSignedIn, isLoaded, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const router = useRouter()

    const searchParams = useSearchParams()
    const search = searchParams.get('id')

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id]
        }))
    }
    
    useEffect(() => {
        async function getFlashcard() {
            if (!search || !user) {
                return
            }
            const colRef = collection(doc(collection(db, 'users'), user.id), search)
            const docs = await getDocs(colRef)
            const flashcards = []
            docs.forEach((doc)=>{
                flashcards.push({id: doc.id, ...doc.data()})
            })
            setFlashcards(flashcards)
        }
        getFlashcard()
    }, [user, search])

    if (!isLoaded || !isSignedIn) {
        return <div>Loading...</div>
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Flashcards
            </Typography>
            <Grid container spacing={4} sx={{ mt: 4 }}>
                {/* Flashcards Display */}
                {flashcards.length > 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ width: '100%', height: '300px', p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Generated Flashcards
                            </Typography>
                            <Grid container spacing={4}>
                                {flashcards.map((flashcard, index) => (
                                    <Grid item key={index} xs={12} sm={6} md={4}>
                                        <Card sx={{ width: '100%', maxHeight: '250px', minHeight: '250px' }}>
                                            <CardActionArea onClick={() => handleCardClick(index)}>
                                                <CardContent sx={{ pt: 8 }}>
                                                    <Box sx={{
                                                        perspective: '1000px',
                                                        position: 'relative', // Ensure the box is relative to position the children absolutely
                                                        width: '100%',
                                                        height: '100%',
                                                        transformStyle: 'preserve-3d', // Required for 3D transformations
                                                        // Vendor prefixes
                                                        WebkitPerspective: '1000px',
                                                        MozPerspective: '1000px',
                                                        msPerspective: '1000px',
                                                    }}>
                                                        {/* Container for the front and back faces */}
                                                        <Box sx={{
                                                            transition: 'transform 0.6s',
                                                            transformStyle: 'preserve-3d',
                                                            position: 'relative',
                                                            width: '100%',
                                                            height: '100%',
                                                            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                            transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                            // Vendor prefixes
                                                            WebkitTransform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                            MozTransform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                            msTransform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                        }}>
                                                            {/* Front Face */}
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                width: '100%',
                                                                height: '100%',
                                                                backfaceVisibility: 'hidden', // Hide the front face when flipped
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                padding: 2,
                                                                boxSizing: 'border-box',
                                                                backgroundColor: '#fff', // Set background color if needed
                                                                // Vendor prefixes for better compatibility
                                                                WebkitBackfaceVisibility: 'hidden',
                                                                MozBackfaceVisibility: 'hidden',
                                                                msBackfaceVisibility: 'hidden',
                                                            }}>
                                                                <Typography variant='h5' component="div">
                                                                    {flashcard.front}
                                                                </Typography>
                                                            </Box>
    
                                                            {/* Back Face */}
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                width: '100%',
                                                                height: '100%',
                                                                backfaceVisibility: 'hidden', // Hide the back face when not flipped
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                padding: 2,
                                                                boxSizing: 'border-box',
                                                                backgroundColor: '#fff', // Set background color if needed
                                                                transform: 'rotateY(180deg)', // Rotate the back face to be visible when flipped
                                                                // Vendor prefixes for better compatibility
                                                                WebkitTransform: 'rotateY(180deg)',
                                                                MozTransform: 'rotateY(180deg)',
                                                                msTransform: 'rotateY(180deg)',
                                                                WebkitBackfaceVisibility: 'hidden',
                                                                MozBackfaceVisibility: 'hidden',
                                                                msBackfaceVisibility: 'hidden',
                                                            }}>
                                                                <Typography variant='h5' component="div">
                                                                    {flashcard.back}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );    

}