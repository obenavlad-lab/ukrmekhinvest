export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phone } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing name or phone' });
  }

  const CALLMEBOT_PHONE = '48780522429';
  const CALLMEBOT_APIKEY = '9080931';

  const text =
    'Нова заявка з сайту УКРМЕХІНВЕСТ\n' +
    'Ім\'я: ' + name + '\n' +
    'Телефон: ' + phone;

  const url =
    'https://api.callmebot.com/whatsapp.php?phone=' + CALLMEBOT_PHONE +
    '&text=' + encodeURIComponent(text) +
    '&apikey=' + CALLMEBOT_APIKEY;

  try {
    console.log('notify-wa: sending request to CallMeBot:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const resultText = await response.text();
    console.log('notify-wa: CallMeBot response status:', response.status);
    console.log('notify-wa: CallMeBot response body:', resultText);

    if (!response.ok) {
      return res.status(502).json({ ok: false, details: resultText });
    }

    return res.status(200).json({ ok: true, details: resultText });
  } catch (err) {
    console.error('notify-wa: fetch to CallMeBot failed:', err.name, err.message);
    return res.status(500).json({ ok: false, error: err.name + ': ' + err.message });
  }
}
