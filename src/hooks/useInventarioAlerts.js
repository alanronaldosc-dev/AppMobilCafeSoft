import { useEffect, useRef } from 'react';
import {
  solicitarPermisosNotificaciones,
  enviarNotificacionBajoStock,
  enviarNotificacionCaducidad,
} from '../services/notificationService';
import { getInsumosBajoStock } from '../services/inventarioService';
import api from '../config/api';

// Días de anticipación para alertar caducidad
// Ponlo en 400 mientras pruebas, el Té chai caduca en ~365 días
const DIAS_ALERTA_CADUCIDAD = 400;
// Intervalo de revisión (5 minutos)
const INTERVALO_REVISION_MS = 5 * 60 * 1000;

function obtenerInsumosProximosACaducar(insumos) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date();
  limite.setDate(hoy.getDate() + DIAS_ALERTA_CADUCIDAD);
  limite.setHours(23, 59, 59, 999);

  return insumos.filter((insumo) => {
    if (!insumo.caducidad) return false;
    const fechaCaducidad = new Date(insumo.caducidad);
    return fechaCaducidad >= hoy && fechaCaducidad <= limite;
  });
}

export function useInventarioAlerts() {
  const intervalRef = useRef(null);
  const ultimaAlertaStockRef = useRef(null);
  const ultimaAlertaCaducidadRef = useRef(null);

  async function revisarInventario() {
    try {
      console.log('🔍 Revisando inventario para alertas...');

      // 1. Bajo stock
      const insumosBajoStock = await getInsumosBajoStock();
      console.log('📦 Insumos bajo stock encontrados:', insumosBajoStock.length);

      if (insumosBajoStock.length > 0) {
        const clave = insumosBajoStock.map((i) => i.id).sort().join(',');
        if (clave !== ultimaAlertaStockRef.current) {
          ultimaAlertaStockRef.current = clave;
          await enviarNotificacionBajoStock(insumosBajoStock);
        } else {
          console.log('ℹ️ Bajo stock: misma lista que la última alerta, no se repite');
        }
      }

      // 2. Caducidades
      const response = await api.get('/inventario');
      const todos = response.data;
      const proximosACaducar = obtenerInsumosProximosACaducar(todos);
      console.log('📅 Insumos próximos a caducar:', proximosACaducar.length);

      if (proximosACaducar.length > 0) {
        const clave = proximosACaducar.map((i) => i.id).sort().join(',');
        if (clave !== ultimaAlertaCaducidadRef.current) {
          ultimaAlertaCaducidadRef.current = clave;
          await enviarNotificacionCaducidad(proximosACaducar);
        } else {
          console.log('ℹ️ Caducidad: misma lista que la última alerta, no se repite');
        }
      }

      console.log('✅ Revisión de inventario completada');
    } catch (error) {
      console.error('❌ Error revisando inventario para alertas:', error);
    }
  }

  useEffect(() => {
    let activo = true;

    async function iniciar() {
      console.log('🚀 Iniciando sistema de alertas de inventario...');
      const permiso = await solicitarPermisosNotificaciones();

      if (!permiso) {
        console.warn('🚫 Sin permisos, alertas desactivadas');
        return;
      }

      if (activo) await revisarInventario();

      intervalRef.current = setInterval(() => {
        if (activo) revisarInventario();
      }, INTERVALO_REVISION_MS);
    }

    iniciar();

    return () => {
      activo = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
