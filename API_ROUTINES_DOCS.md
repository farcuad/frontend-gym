# Documentación de Endpoints - Sistema de Rutinas

Todos los endpoints requieren el token de autenticación (JWT) en los headers para inyectar automáticamente el `gym_id` y validar la sesión.

> **Importante sobre Seguridad (Roles):** Las rutas que modifican datos de ejercicios y rutinas (POST, PUT, DELETE), así como las asignaciones, están protegidas con el middleware `isTrainerOrAdmin` y requieren que el usuario logueado tenga rol de `"trainer"`, `"admin"` o `"super_admin"`.

---

## 1. Ejercicios (La Biblioteca)

### Crear un Ejercicio
- **Método**: `POST`
- **Ruta**: `/exercises`
- **Body (JSON)**:
```json
{
  "name": "Press de Banca Plano",
  "muscle_group": "Pecho"
}
```

### Obtener todos los Ejercicios
- **Método**: `GET`
- **Ruta**: `/exercises`
- **Respuesta**: Lista de todos los ejercicios registrados para el gimnasio.

### Obtener Ejercicio por ID
- **Método**: `GET`
- **Ruta**: `/exercises/:id`

### Actualizar Ejercicio
- **Método**: `PUT`
- **Ruta**: `/exercises/:id`
- **Body (JSON)** *(todos los campos son opcionales)*:
```json
{
  "name": "Press de Banca Inclinado con Mancuernas",
  "muscle_group": "Pecho Superior"
}
```

### Eliminar Ejercicio
- **Método**: `DELETE`
- **Ruta**: `/exercises/:id`

---

## 2. Rutinas (Cabecera)

### Crear una Rutina
- **Método**: `POST`
- **Ruta**: `/routines`
- **Body (JSON)**:
```json
{
  "name": "Rutina de Hipertrofia Fuerza - Pecho",
  "description": "Rutina enfocada en ganar fuerza y volumen muscular para nivel intermedio."
}
```
*Nota: El `trainer_id` se extrae automáticamente si quien la crea tiene rol 'trainer'.*

### Obtener todas las Rutinas
- **Método**: `GET`
- **Ruta**: `/routines`
- **Respuesta**: Array de rutinas con su información básica.

### Obtener Rutina por ID (Con Detalle de Ejercicios)
- **Método**: `GET`
- **Ruta**: `/routines/:id`
- **Respuesta**: Trae la cabecera de la rutina y **todos sus ejercicios asociados** ordenados por `sort_order`.

### Actualizar Rutina
- **Método**: `PUT`
- **Ruta**: `/routines/:id`
- **Body (JSON)**:
```json
{
  "name": "Rutina de Hipertrofia - Pecho y Tríceps"
}
```

### Eliminar Rutina
- **Método**: `DELETE`
- **Ruta**: `/routines/:id`

---

## 3. Detalle de Ejercicios en la Rutina (La Receta)

### Agregar Ejercicio a la Rutina
- **Método**: `POST`
- **Ruta**: `/routines/:routineId/exercises`
- **Body (JSON)**:
```json
{
  "exercise_id": 1,
  "sets": 4,
  "reps": "10-12",
  "rest_time_seconds": 90,
  "sort_order": 1
}
```

### Eliminar Ejercicio de la Rutina
- **Método**: `DELETE`
- **Ruta**: `/routines/exercises/:id`
*Nota: El parámetro `id` es el ID del registro en `routine_exercises`, no el ID del ejercicio.*

---

## 4. Asignación a Clientes (Client Routines)

### Asignar Rutina a Cliente
- **Método**: `POST`
- **Ruta**: `/client-routines`
- **Body (JSON)**:
```json
{
  "client_id": 15,
  "routine_id": 3,
  "start_date": "2026-05-01", 
  "end_date": "2026-06-01",
  "is_active": true
}
```
*Nota: `start_date` es opcional (por defecto toma el día actual). Al asignar una nueva rutina, automáticamente se desactivan las anteriores del cliente.*

### Obtener Rutina Activa del Cliente
- **Método**: `GET`
- **Ruta**: `/client-routines/active/:clientId`
- **Respuesta**: Retorna un objeto con la información de la asignación (`assignment`) y el objeto completo de la rutina (`routine`), incluyendo sus ejercicios.
*Nota de Seguridad: Este endpoint es **exclusivo** para usuarios con rol de `"client"`. El sistema valida que el `:clientId` de la ruta coincida con el ID del token del cliente logueado.*

### Desactivar Rutina Manualmente
- **Método**: `PUT`
- **Ruta**: `/client-routines/:id/deactivate`
- **Respuesta**: Cambia el estado de la asignación a `is_active = false`.

---

## 5. Autenticación de Clientes

### Login para Clientes (Acceso al Dashboard)
- **Método**: `POST`
- **Ruta**: `/client/login`
- **Body (JSON)**:
```json
{
  "cedula": "V-12345678",
  "gym_id": 1
}
```
*Nota: El `gym_id` es opcional, pero si la cédula existe en más de un gimnasio, el sistema pedirá el `gym_id` de forma obligatoria. Si el login es exitoso, retorna un Token JWT con el rol `"client"`.*


Para crear usuarios, el json es así
{
    "name": "Trainer 1",
    "email": "trainer1@gmail.com",
    "password": "12345678",
    "role": "trainer"
}
