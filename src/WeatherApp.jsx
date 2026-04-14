 import SearchBox from './SearchBox';
 import InfoBox from './InfoBox';
 import "./Weather.css"
import { useState } from 'react';
import { Container, Typography, Box, ThemeProvider, createTheme, CssBaseline, Paper, Stack, Chip } from '@mui/material';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';

export default function WeatherApp(){
    const[weatherInfo , setWeatherInfo] = useState({
    city: "Delhi",
    feelsLike : 24.84,
    temp: 25.05,
    tempMin: 25.05,
    tempMax: 25.05,
    humidity:47,
    weather: "haze",
    })
    const[isLoading, setIsLoading] = useState(false);

    const appTheme = createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#0f4c81',
            },
            background: {
                default: '#f4f7fb',
                paper: '#ffffff',
            },
            text: {
                primary: '#1f2937',
                secondary: '#526071',
            }
        },
        typography: {
            fontFamily: '"Poppins", "Segoe UI", "Helvetica", "Arial", sans-serif',
            h2: {
                fontWeight: 700,
                fontSize: '2.2rem',
                '@media (max-width:600px)': {
                    fontSize: '1.8rem',
                },
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        background: 'linear-gradient(160deg, #f7fbff 0%, #eff4fb 50%, #f4faf5 100%)',
                        minHeight: '100vh',
                        margin: 0,
                        padding: 0,
                    },
                },
            },
        },
    });

    let updateInfo = (newinfo) => {
        setWeatherInfo(newinfo);

    }
    return(
        <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    py: { xs: 2.5, md: 5 },
                }}
            >
                <Container maxWidth="lg">
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.25, sm: 3.5, md: 4 },
                            borderRadius: 4,
                            border: '1px solid #d6e1ef',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 18px 40px rgba(20, 45, 70, 0.08)',
                            animation: 'fadeInUp 500ms ease',
                        }}
                    >
                    <Box
                        sx={{
                            mb: 3,
                            p: { xs: 2, sm: 2.5 },
                            borderRadius: 3,
                            background: 'linear-gradient(120deg, #0f4c81 0%, #2d6ea6 65%, #4d8cbf 100%)',
                            color: '#fff',
                        }}
                    >
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1.2}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            justifyContent="space-between"
                        >
                            <Typography
                                variant="h2"
                                component="h1"
                                sx={{
                                    color: '#ffffff',
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <WbSunnyOutlinedIcon sx={{ color: '#ffdc82', fontSize: { xs: '1.7rem', md: '2rem' } }} />
                                Weather App
                            </Typography>
                            <Chip
                                label={isLoading ? 'Updating weather...' : 'Live weather ready'}
                                size="small"
                                sx={{
                                    color: '#0f4c81',
                                    backgroundColor: '#fef3c7',
                                    fontWeight: 700,
                                }}
                            />
                        </Stack>
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                        <SearchBox updateInfo={updateInfo} onLoadingChange={setIsLoading} />
                        <InfoBox info={weatherInfo} isLoading={isLoading} />
                    </Box>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
         )
}