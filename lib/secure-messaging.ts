import { equalTo, onValue, orderByChild, query, ref } from 'firebase/database';
import { database, getCurrentUser } from '@/lib/firebase';
import { countryDataPath, type CountryCode } from '@/lib/countries';

// Read only messages sent or received by the current user. The database rules
// require these bounded queries and do not expose an entire request thread.
export function getMessagesForCurrentUser(requestId: string, callback: (messages: any[]) => void, country: CountryCode = 'BD') {
  const user = getCurrentUser();
  if (!database || !user?.emailVerified) {
    callback([]);
    return () => {};
  }

  const messagesRef = ref(database, `${countryDataPath(country, 'messages')}/${requestId}`);
  const sent = new Map<string, any>();
  const received = new Map<string, any>();
  const publish = () => {
    const all = new Map([...sent, ...received]);
    callback([...all.entries()]
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
  };
  const listen = (field: 'senderId' | 'receiverId', target: Map<string, any>) =>
    onValue(query(messagesRef, orderByChild(field), equalTo(user.uid)), snapshot => {
      target.clear();
      snapshot.forEach(child => { target.set(child.key as string, child.val()); });
      publish();
    }, error => console.error('Could not load messages:', error));

  const stopSent = listen('senderId', sent);
  const stopReceived = listen('receiverId', received);
  return () => { stopSent(); stopReceived(); };
}
