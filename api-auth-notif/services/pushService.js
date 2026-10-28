export async function kirimExpoPush(expoPushToken, pesan) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title: pesan.title,
      body: pesan.body,
      data: pesan.data || {},
    }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error('Gagal mengirim ke Expo Push Service');
  }
  return result;
}