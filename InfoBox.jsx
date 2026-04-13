import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box, Container, Grid, Chip, Divider, Paper, Skeleton } from '@mui/material';
import "./InfoBox.css"
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import SunnyIcon from '@mui/icons-material/Sunny';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';

export default function InfoBox ({info, isLoading = false}) {
 const INT_URL = "https://images.unsplash.com/photo-1580049904360-a9c3b79f86ff?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGR1c3R5JTIwd2VhdGhlcnxlbnwwfHwwfHx8MA%3D%3D"

 const HOT_URL = "https://images.unsplash.com/photo-1743738049563-520b88442d04?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGhvdCUyMHdlYXRoZXJ8ZW58MHx8MHx8fDA%3D"

 const COLD_URL = "https://images.unsplash.com/photo-1603726574752-a85dc808deab?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNvbGQlMjB3ZWF0aGVyfGVufDB8fDB8fHww";

 const RAIN_URL = "https://images.unsplash.com/photo-1536329978773-2f8ac431f330?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHJhaW55JTIwd2VhdGhlcnxlbnwwfHwwfHx8MA%3D%3D";

 const getWeatherIcon = () => {
    if (info.humidity > 80) return <ThunderstormIcon sx={{ fontSize: 40, color: '#6366f1' }} />;
    if (info.temp > 15) return <SunnyIcon sx={{ fontSize: 40, color: '#f59e0b' }} />;
    return <AcUnitIcon sx={{ fontSize: 40, color: '#06b6d4' }} />;
 };

 const getBackgroundImage = () => {
    if (info.humidity > 80) return RAIN_URL;
    if (info.temp > 15) return HOT_URL;
    return COLD_URL;
 };

 const getWeatherColor = () => {
    if (info.humidity > 80) return '#6366f1';
    if (info.temp > 15) return '#f59e0b';
    return '#06b6d4';
 };

    return (
        <Container maxWidth="md" sx={{ py: 1 }}>
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #dce3ec',
                    backgroundColor: '#ffffff',
                    transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
                    '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 16px 30px rgba(15, 76, 129, 0.12)',
                        borderColor: '#c7d8ea',
                    },
                }}
            >
                {isLoading ? (
                    <>
                        <Box
                            sx={{
                                height: { xs: 170, md: 210 },
                                p: 2,
                                bgcolor: '#edf3f9',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                gap: 1,
                            }}
                        >
                            <Skeleton variant="text" width="58%" height={38} />
                            <Skeleton variant="text" width="38%" height={24} />
                        </Box>

                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#f8fbff',
                                        }}
                                    >
                                        <Skeleton variant="circular" width={28} height={28} />
                                        <Skeleton variant="text" width="52%" height={40} sx={{ mt: 1 }} />
                                        <Skeleton variant="text" width="66%" />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#f8fbff',
                                        }}
                                    >
                                        <Skeleton variant="circular" width={28} height={28} />
                                        <Skeleton variant="text" width="52%" height={40} sx={{ mt: 1 }} />
                                        <Skeleton variant="text" width="66%" />
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2.5 }} />

                            <Grid container spacing={1.5}>
                                <Grid item xs={12} sm={4}>
                                    <Skeleton variant="rounded" height={36} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Skeleton variant="rounded" height={36} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Skeleton variant="rounded" height={36} />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </>
                ) : (
                <>
                <CardMedia
                    sx={{
                        height: { xs: 170, md: 210 },
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.45))',
                        }
                    }}
                    image={getBackgroundImage()}
                    title={`${info.city} weather`}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            zIndex: 1,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            p: 1,
                            transition: 'transform 220ms ease',
                            '.MuiCard-root:hover &': {
                                transform: 'scale(1.08)',
                            },
                        }}
                    >
                        {getWeatherIcon()}
                    </Box>

                    <Box
                        sx={{
                            position: 'absolute',
                            left: 16,
                            bottom: 14,
                            zIndex: 1,
                        }}
                    >
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, textTransform: 'capitalize' }}>
                            {info.city}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'capitalize' }}>
                            {info.weather}
                        </Typography>
                    </Box>
                </CardMedia>

                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#f8fbff',
                                    textAlign: 'center',
                                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 10px 18px rgba(15, 76, 129, 0.1)',
                                    },
                                }}
                            >
                                <ThermostatIcon sx={{ fontSize: 28, color: '#0f4c81' }} />
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f4c81', mt: 0.5, fontSize: { xs: '1.85rem', sm: '2.1rem' } }}>
                                    {Math.round(info.temp)}°C
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Current temperature
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#f8fbff',
                                    textAlign: 'center',
                                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 10px 18px rgba(15, 76, 129, 0.1)',
                                    },
                                }}
                            >
                                <AirIcon sx={{ fontSize: 28, color: '#0f4c81' }} />
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f4c81', mt: 0.5, fontSize: { xs: '1.85rem', sm: '2.1rem' } }}>
                                    {Math.round(info.feelsLike)}°C
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Feels like
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2.5 }} />

                    <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={4}>
                            <Chip
                                icon={<OpacityIcon />}
                                label={`Humidity: ${info.humidity}%`}
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    borderColor: getWeatherColor(),
                                    color: getWeatherColor(),
                                    borderRadius: 2,
                                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 8px 14px rgba(0, 0, 0, 0.08)',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Chip
                                icon={<ThermostatIcon />}
                                label={`Min: ${Math.round(info.tempMin)}°C`}
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    borderRadius: 2,
                                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 8px 14px rgba(0, 0, 0, 0.08)',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Chip
                                icon={<ThermostatIcon />}
                                label={`Max: ${Math.round(info.tempMax)}°C`}
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    borderRadius: 2,
                                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 8px 14px rgba(0, 0, 0, 0.08)',
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                </>
                )}
            </Card>
        </Container>
    );
}