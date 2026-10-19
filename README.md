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
- **Privacidad y RGPD:** Política de privacidad completa disponible en [privacidad.html](privacidad.html).

---

## Estructura del proyecto

```text
├── index.html          # Página pública de inicio (presentación y acceso)
├── auth.html           # Pantalla de acceso, registro y recuperación
├── app.html            # Panel principal de gestión de productos
├── privacidad.html     # Política de privacidad y aviso legal
├── site.css            # Estilos de páginas públicas
├── auth.css            # Estilos del panel de autenticación
├── styles.css          # Estilos del panel principal de usuario
├── icons.js            # Iconografía SVG uniforme
├── auth.js             # Lógica de login, registro y validaciones
├── session.js          # Verificación de sesión con Supabase
├── session-guard.js    # Guardia de acceso a app.html
├── supabase-client.js  # Cliente de conexión con Supabase
└── urgent-alert.js     # Detector y renderizador de alertas urgentes
```

---

## Licencia

Proyecto personal de código abierto desarrollado por Jesús Mendoza Domínguez. Prohibido el uso de la marca o suplantación con fines maliciosos.
