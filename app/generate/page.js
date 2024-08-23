"use client";

import { useState, useEffect } from "react";
import { useUser, withAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getDoc, writeBatch, doc, collection, setDoc } from "firebase/firestore";
import { Container, Card, Box, Typography, Paper, TextField, Button, Grid, CardActionArea, CardContent, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from "@mui/material";
import { db } from "../firebase/config";

export default function Generate(){
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [open, setOpen] = useState(false)
    const [isPaid, setIsPaid] = useState(false);
    const router = useRouter();



    const handleSubmit = async () => {
        fetch('api/generate', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: text
        })
        .then((res) => res.json())
        .then((data) => setFlashcards(data))  // Corrected the arrow function syntax
        .catch((error) => console.error("Error:", error))
    }

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name')
            return
        }
        if (!isPaid) {
            alert('This is a paid feature')
            return
        }

        const batch = writeBatch(db)
        const userDocRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || []
            if (collections.find((f)=>f.name === name)) {
                alert("Flashcard collection with same name already exists")
                return
            } else {
                collections.push({name})
                batch.set(userDocRef, {flashcards: collections}, {merge: true})
            }
        } else {
            batch.set(userDocRef, {flashcards: [{name}]})
        }

        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcard)=>{
            const cardDocRef = doc(colRef)
            batch.set(cardDocRef, flashcard)
        }) 
        await batch.commit()
        handleClose()
        router.push('/flashcards')
    }

    useEffect(() => {
        if (!isSignedIn) {
          // Redirect to the sign-in page if the user is not signed in
          router.push('/sign-in');
        }

        const checkPaymentStatus = async () => {
            try {
                const res = await fetch('/api/checkPaymentStatus');
                const data = await res.json();
                setIsPaid(data.isPaid);
            } catch (error) {
                console.error("Error checking payment status:", error);
            }
        };
        checkPaymentStatus();
      }, [isSignedIn, router]);
    
      // If the user is not signed in, don't render the page content
      if (!isSignedIn) {
        return null;
      }

    return(
        <Container maxWidth="md">
            <Box sx={{
                mt: 4, 
                mb: 6, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
            }}>
                <Typography variant="h4">Generate Flashcard</Typography>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                <Box
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <TextField
                        label="Enter text"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Box>
            </Paper>

                {/* Flashcards Display */}
                {flashcards.length > 0 && (
                    <Box sx={{ mt: 4, width: '100%', height: '300px', p: 2 }}>
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
                                                    //vendor prefix
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
                                                        //vendor prefix
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
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button variant="contained" color="secondary" onClick={handleOpen}>
                                Save
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Save Flashcard Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save Flashcard</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Enter name for flashcrads collection</DialogContentText>
                        <TextField
                        autoFocus
                        margin='dense'
                        label='collection name'
                        type='text'
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant='outlined'
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={saveFlashcards}>Save</Button>
                    </DialogActions>
            </Dialog>
        </Container>
    )
}