import { handler } from '../../server/http.mjs';
export const config = { api: { bodyParser: false } };
export default handler('status');
