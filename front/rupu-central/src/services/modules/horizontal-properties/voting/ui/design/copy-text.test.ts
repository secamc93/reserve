import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copyText } from './copy-text';

const URL_TO_COPY = 'http://192.168.3.11:3000/public/vote?token=abc';

function setSecureContext(value: boolean) {
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value });
}

function setClipboard(writeText?: (t: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

describe('copyText', () => {
  let execCommand: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    execCommand = vi.fn();
    // jsdom no implementa execCommand: se simula.
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
  });

  afterEach(() => {
    setClipboard(undefined);
    setSecureContext(false);
  });

  it('contexto seguro: usa navigator.clipboard y no toca execCommand', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setSecureContext(true);
    setClipboard(writeText);

    await expect(copyText(URL_TO_COPY)).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith(URL_TO_COPY);
    expect(execCommand).not.toHaveBeenCalled();
  });

  it('contexto no seguro (HTTP por IP): copia con un textarea y execCommand("copy")', async () => {
    setSecureContext(false);
    setClipboard(undefined);
    let copiedValue = '';
    execCommand.mockImplementation((cmd: string) => {
      const el = document.activeElement as HTMLTextAreaElement;
      copiedValue = el.value.slice(el.selectionStart, el.selectionEnd);
      return cmd === 'copy';
    });

    await expect(copyText(URL_TO_COPY)).resolves.toBe('copied');
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(copiedValue).toBe(URL_TO_COPY);
    // el textarea temporal no queda en el documento
    expect(document.querySelectorAll('textarea')).toHaveLength(0);
  });

  it('el portapapeles falla en contexto seguro: usa el respaldo', async () => {
    setSecureContext(true);
    setClipboard(vi.fn().mockRejectedValue(new Error('denegado')));
    execCommand.mockReturnValue(true);

    await expect(copyText(URL_TO_COPY)).resolves.toBe('copied');
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('si nada funciona devuelve "manual" (la UI pide copiar a mano)', async () => {
    setSecureContext(false);
    setClipboard(undefined);
    execCommand.mockReturnValue(false);

    await expect(copyText(URL_TO_COPY)).resolves.toBe('manual');
    expect(document.querySelectorAll('textarea')).toHaveLength(0);
  });

  it('execCommand que lanza error también termina en "manual"', async () => {
    setSecureContext(false);
    execCommand.mockImplementation(() => {
      throw new Error('no soportado');
    });
    await expect(copyText(URL_TO_COPY)).resolves.toBe('manual');
  });
});
