'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Template } from '@/components/modal/template';
import { Button } from '@/components/button';
import { useModal } from '@/components/modal/provider';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const inputClass =
  'w-full border border-neutral-200 bg-white px-3 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100 transition-all';

const labelClass = 'block text-[13px] font-medium text-neutral-700 mb-1.5 font-display';

const categories = [
  { value: 'prescription', label: 'Prescription' },
  { value: 'supplement', label: 'Supplement' },
  { value: 'otc', label: 'OTC' },
] as const;

type Category = (typeof categories)[number]['value'];

export function AddMedicationModal() {
  const modal = useModal();
  const utils = trpc.useUtils();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('prescription');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [route, setRoute] = useState('');
  const [prescriber, setPrescriber] = useState('');
  const [indication, setIndication] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const createMutation = trpc.medications.create.useMutation({
    onSuccess: () => {
      utils.medications.list.invalidate();
      modal.hide();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({
      name: name.trim(),
      category,
      dosage: dosage.trim() || undefined,
      frequency: frequency.trim() || undefined,
      route: route.trim() || undefined,
      prescriber: prescriber.trim() || undefined,
      indication: indication.trim() || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      notes: notes.trim() || undefined,
    });
  }

  const fieldDelay = 0.03;

  return (
    <Template
      title="Add medication"
      description="Track a new medication, supplement, or OTC."
      footer={
        <div className="flex flex-1 items-center justify-between gap-x-3">
          <Button onClick={() => modal.hide()} variant="ghost" text="Cancel" />
          <Button
            onClick={handleSubmit}
            text="Add medication"
            loading={createMutation.isPending}
            disabled={!name.trim()}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fieldDelay * 0 }}
        >
          <label className={labelClass}>
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Lisinopril"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fieldDelay * 1 }}
        >
          <label className={labelClass}>Category</label>
          <div className="flex gap-1 border border-neutral-200 bg-neutral-50 p-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'flex-1 px-3 py-1.5 text-[13px] font-medium transition-all',
                  category === cat.value
                    ? 'bg-white text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fieldDelay * 2 }}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label className={labelClass}>Dosage</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. 10mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Frequency</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Once daily"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fieldDelay * 3 }}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label className={labelClass}>Route</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Oral"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Prescriber</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Dr. Smith"
              value={prescriber}
              onChange={(e) => setPrescriber(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fieldDelay * 4 }}
        >
          <label className={labelClass}>Indication</label>
          <textarea
            className={cn(inputClass, 'resize-none')}
            rows={2}
            placeholder="e.g. Hypertension management"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fieldDelay * 5 }}
        >
          <label className={labelClass}>Start date</label>
          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fieldDelay * 6 }}
        >
          {!showNotes ? (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="flex items-center gap-1 text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Add notes
            </button>
          ) : (
            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                className={cn(inputClass, 'resize-none')}
                rows={3}
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </motion.div>
      </form>
    </Template>
  );
}
