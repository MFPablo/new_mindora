async function main() {
  const password = "password123";
  const hash = await Bun.password.hash(password);
  
  console.log("Generated Hash:", hash);
  console.log("\n--- Verification Test ---");
  
  const isValidOriginal = await Bun.password.verify(password, hash);
  console.log(`Original Hash Valid? ${isValidOriginal}`);

  // Try stripping parameters (mimicking user request)
  // Format: $id$v=...$params$salt$hash
  const parts = hash.split('$');
  // parts[0] is empty, [1] is id, [2] is v, [3] is params, [4] is salt, [5] is hash
  const rawHash = parts[5]; 
  
  if (rawHash) {
     console.log("\nAttempting to verify with only the raw hash suffix...");
     try {
       const isValidRaw = await Bun.password.verify(password, rawHash);
       console.log(`Raw Hash Valid? ${isValidRaw}`);
     } catch (e) {
       console.log(`Error verifying raw hash: ${e.message}`);
     }
  } else {
     console.log("Could not parse raw hash from string.");
  }
}

main();
