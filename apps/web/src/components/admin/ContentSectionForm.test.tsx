import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentSectionForm } from './ContentSectionForm';
import type { SectionConfig } from '@/lib/admin-content';

vi.mock('@/lib/admin-content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/admin-content')>()),
  saveSectionValues: vi.fn().mockResolvedValue(undefined),
  resetSectionValues: vi.fn().mockResolvedValue({ title: 'Titre par défaut' }),
}));

const { resetSectionValues, saveSectionValues } = await import('@/lib/admin-content');

const config: SectionConfig = {
  key: 'hero',
  title: 'Bandeau principal',
  description: 'Le haut de la page d’accueil.',
  fields: [{ path: 'title', label: 'Titre', type: 'text' }],
};

const RESET_BUTTON = 'Réinitialiser au contenu par défaut';

describe('ContentSectionForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // restoreAllMocks only undoes spies; the module mocks keep their call
    // history, which would leak between tests.
    vi.clearAllMocks();
    vi.mocked(resetSectionValues).mockResolvedValue({ title: 'Titre par défaut' });
  });

  it('saves the edited values', async () => {
    const user = userEvent.setup();
    render(<ContentSectionForm config={config} initialValues={{ title: 'Titre actuel' }} />);

    await user.clear(screen.getByLabelText('Titre'));
    await user.type(screen.getByLabelText('Titre'), 'Smoke');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(saveSectionValues).toHaveBeenCalledWith('hero', { title: 'Smoke' });
  });

  it('resets the section and shows the defaults it falls back to', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ContentSectionForm config={config} initialValues={{ title: 'Smoke' }} />);

    await user.click(screen.getByRole('button', { name: RESET_BUTTON }));

    expect(resetSectionValues).toHaveBeenCalledWith('hero');
    expect(screen.getByLabelText('Titre')).toHaveValue('Titre par défaut');
    expect(screen.getByText(/Section réinitialisée/)).toBeInTheDocument();
  });

  it('does not reset when the confirmation is dismissed', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ContentSectionForm config={config} initialValues={{ title: 'Smoke' }} />);

    await user.click(screen.getByRole('button', { name: RESET_BUTTON }));

    expect(resetSectionValues).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Titre')).toHaveValue('Smoke');
  });

  it('surfaces a failed reset without clearing the form', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(resetSectionValues).mockRejectedValue(new Error('Reset failed with status 500'));
    render(<ContentSectionForm config={config} initialValues={{ title: 'Smoke' }} />);

    await user.click(screen.getByRole('button', { name: RESET_BUTTON }));

    expect(screen.getByText('Reset failed with status 500')).toBeInTheDocument();
    expect(screen.getByLabelText('Titre')).toHaveValue('Smoke');
  });
});
