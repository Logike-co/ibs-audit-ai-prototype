# Audit-AI — HITL Auditoría Web (IBS)

Aplicación frontend de auditoría médica Human-in-the-Loop para la plataforma Audit-AI.

## Tecnologías Principales
- Angular 22.1+
- Tailwind CSS 4+
- Jest & Playwright (Testing)
- Storybook (Componentes UI)
- ESLint & Prettier
- Transloco (Internacionalización)
- Docker (Nginx)

## Inicialización de Proyecto

Para crear un nuevo proyecto a partir de esta plantilla en GitHub, haz clic en **Use this template**.

Luego en tu máquina local:
```bash
npm install
npm start
```

## Pruebas
- **Unit tests:** `npm run test`
- **E2E tests:** `npm run e2e`

## Compilación con Docker
```bash
docker build -t mi-app-angular .
docker run -p 8080:80 mi-app-angular
```
