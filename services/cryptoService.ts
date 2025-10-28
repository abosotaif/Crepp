
// NOTE: This is a textbook implementation for educational purposes and is not cryptographically secure.

// --- Caesar Cipher ---

export function caesarEncrypt(text: string, shift: number): string {
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { // Uppercase letters
            return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        } else if (code >= 97 && code <= 122) { // Lowercase letters
            return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char; // Non-alphabetic characters
    }).join('');
}

export function caesarDecrypt(text: string, shift: number): string {
    // Decryption is just shifting in the opposite direction
    return caesarEncrypt(text, 26 - (shift % 26));
}


// --- RSA Algorithm ---

// Helper function for modular exponentiation (b^e % m)
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let res = 1n;
    base %= mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % mod;
        base = (base * base) % mod;
        exp >>= 1n;
    }
    return res;
}

// Helper function for Greatest Common Divisor
function gcd(a: bigint, b: bigint): bigint {
    return b === 0n ? a : gcd(b, a % b);
}

// Helper function for modular multiplicative inverse
function modInverse(e: bigint, phi: bigint): bigint {
    let [m0, y, x] = [phi, 0n, 1n];

    if (phi === 1n) return 0n;

    while (e > 1n) {
        let q = e / m0;
        [e, m0] = [m0, e % m0];
        [x, y] = [y, x - q * y];
    }

    if (x < 0n) x += phi;

    return x;
}


// Simple primality test (not for production)
function isPrime(num: bigint): boolean {
    if (num <= 1n) return false;
    if (num <= 3n) return true;
    if (num % 2n === 0n || num % 3n === 0n) return false;
    for (let i = 5n; i * i <= num; i = i + 6n) {
        if (num % i === 0n || num % (i + 2n) === 0n) return false;
    }
    return true;
}

function generatePrime(bits: number): bigint {
    const min = 1n << BigInt(bits - 1);
    const max = (1n << BigInt(bits)) - 1n;
    
    while (true) {
        let p = BigInt(Math.floor(Math.random() * Number(max-min+1n))) + min;
        if (p % 2n === 0n) p++; // Ensure odd
        if (isPrime(p)) {
            return p;
        }
    }
}

export interface RsaKeys {
    publicKey: { e: string; n: string; };
    privateKey: { d: string; n: string; };
}

export function generateRsaKeys(bits: number = 16): RsaKeys {
    const p = generatePrime(bits);
    const q = generatePrime(bits);
    
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);

    let e = 65537n; // Common choice for e
    while (gcd(e, phi) !== 1n) {
        e += 2n;
    }
    
    const d = modInverse(e, phi);

    return {
        publicKey: { e: e.toString(), n: n.toString() },
        privateKey: { d: d.toString(), n: n.toString() }
    };
}

export function rsaEncrypt(text: string, eStr: string, nStr: string): string {
    if (!eStr || !nStr) throw new Error("Public key is missing.");
    const e = BigInt(eStr);
    const n = BigInt(nStr);
    
    const encryptedChars = text.split('').map(char => {
        const charCode = BigInt(char.charCodeAt(0));
        if (charCode >= n) {
            throw new Error(`Character code ${charCode} is too large for the given key size (n=${n}). Please generate larger keys.`);
        }
        return modPow(charCode, e, n).toString();
    });

    return encryptedChars.join('.');
}

export function rsaDecrypt(cipher: string, dStr: string, nStr: string): string {
    if (!dStr || !nStr) throw new Error("Private key is missing.");
    const d = BigInt(dStr);
    const n = BigInt(nStr);

    const decryptedChars = cipher.split('.').map(part => {
        if (part === '') return '';
        const charCodeBigInt = BigInt(part);
        const decryptedCode = modPow(charCodeBigInt, d, n);
        return String.fromCharCode(Number(decryptedCode));
    });

    return decryptedChars.join('');
}
