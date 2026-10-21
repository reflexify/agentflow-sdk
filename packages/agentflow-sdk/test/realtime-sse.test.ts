import { describe, expect, it } from 'vitest';
import { readSse } from '../src/index.js';

function body(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function all(stream: ReadableStream<Uint8Array>) {
  const frames = [];
  for await (const frame of readSse(stream)) frames.push(frame);
  return frames;
}

describe('readSse', () => {
  it('reads frames split anywhere across chunks', async () => {
    const frames = await all(body('retry: 3000\n\nid: 7\nevent: rec', 'ord.updated\ndata: {"a"', ':1}\n\n'));
    expect(frames).toEqual([
      { id: undefined, event: 'message', data: '', retry: 3000 },
      { id: '7', event: 'record.updated', data: '{"a":1}', retry: undefined },
    ]);
  });

  it('keeps a multi-byte character split across two chunks whole', async () => {
    const bytes = new TextEncoder().encode('data: café\n\n');
    const split = bytes.indexOf(0xc3) + 1;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, split));
        controller.enqueue(bytes.slice(split));
        controller.close();
      },
    });
    expect(await all(stream)).toEqual([{ id: undefined, event: 'message', data: 'café', retry: undefined }]);
  });

  it('ends the frames when its signal aborts, even if the body never does', async () => {
    const stream = new ReadableStream<Uint8Array>({ start: () => undefined });
    const abort = new AbortController();
    const done = (async () => {
      const frames = [];
      for await (const frame of readSse(stream, abort.signal)) frames.push(frame);
      return frames;
    })();
    abort.abort();
    expect(await done).toEqual([]);
  });

  it('reports every chunk that arrives, keep-alive comments included', async () => {
    const activity: number[] = [];
    const stream = body(':keep-alive\n\n', 'data: x\n\n', ':keep-alive\n\n');
    const frames = [];
    for await (const frame of readSse(stream, undefined, () => activity.push(frames.length))) frames.push(frame);
    expect(frames).toHaveLength(1);
    expect(activity).toHaveLength(3);
  });

  it('skips comments, joins data lines and accepts CRLF', async () => {
    const frames = await all(body(':keep-alive\r\n\r\nevent: refetch\r\ndata: one\r\ndata: two\r\n\r\n'));
    expect(frames).toEqual([{ id: undefined, event: 'refetch', data: 'one\ntwo', retry: undefined }]);
  });
});
