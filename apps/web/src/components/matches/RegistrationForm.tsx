'use client';

import { useState } from 'react';
import {
  CATEGORY_LABELS,
  DIVISION_LABELS,
  REGISTRABLE_CATEGORIES,
  REGISTRABLE_DIVISIONS,
  registerForMatch,
  type Division,
  type Registration,
  type ShooterCategory,
} from '@/lib/registrations';

// Field labels stay in the body face rather than the uppercase data face: this
// is the form that takes people's money, so legibility outranks flourish.
const inputClassName =
  'w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm transition-colors outline-none hover:border-ink/25 focus-visible:border-orange focus-visible:ring-2 focus-visible:ring-orange/25';

function Field({
  label,
  required = false,
  children,
}: Readonly<{ label: string; required?: boolean; children: React.ReactNode }>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}

export function RegistrationForm({
  matchId,
  paymentRecap,
}: Readonly<{ matchId: string; paymentRecap: string | null }>) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [club, setClub] = useState('');
  const [division, setDivision] = useState<Division>('PRODUCTION');
  const [category, setCategory] = useState<ShooterCategory>('OVERALL');
  const [wishes, setWishes] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const registration = await registerForMatch(matchId, {
        firstName,
        lastName,
        email,
        licenceNumber,
        club: club.trim(),
        division,
        category,
        squadRequests: wishes.map((wish) => wish.trim()).filter((wish) => wish !== ''),
      });
      setResult(registration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setSending(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-card border border-ink/10 bg-white p-7 shadow-card">
        <h3 className="mb-3 display text-xl">
          {result.status === 'WAITLISTED' ? "Vous êtes en liste d'attente" : 'Inscription reçue !'}
        </h3>
        <p className="mb-3 text-sm text-ink-body">
          Votre référence :{' '}
          <span className="data-figure rounded bg-cream-50 px-2 py-1 text-[13px]">
            {result.reference}
          </span>
        </p>
        {result.status === 'WAITLISTED' ? (
          <p className="text-sm text-ink-soft">
            Le match est complet. Si une place se libère, vous recevrez un email avec les
            instructions de paiement.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-ink-soft">
              Votre place sera confirmée à réception du virement — indiquez impérativement la
              référence ci-dessus en libellé.
            </p>
            {paymentRecap && (
              <p className="text-sm whitespace-pre-line text-ink-body">{paymentRecap}</p>
            )}
          </>
        )}
        <p className="mt-4 text-sm text-ink-soft">
          Un email récapitulatif vient de vous être envoyé.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-card border border-ink/10 bg-white p-7 shadow-card"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Prénom" required>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="Nom" required>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="N° de licence FFTir" required>
          <input
            required
            value={licenceNumber}
            onChange={(e) => setLicenceNumber(e.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="Club" required>
          <input
            required
            value={club}
            onChange={(e) => setClub(e.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="Division" required>
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value as Division)}
            className={inputClassName}
          >
            {REGISTRABLE_DIVISIONS.map((value) => (
              <option key={value} value={value}>
                {DIVISION_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Catégorie" required>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ShooterCategory)}
            className={inputClassName}
          >
            {REGISTRABLE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-semibold text-ink-secondary">
          Je veux tirer avec… (optionnel, 5 max)
        </legend>
        <div className="flex flex-col gap-2">
          {wishes.map((wish, index) => (
            <input
              key={index}
              value={wish}
              placeholder="Prénom et nom du tireur"
              aria-label={`Tireur souhaité ${index + 1}`}
              onChange={(e) => setWishes(wishes.with(index, e.target.value))}
              className={inputClassName}
            />
          ))}
          {wishes.length < 5 && (
            <button
              type="button"
              onClick={() => setWishes([...wishes, ''])}
              className="self-start text-sm font-semibold text-overline hover:text-orange"
            >
              + Ajouter un tireur
            </button>
          )}
        </div>
      </fieldset>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="self-start rounded-pill bg-gold-gradient px-6 py-3 text-sm font-bold text-ink shadow-btn-gold transition-all duration-200 hover:-translate-y-0.5 hover:brightness-[1.04] disabled:translate-y-0 disabled:opacity-60"
      >
        {sending ? 'Envoi…' : "S'inscrire"}
      </button>
    </form>
  );
}
