
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: ['./src/schema/schema.ts', './src/schema/memory.ts'],
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: 'file:./local.db',
    },
});
