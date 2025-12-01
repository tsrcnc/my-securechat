import dns from 'dns/promises';

/**
 * Generate DNS TXT record format for domain verification
 */
export function generateVerificationRecord(domain: string, token: string) {
    return {
        type: 'TXT',
        name: `_my-securechat-verification.${domain}`,
        value: token,
        instructions: `Add this TXT record to your DNS settings for ${domain}:

Host/Name: _my-securechat-verification
Type: TXT
Value: ${token}
TTL: 3600 (or Auto)

Note: DNS changes may take up to 24 hours to propagate, but usually complete within 1-2 hours.`
    };
}

/**
 * Verify domain ownership via DNS TXT record
 * @param domain - Domain name to verify (e.g., "example.com")
 * @param expectedToken - Verification token to match
 * @returns Promise<boolean> - true if verification successful
 */
export async function verifyDomainDNS(
    domain: string,
    expectedToken: string
): Promise<boolean> {
    try {
        const recordName = `_my-securechat-verification.${domain}`;
        console.log(`[DEBUG] Resolving TXT for: "${recordName}"`);

        // Resolve TXT records for the verification subdomain
        const txtRecords = await dns.resolveTxt(recordName);

        // Check if any TXT record matches the expected token
        // TXT records are returned as arrays of strings, we need to join them
        const isVerified = txtRecords.some(record => {
            const recordValue = record.join('');
            return recordValue === expectedToken;
        });

        if (isVerified) {
            console.log(`✓ Domain ${domain} verified successfully`);
        } else {
            console.log(`✗ Domain ${domain} verification failed - token mismatch`);
        }

        return isVerified;
    } catch (error: any) {
        // DNS lookup errors (ENOTFOUND, ENODATA, etc.)
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            console.log(`✗ Domain ${domain} verification failed - TXT record not found`);
        } else {
            console.error(`DNS verification error for ${domain}:`, error);
        }
        return false;
    }
}

/**
 * Check multiple verification methods
 * Currently only DNS, but can be extended for manual verification
 */
export async function verifyDomain(
    domain: string,
    token: string,
    method: 'DNS' | 'MANUAL' = 'DNS'
): Promise<{ verified: boolean; method: string; details?: string }> {
    if (method === 'DNS') {
        const verified = await verifyDomainDNS(domain, token);
        return {
            verified,
            method: 'DNS',
            details: verified
                ? `DNS TXT record found and verified`
                : `DNS TXT record not found or token mismatch`
        };
    }

    // Manual verification would be handled by admin panel
    return {
        verified: false,
        method: 'MANUAL',
        details: 'Manual verification requires admin approval'
    };
}
