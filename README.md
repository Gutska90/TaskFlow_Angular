# TaskFlow

TaskFlow es una aplicación web de gestión de tareas desarrollada con Angular 17. Permite a los usuarios gestionar sus tareas diarias de manera eficiente y organizada.

## Características

- Autenticación de usuarios (registro, inicio de sesión, recuperación de contraseña)
- Gestión de tareas (crear, editar, eliminar, marcar como completadas)
- Filtrado y búsqueda de tareas
- Interfaz responsive con Bootstrap
- Almacenamiento local de datos

## Requisitos previos

- Node.js (versión 18 o superior)
- npm (versión 9 o superior)
- Angular CLI (versión 17)

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Instalar dependencias:
```bash
cd taskflow-angular
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
ng serve
```

4. Abrir el navegador en `http://localhost:4200`

## Usuario de prueba

Para probar la aplicación, puedes usar las siguientes credenciales:

- Usuario: test
- Contraseña: test123
- Email: test@example.com

## Estructura del proyecto

```
taskflow-angular/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── profile/
│   │   │   ├── recover/
│   │   │   └── register/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── task.service.ts
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── assets/
│   └── styles/
└── package.json
```

## Scripts disponibles

- `ng serve`: Inicia el servidor de desarrollo
- `ng build`: Compila el proyecto
- `ng test`: Ejecuta los tests unitarios
- `ng e2e`: Ejecuta los tests end-to-end

## Contribuir

1. Hacer fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Hacer commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
