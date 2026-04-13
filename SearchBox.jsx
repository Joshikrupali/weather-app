import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Box, Container, Typography, Alert, Paper, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Explore } from '@mui/icons-material';
import "./Search.css"
import { useState } from 'react';
import { fetchWeatherByLocationParts } from './services/weatherService';

export default function SearchBox({updateInfo, onLoadingChange}){
    let[cityOrVillageName, setCityOrVillageName] = useState("");
    let[stateName, setStateName] = useState("");
    let[countryName, setCountryName] = useState("");
    let[error, setError] = useState("");
    let[isLoading, setIsLoading] = useState(false);

    let handleCityVillageChange = (evt) => {
        setCityOrVillageName(evt.target.value);
    }

    let handleStateChange = (evt) => {
        setStateName(evt.target.value);
    }

    let handleCountryChange = (evt) => {
        setCountryName(evt.target.value);
    }

    let searchLocation = async (cityName, state, country) => {
        if (!cityName.trim() && !state.trim() && !country.trim()) {
            setError("Location not found");
            return;
        }

        setError("");
        setIsLoading(true);
        onLoadingChange?.(true);

        try {
            let newinfo = await fetchWeatherByLocationParts(cityName, state, country);
            updateInfo(newinfo)
            setCityOrVillageName("")
            setStateName("")
            setCountryName("")
        }
        catch(err){
            setError(err.message || "Location not found")
        } finally {
            setIsLoading(false);
            onLoadingChange?.(false);
        }
    }

    let handlesubmit = async (evt) => {
        evt.preventDefault();

        if (isLoading) {
            return;
        }

        await searchLocation(cityOrVillageName, stateName, countryName);
    }

    return (
        <Container maxWidth="md" sx={{ py: 1 }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2.5,
                    border: '1px solid #dce3ec',
                    backgroundColor: '#f7fbff',
                    transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 28px rgba(15, 76, 129, 0.08)',
                        borderColor: '#c5d3e5',
                    },
                }}
            >
                <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                        mb: 2,
                        color: 'text.primary',
                        fontWeight: 600,
                        textAlign: 'left'
                    }}
                >
                    Search weather by place
                </Typography>
                <form onSubmit={handlesubmit}>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <TextField
                            id="cityVillageName"
                            label="City / Village Name"
                            variant="outlined"
                            value={cityOrVillageName}
                            onChange={handleCityVillageChange}
                            fullWidth
                            placeholder="Enter City/ Village Name"
                            disabled={isLoading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Explore sx={{ color: '#5b6b7f' }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#ffffff',
                                    transition: 'box-shadow 180ms ease, border-color 180ms ease',
                                    '&.Mui-focused': {
                                        boxShadow: '0 0 0 4px rgba(15, 76, 129, 0.12)',
                                    },
                                },
                            }}
                        />

                        <TextField
                            id="stateName"
                            label="State Name"
                            variant="outlined"
                            value={stateName}
                            onChange={handleStateChange}
                            fullWidth
                            placeholder="Enter State Name"
                            disabled={isLoading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Explore sx={{ color: '#5b6b7f' }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#ffffff',
                                    transition: 'box-shadow 180ms ease, border-color 180ms ease',
                                    '&.Mui-focused': {
                                        boxShadow: '0 0 0 4px rgba(15, 76, 129, 0.12)',
                                    },
                                },
                            }}
                        />

                        <TextField
                            id="countryName"
                            label="Country Name"
                            variant="outlined"
                            value={countryName}
                            onChange={handleCountryChange}
                            fullWidth
                            placeholder="Enter Country Name"
                            disabled={isLoading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Explore sx={{ color: '#5b6b7f' }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#ffffff',
                                    transition: 'box-shadow 180ms ease, border-color 180ms ease',
                                    '&.Mui-focused': {
                                        boxShadow: '0 0 0 4px rgba(15, 76, 129, 0.12)',
                                    },
                                },
                            }}
                        />

                        <Button
                            variant="contained"
                            type="submit"
                            startIcon={<SearchIcon />}
                            disabled={isLoading}
                            sx={{
                                borderRadius: 2,
                                py: 1.1,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                transition: 'transform 180ms ease, box-shadow 180ms ease',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 10px 24px rgba(15, 76, 129, 0.22)',
                                },
                            }}
                        >
                            {isLoading ? 'Fetching weather...' : 'Get temperature'}
                        </Button>

                        {error && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                </form>
            </Paper>
        </Container>
    )
}
