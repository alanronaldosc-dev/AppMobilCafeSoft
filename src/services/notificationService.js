import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Canales Android ──────────────────────────────────────────────────────────
async function crearCanales() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('inventario', {
    name: 'Alertas de Inventario',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF0000',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('caducidad', {
    name: 'Alertas de Caducidad',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FFA500',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('ventas', {
    name: 'Alertas de Ventas',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4CAF50',
    sound: 'default',
  });
}

// ─── Solicitar permisos ───────────────────────────────────────────────────────
export async function solicitarPermisosNotificaciones() {
  await crearCanales();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('⚠️ Permiso de notificaciones denegado');
    return false;
  }

  console.log('✅ Permisos de notificaciones concedidos');
  return true;
}

// ─── Obtener Expo Push Token del dispositivo ──────────────────────────────────
export async function obtenerYGuardarPushToken() {
  try {
    if (!Device.isDevice) {
      console.warn('⚠️ Push tokens solo funcionan en dispositivos físicos');
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    console.log('📱 Expo Push Token:', token);
    return token;
  } catch (e) {
    console.error('Error obteniendo push token:', e);
    return null;
  }
}

// ─── Enviar push al token del empleado via Expo Push API ─────────────────────
export async function enviarPushNotificacionVenta(expoPushToken, folio, items, total) {
  if (!expoPushToken) {
    console.warn('⚠️ No hay token de empleado para enviar push');
    return;
  }

  const lista = items.map(i => `• ${i.name} x${i.quantity}`).join('\n');

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: '🛒 Nueva venta registrada',
    body: `Folio: ${folio}\n${lista}\nTotal: $${total.toFixed(2)} MXN`,
    data: { tipo: 'nueva_venta', folio },
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const result = await response.json();
    console.log('📤 Resultado push Expo:', JSON.stringify(result));
  } catch (e) {
    console.error('Error enviando push al empleado:', e);
  }
}

// ─── Notificación local de bajo stock ────────────────────────────────────────
export async function enviarNotificacionBajoStock(insumos) {
  if (!insumos || insumos.length === 0) return;

  const lista = insumos
    .map(i => `• ${i.nombre}: ${i.cantidad} ${i.unidadMedida} (mín: ${i.cantidadMinima})`)
    .join('\n');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Stock Bajo en Inventario',
      body: `${insumos.length} insumo(s) con stock bajo:\n${lista}`,
      data: { tipo: 'bajo_stock', insumos },
      channelId: 'inventario',
      sound: 'default',
    },
    trigger: null,
  });
}

// ─── Notificación local de caducidad ─────────────────────────────────────────
export async function enviarNotificacionCaducidad(insumos) {
  if (!insumos || insumos.length === 0) return;

  const lista = insumos
    .map(i => `• ${i.nombre}: caduca ${i.caducidad}`)
    .join('\n');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🗓️ Insumos Próximos a Caducar',
      body: `${insumos.length} insumo(s) caducan en los próximos 7 días:\n${lista}`,
      data: { tipo: 'caducidad', insumos },
      channelId: 'caducidad',
      sound: 'default',
    },
    trigger: null,
  });
}
