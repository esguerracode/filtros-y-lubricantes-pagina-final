export async function sendTelegram(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_USER_ID;

    if (!token || !chatId) {
        console.warn('⚠️ Telegram not configured. Skipping notification.');
        return;
    }

    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        if (!res.ok) console.error('Telegram API error:', await res.text());
    } catch (e) {
        console.error('Telegram send failed:', e);
    }
}
