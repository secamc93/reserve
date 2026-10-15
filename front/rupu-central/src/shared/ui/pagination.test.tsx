import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Pagination, PaginationControls } from './pagination';

const push = vi.fn();
const replace = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => '/properties/7/units',
  useSearchParams: () => new URLSearchParams(search),
}));

/** Query de la última navegación (push o replace) como URLSearchParams. */
function lastQuery(fn: ReturnType<typeof vi.fn>) {
  const href = fn.mock.calls.at(-1)?.[0] as string;
  expect(href.startsWith('/properties/7/units?')).toBe(true);
  return new URLSearchParams(href.split('?')[1]);
}

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  search = '';
});

describe('Pagination (estado en la URL)', () => {
  it('es accesible: nav "Paginación", página actual marcada y selector "Filas por página"', () => {
    search = 'page=2&page_size=10';
    render(<Pagination total={137} />);

    const nav = screen.getByRole('navigation', { name: 'Paginación' });
    expect(within(nav).getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: 'Página 1' })).not.toHaveAttribute('aria-current');
    expect(screen.getByLabelText('Filas por página')).toHaveValue('10');
    expect(screen.getByText('Mostrando 11–20 de 137')).toBeInTheDocument();
    for (const name of ['Primera página', 'Página anterior', 'Página siguiente', 'Última página']) {
      expect(screen.getByRole('button', { name })).toBeEnabled();
    }
  });

  it('sin params usa página 1 y 10 filas; anterior/primera deshabilitados', () => {
    render(<Pagination total={137} />);
    expect(screen.getByText('Mostrando 1–10 de 137')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Primera página' })).toBeDisabled();
    // 14 páginas: 1 2 3 4 5 … 14
    expect(screen.getByRole('button', { name: 'Página 14' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Página 6' })).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('cambiar de página navega con page y conserva los demás filtros', async () => {
    search = 'status=open&page=2&page_size=20';
    render(<Pagination total={137} />);

    await userEvent.click(screen.getByRole('button', { name: 'Página 3' }));
    const q = lastQuery(push);
    expect(q.get('page')).toBe('3');
    expect(q.get('page_size')).toBe('20');
    expect(q.get('status')).toBe('open');

    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(lastQuery(push).get('page')).toBe('3');
    await userEvent.click(screen.getByRole('button', { name: 'Última página' }));
    expect(lastQuery(push).get('page')).toBe('7');
    await userEvent.click(screen.getByRole('button', { name: 'Primera página' }));
    expect(lastQuery(push).get('page')).toBe('1');
  });

  it('cambiar page_size vuelve a la página 1', async () => {
    search = 'page=5&page_size=10&q=torre';
    render(<Pagination total={137} />);

    await userEvent.selectOptions(screen.getByLabelText('Filas por página'), '50');
    const q = lastQuery(push);
    expect(q.get('page_size')).toBe('50');
    expect(q.get('page')).toBe('1');
    expect(q.get('q')).toBe('torre');
  });

  it('ofrece 10, 20, 50, 100 y 200 filas', () => {
    render(<Pagination total={137} />);
    const options = within(screen.getByLabelText('Filas por página')).getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['10', '20', '50', '100', '200']);
  });

  it('ir a página válida navega', async () => {
    render(<Pagination total={137} />);
    await userEvent.type(screen.getByLabelText('Ir a la página'), '9');
    await userEvent.click(screen.getByRole('button', { name: 'Ir' }));
    expect(lastQuery(push).get('page')).toBe('9');
  });

  it.each(['15', '0', '-2'])('ir a página inválida (%s) no navega y avisa', async (value) => {
    render(<Pagination total={137} />);
    await userEvent.type(screen.getByLabelText('Ir a la página'), `${value}{Enter}`);
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Página entre 1 y 14');
    expect(screen.getByLabelText('Ir a la página')).toHaveAttribute('aria-invalid', 'true');
  });

  it('?page_size=500 se normaliza a 200 en la URL y en el selector', () => {
    search = 'page=1&page_size=500&status=open';
    render(<Pagination total={450} />);

    expect(screen.getByLabelText('Filas por página')).toHaveValue('200');
    expect(screen.getByText('Mostrando 1–200 de 450')).toBeInTheDocument();
    const q = lastQuery(replace);
    expect(q.get('page_size')).toBe('200');
    expect(q.get('status')).toBe('open');
  });

  it('valores inválidos en la URL vuelven a los predeterminados', () => {
    search = 'page=abc&page_size=0';
    render(<Pagination total={30} />);
    const q = lastQuery(replace);
    expect(q.get('page')).toBe('1');
    expect(q.get('page_size')).toBe('10');
  });

  it('una página mayor que la última se lleva a la última', () => {
    search = 'page=50&page_size=10';
    render(<Pagination total={25} />);
    expect(lastQuery(replace).get('page')).toBe('3');
  });

  it('sin registros muestra "Sin resultados" y no navega', () => {
    render(<Pagination total={0} />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
    expect(screen.queryByLabelText('Ir a la página')).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('deshabilitado mientras carga', () => {
    search = 'page=2';
    render(<Pagination total={137} disabled />);
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
    expect(screen.getByLabelText('Filas por página')).toBeDisabled();
  });
});

describe('PaginationControls (controlado, sin URL)', () => {
  it('llama a los callbacks y no toca la URL', async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(
      <PaginationControls page={1} pageSize={10} total={45} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    await userEvent.selectOptions(screen.getByLabelText('Filas por página'), '20');
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
    expect(push).not.toHaveBeenCalled();
  });

  it('sin onPageSizeChange no muestra el selector', () => {
    render(<PaginationControls page={1} pageSize={10} total={45} onPageChange={vi.fn()} />);
    expect(screen.queryByLabelText('Filas por página')).not.toBeInTheDocument();
  });

  it('click en la página actual no navega', async () => {
    const onPageChange = vi.fn();
    render(<PaginationControls page={2} pageSize={10} total={45} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
