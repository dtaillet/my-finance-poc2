export type OfxTransaction = {
  fitid: string;
  accountId: string;
  accountType: string;
  dtposted: string;
  trnamt: number;
  name: string;
  memo: string;
  currency: string;
};

// Detects the OFX (Open Financial Exchange) format from its header or root tag.
export function isOfx(content: string): boolean {
  const head = content.slice(0, 2048).toUpperCase();
  return head.includes('OFXHEADER') || head.includes('<OFX>');
}

// Converts an OFX date (YYYYMMDD or YYYYMMDDHHMMSS[...]) to YYYY-MM-DD.
function toIsoDate(value: string): string {
  const digits = value.slice(0, 8);
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

// Parses OFX SGML content and returns the list of statement transactions.
export function parseOfx(content: string): OfxTransaction[] {
  const transactions: OfxTransaction[] = [];

  let currency = '';
  let accountId = '';
  let accountType = '';
  let current: Partial<OfxTransaction> | null = null;

  for (const raw of content.split(/\r?\n/)) {
    const match = raw.trim().match(/^<(\/?[A-Za-z0-9.]+)>(.*)$/);
    if (!match) continue;

    const tag = match[1].toUpperCase();
    const value = match[2].trim();

    switch (tag) {
      case 'CURDEF':
        currency = value;
        break;
      case 'CCACCTFROM':
        accountType = 'CREDITCARD';
        break;
      case 'ACCTID':
        accountId = value;
        break;
      case 'ACCTTYPE':
        accountType = value;
        break;
      case 'STMTTRN':
        current = {};
        break;
      case 'DTPOSTED':
        if (current) current.dtposted = toIsoDate(value);
        break;
      case 'TRNAMT':
        if (current) current.trnamt = Number(value);
        break;
      case 'FITID':
        if (current) current.fitid = value;
        break;
      case 'NAME':
        if (current) current.name = value;
        break;
      case 'MEMO':
        if (current) current.memo = value;
        break;
      case '/STMTTRN':
        if (current && current.fitid) {
          transactions.push({
            fitid: current.fitid,
            accountId,
            accountType,
            dtposted: current.dtposted ?? '',
            trnamt: current.trnamt ?? 0,
            name: current.name ?? '',
            memo: current.memo ?? '',
            currency,
          });
        }
        current = null;
        break;
    }
  }

  return transactions;
}
