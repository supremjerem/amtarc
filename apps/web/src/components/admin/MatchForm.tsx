'use client';

import { useState } from 'react';
import type { MatchFormInput, SquadInput } from '@/lib/admin-matches';

const inputClassName =
  'w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange';

// Form-side representation: dates as yyyy-mm-dd, numbers as strings.
export type MatchFormValues = {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  stages: string;
  rounds: string;
  feeEuros: string;
  registrationDeadline: string;
  published: boolean;
  paymentIban: string;
  paymentPayee: string;
  paymentInstructions: string;
  squads: { label: string; day: string; startTime: string; targetSize: string }[];
};

export const EMPTY_MATCH_VALUES: MatchFormValues = {
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  stages: '',
  rounds: '',
  feeEuros: '',
  registrationDeadline: '',
  published: false,
  paymentIban: '',
  paymentPayee: '',
  paymentInstructions: '',
  squads: [],
};

// Date-only values are stored at UTC midnight; France (UTC+1/+2) renders the
// same calendar day, as does a UTC server during ISR.
function toIso(date: string): string {
  return `${date}T00:00:00.000Z`;
}

export function toApiInput(values: MatchFormValues): MatchFormInput {
  return {
    title: values.title,
    description: values.description || undefined,
    location: values.location,
    startDate: toIso(values.startDate),
    endDate: toIso(values.endDate),
    stages: values.stages ? Number(values.stages) : undefined,
    rounds: values.rounds ? Number(values.rounds) : undefined,
    feeCents: values.feeEuros ? Math.round(Number(values.feeEuros) * 100) : 0,
    registrationDeadline: values.registrationDeadline
      ? toIso(values.registrationDeadline)
      : undefined,
    published: values.published,
    paymentIban: values.paymentIban || undefined,
    paymentPayee: values.paymentPayee || undefined,
    paymentInstructions: values.paymentInstructions || undefined,
    squads: values.squads.map((squad): SquadInput => ({
      label: squad.label,
      day: toIso(squad.day),
      startTime: squad.startTime,
      targetSize: squad.targetSize ? Number(squad.targetSize) : undefined,
    })),
  };
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    </label>
  );
}

export function MatchForm({
  initialValues,
  submitLabel,
  onSubmit,
}: Readonly<{
  initialValues?: MatchFormValues;
  submitLabel: string;
  onSubmit: (values: MatchFormInput) => Promise<void>;
}>) {
  const [values, setValues] = useState<MatchFormValues>(initialValues ?? EMPTY_MATCH_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof MatchFormValues>(key: K, value: MatchFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const setSquad = (index: number, patch: Partial<MatchFormValues['squads'][number]>) =>
    setValues((current) => ({
      ...current,
      squads: current.squads.with(index, { ...current.squads[index], ...patch }),
    }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(toApiInput(values));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TextField label="Titre" value={values.title} onChange={(v) => set('title', v)} required />

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">Description</span>
        <textarea
          rows={4}
          value={values.description}
          onChange={(event) => set('description', event.target.value)}
          className={inputClassName}
        />
      </label>

      <TextField
        label="Lieu"
        value={values.location}
        onChange={(v) => set('location', v)}
        required
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <TextField
          label="Début"
          type="date"
          value={values.startDate}
          onChange={(v) => set('startDate', v)}
          required
        />
        <TextField
          label="Fin"
          type="date"
          value={values.endDate}
          onChange={(v) => set('endDate', v)}
          required
        />
        <TextField
          label="Clôture des inscriptions"
          type="date"
          value={values.registrationDeadline}
          onChange={(v) => set('registrationDeadline', v)}
        />
        <TextField
          label="Stages"
          type="number"
          value={values.stages}
          onChange={(v) => set('stages', v)}
        />
        <TextField
          label="Coups (approx.)"
          type="number"
          value={values.rounds}
          onChange={(v) => set('rounds', v)}
        />
        <TextField
          label="Engagement (€)"
          type="number"
          value={values.feeEuros}
          onChange={(v) => set('feeEuros', v)}
        />
      </div>

      <fieldset className="rounded-card border border-ink/10 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink-secondary">
          Règlement (virement au club organisateur)
        </legend>
        <div className="flex flex-col gap-4">
          <TextField
            label="Bénéficiaire"
            value={values.paymentPayee}
            onChange={(v) => set('paymentPayee', v)}
          />
          <TextField
            label="IBAN"
            value={values.paymentIban}
            onChange={(v) => set('paymentIban', v)}
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">
              Instructions
            </span>
            <textarea
              rows={2}
              value={values.paymentInstructions}
              onChange={(event) => set('paymentInstructions', event.target.value)}
              className={inputClassName}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-card border border-ink/10 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink-secondary">Squads</legend>
        <div className="flex flex-col gap-3">
          {values.squads.map((squad, index) => (
            <div key={index} className="grid grid-cols-2 items-end gap-3 md:grid-cols-5">
              <TextField
                label="Nom"
                value={squad.label}
                onChange={(v) => setSquad(index, { label: v })}
                required
              />
              <TextField
                label="Jour"
                type="date"
                value={squad.day}
                onChange={(v) => setSquad(index, { day: v })}
                required
              />
              <TextField
                label="Départ"
                type="time"
                value={squad.startTime}
                onChange={(v) => setSquad(index, { startTime: v })}
                required
              />
              <TextField
                label="Places"
                type="number"
                value={squad.targetSize}
                onChange={(v) => setSquad(index, { targetSize: v })}
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    'squads',
                    values.squads.filter((_, i) => i !== index),
                  )
                }
                className="justify-self-start pb-2 text-sm font-semibold text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set('squads', [
                ...values.squads,
                {
                  label: `Squad ${values.squads.length + 1}`,
                  day: values.startDate,
                  startTime: '08:00',
                  targetSize: '12',
                },
              ])
            }
            className="self-start text-sm font-semibold text-overline hover:text-orange"
          >
            + Ajouter une squad
          </button>
        </div>
      </fieldset>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(event) => set('published', event.target.checked)}
        />
        <span className="text-sm font-semibold text-ink-secondary">Publié</span>
      </label>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-pill bg-gold-gradient px-6 py-3 text-sm font-extrabold text-ink disabled:opacity-60"
      >
        {saving ? 'Enregistrement…' : submitLabel}
      </button>
    </form>
  );
}
