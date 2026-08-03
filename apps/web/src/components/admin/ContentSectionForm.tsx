'use client';

import { useState } from 'react';
import {
  getAtPath,
  saveSectionValues,
  setAtPath,
  type FieldConfig,
  type SectionConfig,
} from '@/lib/admin-content';

type HourRow = { day: string; time: string };

const inputClassName =
  'w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange';

function Field({
  field,
  values,
  onChange,
}: Readonly<{
  field: FieldConfig;
  values: unknown;
  onChange: (path: string, value: unknown) => void;
}>) {
  const value = getAtPath(values, field.path);

  if (field.type === 'hours') {
    const rows = (value as HourRow[] | undefined) ?? [];
    const updateRows = (next: HourRow[]) => onChange(field.path, next);
    return (
      <fieldset>
        <legend className="mb-1.5 block text-sm font-semibold text-ink-secondary">
          {field.label}
        </legend>
        <div className="flex flex-col gap-2">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                aria-label={`Jour ${index + 1}`}
                value={row.day}
                onChange={(event) =>
                  updateRows(rows.with(index, { ...row, day: event.target.value }))
                }
                className={inputClassName}
              />
              <input
                aria-label={`Heures ${index + 1}`}
                value={row.time}
                onChange={(event) =>
                  updateRows(rows.with(index, { ...row, time: event.target.value }))
                }
                className={inputClassName}
              />
              <button
                type="button"
                aria-label={`Supprimer la ligne ${index + 1}`}
                onClick={() => updateRows(rows.filter((_, i) => i !== index))}
                className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateRows([...rows, { day: '', time: '' }])}
            className="self-start text-sm font-semibold text-overline hover:text-orange"
          >
            + Ajouter une ligne
          </button>
        </div>
      </fieldset>
    );
  }

  if (field.type === 'lines') {
    const lines = (value as string[] | undefined) ?? [];
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">{field.label}</span>
        <textarea
          rows={Math.max(3, lines.length + 1)}
          value={lines.join('\n')}
          onChange={(event) => onChange(field.path, event.target.value.split('\n'))}
          onBlur={(event) =>
            onChange(
              field.path,
              event.target.value.split('\n').filter((line) => line.trim() !== ''),
            )
          }
          className={inputClassName}
        />
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">{field.label}</span>
      {field.type === 'textarea' ? (
        <textarea
          rows={3}
          value={(value as string | undefined) ?? ''}
          onChange={(event) => onChange(field.path, event.target.value)}
          className={inputClassName}
        />
      ) : (
        <input
          value={(value as string | undefined) ?? ''}
          onChange={(event) => onChange(field.path, event.target.value)}
          className={inputClassName}
        />
      )}
    </label>
  );
}

export function ContentSectionForm({
  config,
  initialValues,
}: Readonly<{ config: SectionConfig; initialValues: unknown }>) {
  const [values, setValues] = useState<unknown>(initialValues);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      await saveSectionValues(config.key, values);
      setStatus('saved');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {config.fields.map((field) => (
        <Field
          key={field.path}
          field={field}
          values={values}
          onChange={(path, value) => {
            setStatus('idle');
            setValues((current: unknown) => setAtPath(current, path, value));
          }}
        />
      ))}

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {status === 'saved' && (
        <p className="text-sm font-semibold text-green-700">
          Enregistré. Le site public se met à jour sous quelques secondes.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="self-start rounded-pill bg-gold-gradient px-6 py-3 text-sm font-extrabold text-ink disabled:opacity-60"
      >
        {status === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
