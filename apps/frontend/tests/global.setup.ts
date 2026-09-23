import fs from 'node:fs';
import path from 'node:path';

const authStatePath = path.resolve(__dirname, '../../../playwright/.auth/user.json');

export default async function globalSetup() {
  fs.mkdirSync(path.dirname(authStatePath), { recursive: true });

  if (!process.env.E2E_CLERK_USER_IDENTIFIER || !process.env.E2E_CLERK_USER_PASSWORD) {
    console.log(
      'Skipping Clerk authentication setup: define E2E_CLERK_USER_IDENTIFIER and E2E_CLERK_USER_PASSWORD to enable authenticated Playwright projects.',
    );
    return;
  }

  console.log('Auth setup is enabled for Playwright Clerk E2E flows.');
}
