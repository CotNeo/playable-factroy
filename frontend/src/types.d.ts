// This file helps TypeScript locate our modules
declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';

// React components
declare module './pages/Home' {
  import React from 'react';
  const Home: React.FC;
  export default Home;
}

declare module './pages/Login' {
  import React from 'react';
  const Login: React.FC;
  export default Login;
}

declare module './pages/Register' {
  import React from 'react';
  const Register: React.FC;
  export default Register;
} 