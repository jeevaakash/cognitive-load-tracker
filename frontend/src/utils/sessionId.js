import { v4 as uuidv4 } from 'uuid';

/**
 * Get or create a persistent session ID stored in sessionStorage.
 * A new ID is generated each browser session.
 */
export function getSessionId() {
  let id = sessionStorage.getItem('clt_session_id');
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem('clt_session_id', id);
  }
  return id;
}
