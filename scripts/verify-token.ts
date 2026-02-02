import { createHash } from 'crypto';

// Token from URL (the one the user clicked)
const urlToken = '133599518741033e5c33c6fac790b999c6c885e4e8a28879c13cdfe19fbff1c6';

// Token stored in database
const dbToken = 'd9cbbc69976d20b991f7431ea1171bd771ab994e12d851299c3d5a4b300c29e1';

// AUTH_SECRET from production
const authSecret = '4LC7oP7iLxb5VcYLNYBFeSncKQ+JqpZbTqeTofOq+0c=';

// Try different hashing methods Auth.js might use
console.log('URL Token:', urlToken);
console.log('DB Token:', dbToken);
console.log('');

// Method 1: Simple SHA256
const hash1 = createHash('sha256').update(urlToken).digest('hex');
console.log('SHA256(urlToken):', hash1);
console.log('Matches DB?', hash1 === dbToken);
console.log('');

// Method 2: SHA256 with secret
const hash2 = createHash('sha256').update(`${urlToken}${authSecret}`).digest('hex');
console.log('SHA256(token+secret):', hash2);
console.log('Matches DB?', hash2 === dbToken);
console.log('');

// Method 3: HMAC SHA256
import { createHmac } from 'crypto';
const hash3 = createHmac('sha256', authSecret).update(urlToken).digest('hex');
console.log('HMAC-SHA256:', hash3);
console.log('Matches DB?', hash3 === dbToken);
