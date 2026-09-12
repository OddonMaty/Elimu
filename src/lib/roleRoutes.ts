import { UserRole } from '../types';

export const getDefaultRouteForRole = (role: UserRole | string): string => {
  switch (role) {
    case 'direction':
      return '/direction';
    case 'secretariat':
      return '/secretariat/students';
    case 'teacher':
      return '/teacher/attendance';
    case 'tresorerie':
      return '/finance';
    case 'proviseur':
      return '/proviseur';
    case 'parent':
      return '/parent';
    case 'superadmin':
      return '/admin';
    default:
      return '/';
  }
};
