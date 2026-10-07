import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import type { ContactCard } from '@/lib/contact-card';
import { loadContacts, saveContacts, type Contact } from '@/lib/contacts';
import type { Identity } from '@/lib/identity';

type AppState = {
  identity: Identity | null;
  setIdentity: (identity: Identity) => void;
  contacts: Contact[];
  contactsLoaded: boolean;
  addContact: (contact: Contact) => void;
  removeContact: (id: string) => void;
  /** The person picked under To on Send and From on Receive. */
  selectedContact: Contact | null;
  selectContact: (id: string) => void;
  /** A card just read on Add someone, waiting to be named and saved. */
  scannedCard: ContactCard | null;
  setScannedCard: (card: ContactCard | null) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scannedCard, setScannedCard] = useState<ContactCard | null>(null);

  useEffect(() => {
    loadContacts()
      .then(setContacts)
      .catch((error) => console.error('Could not load contacts', error))
      .finally(() => setContactsLoaded(true));
  }, []);

  function updateContacts(next: Contact[]) {
    saveContacts(next);
    setContacts(next);
  }

  const selectedContact = contacts.find((c) => c.id === selectedId) ?? contacts[0] ?? null;

  return (
    <AppStateContext
      value={{
        identity,
        setIdentity,
        contacts,
        contactsLoaded,
        addContact: (contact) => updateContacts([contact, ...contacts.filter((c) => c.id !== contact.id)]),
        removeContact: (id) => updateContacts(contacts.filter((c) => c.id !== id)),
        selectedContact,
        selectContact: setSelectedId,
        scannedCard,
        setScannedCard,
      }}>
      {children}
    </AppStateContext>
  );
}

export function useAppState() {
  const state = use(AppStateContext);
  if (!state) throw new Error('useAppState must be used inside AppStateProvider');
  return state;
}
