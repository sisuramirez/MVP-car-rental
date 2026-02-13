import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Uso: npx ts-node scripts/generate-password-hash.ts <contraseña>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nHash generado:");
console.log(hash);
console.log("\nCopia este valor en ADMIN_PASSWORD_HASH en tu archivo .env");
