/**
 * The frames of a `text/event-stream` body: `id`, `event`, `data` (lines joined
 * by `\n`) and `retry`, with comment lines (the keep-alive) skipped. Read with
 * `fetch` rather than `EventSource`, which cannot send an `Authorization` header.
 * Aborting `signal` cancels the body and ends the frames, whether or not the `fetch`
 * that produced the body honours its own signal. `onActivity` is called whenever a chunk
 * arrives, a keep-alive comment included, so a caller can tell a quiet connection from a dead one.
 */
export async function* readSse(body, signal, onActivity) {
    const reader = body.getReader();
    // `stream: true` keeps a multi-byte character split across two chunks whole.
    const decoder = new TextDecoder();
    const cancel = () => void reader.cancel().catch(() => undefined);
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted)
        cancel();
    let buffer = '';
    let id;
    let event;
    let data = [];
    let retry;
    try {
        for (;;) {
            const { value, done } = await reader.read();
            if (done)
                return;
            onActivity?.();
            buffer += decoder.decode(value, { stream: true });
            for (;;) {
                const end = buffer.search(/\r\n|\r|\n/);
                // A lone `\r` at the end of a chunk may be the first half of `\r\n`.
                if (end < 0 || (end === buffer.length - 1 && buffer[end] === '\r'))
                    break;
                const line = buffer.slice(0, end);
                buffer = buffer.slice(end + (buffer.startsWith('\r\n', end) ? 2 : 1));
                if (line === '') {
                    if (data.length > 0 || retry !== undefined || id !== undefined) {
                        yield { id, event: event ?? 'message', data: data.join('\n'), retry };
                    }
                    id = undefined;
                    event = undefined;
                    data = [];
                    retry = undefined;
                    continue;
                }
                if (line.startsWith(':'))
                    continue;
                const colon = line.indexOf(':');
                const field = colon < 0 ? line : line.slice(0, colon);
                let text = colon < 0 ? '' : line.slice(colon + 1);
                if (text.startsWith(' '))
                    text = text.slice(1);
                if (field === 'data')
                    data.push(text);
                else if (field === 'event')
                    event = text;
                else if (field === 'id')
                    id = text;
                else if (field === 'retry' && /^\d+$/.test(text))
                    retry = Number(text);
            }
        }
    }
    finally {
        signal?.removeEventListener('abort', cancel);
        reader.releaseLock();
    }
}
//# sourceMappingURL=sse.js.map