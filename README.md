# 🛠️ Guía para Implementar Recuperación de Contraseña en React y React Native

## 📌 Introducción
Esta guía explica cómo manejar la recuperación de contraseña en un sistema con un backend en Node.js + Express y un frontend en React (web) y React Native (móvil). 

El backend envía un enlace al correo del usuario con un token, y el frontend debe manejar este enlace, permitiendo al usuario cambiar su contraseña.

## 🌍 1. Flujo de Recuperación de Contraseña

### 1.1 Enviar la Solicitud de Restablecimiento
El usuario ingresa su correo en un formulario y el backend genera un token de recuperación, enviando un enlace con el token por correo.

#### Endpoint en el Backend:
```plaintext
POST http://localhost:7777/api/request-password-reset
Content-Type: application/json

{
    "email": "usuario@example.com"
}
```

El backend envía un enlace al correo del usuario que apunta al frontend:

```plaintext
http://localhost:3000/reset-password/{token}   # Para web (React)
exp://127.0.0.1:19000/reset-password/{token}  # Para móvil (React Native en Expo)
```

## 🖥️ 2. Implementación en React (Web)

### 📌 2.1 Crear una Ruta en el Frontend
En `App.js` (o donde manejes las rutas):

```jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";

function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:7777/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword: password })
        });
        const data = await response.json();
        setMessage(data.message || "Error al cambiar la contraseña");
    };

    return (
        <div>
            <h2>Restablecer Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Nueva Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Cambiar Contraseña</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
        </Router>
    );
}

export default App;
```

## 📱 3. Implementación en React Native (Móvil)

### 📌 3.1 Crear la Pantalla de Restablecimiento
En `ResetPasswordScreen.js`:

```jsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const ResetPasswordScreen = () => {
    const route = useRoute();
    const { token } = route.params;
    const [password, setPassword] = useState("");
    const navigation = useNavigation();

    const handleSubmit = async () => {
        const response = await fetch("http://localhost:7777/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword: password })
        });
        const data = await response.json();
        Alert.alert("Mensaje", data.message || "Error al cambiar la contraseña");
        if (response.ok) navigation.navigate("Login");
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Restablecer Contraseña</Text>
            <TextInput
                placeholder="Nueva Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ borderBottomWidth: 1, marginBottom: 20 }}
            />
            <Button title="Cambiar Contraseña" onPress={handleSubmit} />
        </View>
    );
};

export default ResetPasswordScreen;
```

### 📌 3.2 Agregar la Ruta en React Navigation
En `App.js`:

```jsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ResetPasswordScreen from "./ResetPasswordScreen";

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
```

## ✅ Conclusión
Ahora el sistema permite que el usuario primero solicite el restablecimiento de contraseña con su correo, reciba el enlace con el token y luego acceda al formulario para ingresar su nueva contraseña. 🚀
