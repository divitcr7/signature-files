import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RawRow = {
  amName: string;
  month: string;
  netRetention: number;
  grossRetention: number;
  renewalPremium: number;
  lostPremium: number;
  newBizPremium: number;
  policyCountStart: number;
  policyCountEnd: number;
};

function parseWorkbook(filePath: string): RawRow[] {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

  return rows.map((row): RawRow => ({
    amName: String(row['amName'] ?? row['AM'] ?? '').trim(),
    month: String(row['month'] ?? row['Month'] ?? '').trim(),
    netRetention: Number(row['netRetention'] ?? row['NetRetention'] ?? 0),
    grossRetention: Number(row['grossRetention'] ?? row['GrossRetention'] ?? 0),
    renewalPremium: Number(row['renewalPremium'] ?? row['RenewalPremium'] ?? 0),
    lostPremium: Number(row['lostPremium'] ?? row['LostPremium'] ?? 0),
    newBizPremium: Number(row['newBizPremium'] ?? row['NewBizPremium'] ?? 0),
    policyCountStart: Number(row['policyCountStart'] ?? row['PolicyStart'] ?? 0),
    policyCountEnd: Number(row['policyCountEnd'] ?? row['PolicyEnd'] ?? 0)
  }));
}

async function run() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: pnpm import:excel ./path/to/file.xlsx');
    process.exit(1);
  }

  const resolved = path.resolve(fileArg);
  if (!fs.existsSync(resolved)) {
    console.error('File does not exist:', resolved);
    process.exit(1);
  }

  const rows = parseWorkbook(resolved);
  for (const row of rows) {
    if (!row.amName || !row.month) continue;
    await prisma.metricMonthly.upsert({
      where: { amName_month: { amName: row.amName, month: row.month } },
      update: { ...row },
      create: { ...row }
    });
  }
  console.log(`Imported ${rows.length} rows from ${resolved}`);
}

run()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
