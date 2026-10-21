import { useDesk, useT } from './desk-context.js';
import { page } from './session.js';

export function SignedOutBanner() {
  const { signedOut } = useDesk();
  const tr = useT();
  if (!signedOut) return null;
  return (
    <div className="banner bad" role="alert">
      <span>{tr('signedOut')}</span>
      {/* On the desk's own site the reload leads to its sign-in page; inside AgentFlow, AgentFlow's own 401 handling has
          already taken the person to its sign-in. A link to the SDK's sign-in would be wrong there. */}
      <button className="btn" onClick={() => page.reload()}>{tr('signInAgain')}</button>
    </div>
  );
}
