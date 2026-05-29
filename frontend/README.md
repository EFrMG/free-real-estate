# Free Real Estate. Frontend

This is the frontend application for the Free Real Estate project, built as a modern Single-Page Application.

## Technology Stack

- **Framework**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Interactive Animations**: [Motion for React](https://motion.dev/)
- **Maps**: [react-leaflet](https://react-leaflet.js.org/).
- **Icons**: [react-icons](https://react-icons.github.io/react-icons/).

## Structure

- `app/components/*`: Reusable UI components organized per route, or general components such as for layout at the root.
- `app/routes/`: Individual page components.
- `app/css/`: Tailwind customizations and global styles.
- `app/data/`: Mock data to use as seed and legacy types (constantly migrating to API).
- `app/hooks/`: Custom React hooks.
- `app/utils/`: Like hooks but without state or other hooks.
