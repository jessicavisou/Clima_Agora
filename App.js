import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      // Etapa 1: Converter o nome da cidade em coordenadas (usando a API do Open-Meteo)
      const geoResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );

      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        throw new Error('Cidade não encontrada.');
      }

      const { latitude, longitude } = geoResponse.data.results[0];

      // Etapa 2: Buscar os dados de clima para as coordenadas
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      setWeatherData(weatherResponse.data.current_weather);
    } catch (err) {
      setError(err.message || 'Erro ao buscar dados de clima.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clima Agora</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o nome da cidade"
        value={city}
        onChangeText={setCity}
      />

      <Button title="Consultar Clima" onPress={fetchWeather} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        weatherData && (
          <View style={styles.weatherContainer}>
            <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
            <Text style={styles.wind}>Vento: {weatherData.windspeed} km/h</Text>
            <Text style={styles.condition}>Condições: {weatherData.weathercode}</Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  loader: {
    marginVertical: 20,
  },
  weatherContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  wind: {
    fontSize: 16,
    marginVertical: 5,
  },
  condition: {
    fontSize: 16,
    marginVertical: 5,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
});
