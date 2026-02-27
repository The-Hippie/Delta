export interface Edificio {
  id: string;
  nombre: string;
  adminEmail: string;
  plan: 'gratis' | 'pro' | 'premium';
  // Objeto de restricciones para control manual
  restricciones: {
    bloqueado: boolean;
    puedeCambiarPlan: boolean;
    puedeCambiarPassword: boolean;
    accesoConfiguracion: boolean;
  };
  fechaRegistro: any;
}