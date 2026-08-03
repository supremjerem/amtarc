import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsForm } from './NewsForm';

describe('NewsForm', () => {
  it('submits the entered values, dropping empty optional fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<NewsForm submitLabel="Créer" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Titre'), 'Nouveau concours');
    await user.type(screen.getByLabelText('Texte'), 'Détails du concours.');
    await user.click(screen.getByRole('button', { name: 'Créer' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Nouveau concours',
      category: 'CONCOURS',
      excerpt: undefined,
      body: 'Détails du concours.',
      imageUrl: undefined,
      published: true,
    });
  });

  it('pre-fills initial values and shows an error when submit fails', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Enregistrement impossible.'));
    render(
      <NewsForm
        submitLabel="Enregistrer"
        initialValues={{
          title: 'Titre existant',
          category: 'TRAVAUX',
          excerpt: 'Résumé',
          body: 'Corps',
          imageUrl: '',
          published: false,
        }}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText('Titre')).toHaveValue('Titre existant');
    expect(screen.getByLabelText('Catégorie')).toHaveValue('TRAVAUX');

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Enregistrement impossible.')).toBeInTheDocument();
  });
});
