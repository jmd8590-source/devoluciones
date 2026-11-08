# GarantíasPro

Aplicación web para registrar compras y controlar los plazos de devolución y fechas de fin de garantía.

**Sitio web:** [https://devoluciones.jmd8590.workers.dev/](https://devoluciones.jmd8590.workers.dev/)  
**Autor y responsable:** Jesús Mendoza Domínguez (<jemendo90@gmail.com>)

---

## Características

- **Control de devoluciones:** Cálculo automático de días restantes según la fecha de compra y los días permitidos por el comercio.
- **Seguimiento de garantías:** Registro de años de cobertura, qué cubre y qué no cubre cada fabricante.
- **Avisos de vencimiento:** Indicadores visuales automáticos para compras próximas a vencer.
- **Adjunto de tickets:** Almacenamiento seguro de fotografías del ticket de compra.
- **Modo Demo sin registro:** Permite probar todas las funcionalidades en local (`sessionStorage`) sin necesidad de crear cuenta.
- **Modo Cuenta con sincronización:** Inicio de sesión y registro mediante Supabase Auth y PostgreSQL con políticas estrictas de seguridad por fila (**Row Level Security - RLS**).

---

## Arquitectura y Seguridad

- **Frontend:** HTML5, CSS3 moderno (vanilla con variables CSS), JavaScript ES2021 sin dependencias de frameworks externos.
- **Backend & Base de datos:** [Supabase](https://supabase.com/) alojado en la Unión Europea (`eu-west-1`, Irlanda).
- **Aislamiento de datos:** Políticas RLS en PostgreSQL donde cada usuario autenticado solo puede consultar, insertar, modificar o borrar sus propias filas (`auth.uid() = user_id`).
- **Almacenamiento de archivos:** Bucket privado en Supabase Storage con URLs temporales firmadas y expiración automática.
- **Políticas de contenido (CSP):** Directivas `Content-Security-Policy` estrictas en todas las páginas HTML para prevenir XSS y ataques de inyección.
- **Privacidad y RGPD:** Política de privacidad completa disponible en [privacidad.html](public/privacidad.html).

---

## Estructura del proyecto

```text
├── public/                 # Lo único que se publica en la web
│   ├── index.html          # Panel principal (requiere sesión o demo)
│   ├── auth.html           # Acceso, registro y recuperación de contraseña
│   ├── privacidad.html / cookies.html / 404.html
│   ├── tokens.css          # Colores de los temas claro y oscuro
│   ├── styles.css · auth.css · site.css · ui.css
│   ├── theme.js            # Conmutador de modo claro / oscuro
│   ├── tour.js             # Tour guiado (botón «Guía», arriba a la derecha)
│   ├── app.js · auth.js · session.js · push.js · urgent-alert.js …
│   └── _headers · _redirects (cabeceras de seguridad de Cloudflare)
├── supabase/               # Migraciones SQL y Edge Functions (no se publican)
├── scripts/                # build (ofuscación), check y servidor local
├── tests/                  # Pruebas de extremo a extremo (Playwright)
└── .github/workflows/ci.yml
```

## Desarrollo

```bash
npm ci
npm run serve      # http://localhost:8787 con el código sin ofuscar
npm run check      # sintaxis, secretos y ficheros que no deben publicarse
npm test           # compila (ofuscado) y prueba en escritorio y móvil
```

## Despliegue

- `npm run build` copia `public/` a `dist/` y ofusca el JavaScript propio.
- Cloudflare Workers Builds (conectado al repositorio) ejecuta `npm run build` y publica:
  - cualquier rama distinta de `main` → URL de pruebas `https://<rama>-devoluciones.jmd8590.workers.dev`
    (por ejemplo `mejora/fase1-seguridad-ux` → `mejora-fase1-seguridad-ux-devoluciones…`);
  - `main` → producción.
- GitHub Actions ejecuta comprobaciones y pruebas en cada cambio. Recomendado: exigir
  que el check `test` pase antes de fusionar en `main`.

---

## Licencia

Proyecto personal de código abierto desarrollado por Jesús Mendoza Domínguez. Prohibido el uso de la marca o suplantación con fines maliciosos.
