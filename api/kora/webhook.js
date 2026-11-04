import { handler } from '../../server/http.mjs';
// Preserve the request stream; Kora signs JSON.stringify(parsed data), NOT whole-body bytes.
export const config = { api: { bodyParser: false } };
export default handler('webhook');
