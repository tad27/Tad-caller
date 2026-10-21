import React, { useState } from 'react';
import { Phone, PhoneCall, PhoneIncoming, PhoneMissed, PhoneOutgoing, Plus, Trash2, Clock, Check } from 'lucide-react';
import { CallLog, Contact, PhoneNumber } from '../types/directory';
import { useToast } from './ToastFeedback';

interface CallHistoryTabProps {
  callLogs: CallLog[];
  contacts: Contact[];
  phoneNumbers: PhoneNumber[];
  onInitiateCall: (contact: Contact, phone: PhoneNumber) => void;
  onAddManualCallLog: (log: Omit<CallLog, 'id'>) => void;
  onDeleteCallLog: (logId: string) => void;
  onClearAllLogs: () => void;
}

export const CallHistoryTab: React.FC<CallHistoryTabProps> = ({
  callLogs,
  contacts,
  phoneNumbers,
  onInitiateCall,
  onAddManualCallLog,
  onDeleteCallLog,
  onClearAllLogs,
}) => {
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState<'all' | 'missed'>('all');
  const [isAddingManual, setIsAddingManual] = useState(false);

  // Form states for manual log
  const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id || '');
  const [dialedNumber, setDialedNumber] = useState(phoneNumbers[0]?.number || '');
  const [callType, setCallType] = useState<'outgoing' | 'incoming' | 'missed'>('outgoing');
  const [durationMins, setDurationMins] = useState('2');
  const [notes, setNotes] = useState('');

  const filteredLogs = callLogs.filter(log => {
    if (filterType === 'missed') return log.type === 'missed';
    return true;
  });

  const handleContactSelect = (cId: string) => {
    setSelectedContactId(cId);
    const primaryPhone = phoneNumbers.find(p => p.contactId === cId && p.isPrimary) ||
      phoneNumbers.find(p => p.contactId === cId);
    if (primaryPhone) {
      setDialedNumber(primaryPhone.number);
    }
  };

  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find(c => c.id === selectedContactId);
    const contactName = contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown';

    onAddManualCallLog({
      contactId: selectedContactId,
      contactName,
      phoneNumber: dialedNumber || 'Direct Line',
      type: callType,
      timestamp: new Date().toISOString(),
      durationSeconds: callType === 'missed' ? 0 : (parseInt(durationMins) || 1) * 60,
      notes: notes.trim() || undefined,
    });

    showToast('Call Logged', `${contactName} (${callType})`, 'call');
    setIsAddingManual(false);
    setNotes('');
  };

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s > 0 ? `${s}s` : ''}`;
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Header Bar */}
      <div className="shrink-0 px-4 pt-3 pb-3 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Call Recents</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingManual(true)}
              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              title="Log Manual Call"
            >
              <Plus className="w-4 h-4" />
            </button>
            {callLogs.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all call logs?')) {
                    onClearAllLogs();
                    showToast('History Cleared', 'All call logs erased', 'success');
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Clear Call History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Segment (All vs Missed) */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Calls ({callLogs.length})
          </button>
          <button
            onClick={() => setFilterType('missed')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'missed'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Missed ({callLogs.filter(l => l.type === 'missed').length})
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <PhoneCall className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium">No call logs found</p>
            <p className="text-xs text-slate-400 mt-1">
              Calls made via one-tap dialer or logged manually appear here.
            </p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const contact = contacts.find(c => c.id === log.contactId);
            const contactPhone = phoneNumbers.find(
              p => p.contactId === log.contactId && p.number === log.phoneNumber
            ) || phoneNumbers.find(p => p.contactId === log.contactId);

            return (
              <div
                key={log.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-100/50 dark:hover:bg-slate-800/40 rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      log.type === 'missed'
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400'
                        : log.type === 'outgoing'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400'
                    }`}
                  >
                    {log.type === 'missed' && <PhoneMissed className="w-4 h-4" />}
                    {log.type === 'outgoing' && <PhoneOutgoing className="w-4 h-4" />}
                    {log.type === 'incoming' && <PhoneIncoming className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        log.type === 'missed'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {log.contactName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                      <span>{log.phoneNumber}</span>
                      {log.durationSeconds > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-500 font-sans">
                            {formatDuration(log.durationSeconds)}
                          </span>
                        </>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 truncate">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400">
                    {formatTimestamp(log.timestamp)}
                  </span>

                  {contact && contactPhone && (
                    <button
                      onClick={() => onInitiateCall(contact, contactPhone)}
                      className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-colors"
                      title="Call back"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteCallLog(log.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Call Log Modal */}
      {isAddingManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log Call Record</h3>
              <button
                onClick={() => setIsAddingManual(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveManualLog} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Contact
                </label>
                <select
                  value={selectedContactId}
                  onChange={e => handleContactSelect(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={dialedNumber}
                  onChange={e => setDialedNumber(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 font-mono bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Call Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['outgoing', 'incoming', 'missed'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCallType(t)}
                      className={`py-1.5 text-xs font-medium rounded-xl border capitalize transition-colors ${
                        callType === t
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {callType !== 'missed' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={durationMins}
                    onChange={e => setDurationMins(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Call Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discussed wire transfer..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors mt-2"
              >
                Save Call Log
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
