const fs = require('fs');
const readline = require('readline');
const path = require('path');

function convertCopyToInserts(copyHeader, dataLines) {
  const match = copyHeader.match(/^COPY\s+([^\s]+)\s*\(([^\)]+)\)/i);
  if (!match) return [];
  const table = match[1];
  const columns = match[2].split(',').map(c => c.trim());
  
  let conflictClause = '';
  if (table.toLowerCase() === 'auth.users' || table.toLowerCase() === 'auth.identities') {
    conflictClause = ' ON CONFLICT (id) DO NOTHING';
  }

  const inserts = [];
  for (const line of dataLines) {
    if (line.trim() === '\\.' || line.trim() === '') continue;
    const values = line.split('\t');
    
    if (values.length !== columns.length) {
      console.warn(`Value count mismatch for ${table}: expected ${columns.length}, got ${values.length}`);
    }

    const sqlValues = values.map(val => {
      if (val === '\\N') return 'NULL';
      let unescaped = val.replace(/\\n/g, '\n')
                         .replace(/\\r/g, '\r')
                         .replace(/\\t/g, '\t')
                         .replace(/\\\\/g, '\\');
      const escaped = unescaped.replace(/'/g, "''");
      return `'${escaped}'`;
    });
    
    inserts.push(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${sqlValues.join(', ')})${conflictClause};`);
  }
  return inserts;
}

async function cleanBackup() {
  const inputFile = path.join(__dirname, 'db_cluster-26-01-2026@19-49-35.backup');
  const outputFile = path.join(__dirname, 'migrations', '20260716000000_restore_backup.sql');

  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const migrationsDir = path.join(__dirname);
  const migrationsPath = path.join(migrationsDir, 'migrations');
  if (!fs.existsSync(migrationsPath)) {
    fs.mkdirSync(migrationsPath, { recursive: true });
  }

  const outStream = fs.createWriteStream(outputFile);

  let inCopyBlock = false;
  let skipCopyBlock = false;
  let currentCopyTable = null; // 'users', 'identities', or 'other'
  let currentCopyLines = [];

  let usersCopyBlock = [];
  let identitiesCopyBlock = [];
  let otherCopyBlocks = [];
  let copyBlocksFlushed = false;

  let inSystemDDLBlock = false;
  let systemDDLType = ''; // 'function' or 'other'
  let activeDelimiter = ''; // The exact dollar quoting tag, e.g. '$$' or '$_$'

  let inConstraintBlock = false;
  let currentConstraintLines = [];
  const constraintStatementsArray = [];

  const systemSchemas = ['auth', 'storage', 'vault', 'extensions', 'graphql', 'realtime', 'cron', 'net', 'pgmq', 'graphql_public', 'pgbouncer'];

  function flushCopyBlocks() {
    if (copyBlocksFlushed) return;
    console.log('Converting and flushing buffered COPY blocks in correct foreign key order...');
    
    // 1. Write users
    if (usersCopyBlock.length > 0) {
      const inserts = convertCopyToInserts(usersCopyBlock[0], usersCopyBlock.slice(1));
      for (const sql of inserts) {
        outStream.write(sql + '\n');
      }
    }
    // 2. Write identities
    if (identitiesCopyBlock.length > 0) {
      const realInserts = convertCopyToInserts(identitiesCopyBlock[0], identitiesCopyBlock.slice(1));
      for (const sql of realInserts) {
        outStream.write(sql + '\n');
      }
    }
    // 3. Write other tables (public tables)
    if (otherCopyBlocks.length > 0) {
      let currentHeader = '';
      let currentLines = [];
      for (const line of otherCopyBlocks) {
        if (line.startsWith('COPY ')) {
          if (currentHeader) {
            const inserts = convertCopyToInserts(currentHeader, currentLines);
            for (const sql of inserts) {
              outStream.write(sql + '\n');
            }
          }
          currentHeader = line;
          currentLines = [];
        } else {
          currentLines.push(line);
        }
      }
      if (currentHeader) {
        const inserts = convertCopyToInserts(currentHeader, currentLines);
        for (const sql of inserts) {
          outStream.write(sql + '\n');
        }
      }
    }
    
    copyBlocksFlushed = true;
  }

  for await (let line of rl) {
    // Normalize suffix to lowercase _1emaet
    line = line.replace(/_1emaet/gi, '_1emaet');

    const lowerLine = line.toLowerCase().trim();

    // Handle COPY blocks
    if (inCopyBlock) {
      if (line.trim() === '\\.') {
        inCopyBlock = false;
        if (!skipCopyBlock) {
          currentCopyLines.push(line);
          if (currentCopyTable === 'users') {
            usersCopyBlock = currentCopyLines;
          } else if (currentCopyTable === 'identities') {
            identitiesCopyBlock = currentCopyLines;
          } else {
            otherCopyBlocks.push(...currentCopyLines);
          }
        }
        continue;
      }
      if (!skipCopyBlock) {
        currentCopyLines.push(line);
      }
      continue;
    }

    if (line.startsWith('COPY ')) {
      inCopyBlock = true;
      const match = line.match(/^COPY\s+([^\s\.]+)\.([^\s\(]+)/);
      if (match) {
        const schema = match[1];
        const table = match[2];
        if (schema === 'public' || (schema === 'auth' && (table === 'users' || table === 'identities'))) {
          skipCopyBlock = false;
          if (schema === 'auth' && table === 'users') {
            currentCopyTable = 'users';
          } else if (schema === 'auth' && table === 'identities') {
            currentCopyTable = 'identities';
          } else {
            currentCopyTable = 'other';
          }
          currentCopyLines = [line];
        } else {
          skipCopyBlock = true;
        }
      } else {
        skipCopyBlock = false;
        currentCopyTable = 'other';
        currentCopyLines = [line];
      }
      continue;
    }

    // Handle multi-line system DDL block skipping
    if (inSystemDDLBlock) {
      if (systemDDLType === 'function') {
        if (!activeDelimiter) {
          const delimiterMatch = line.match(/\$[^\$]*\$/);
          if (delimiterMatch) {
            activeDelimiter = delimiterMatch[0];
          }
        }

        if (activeDelimiter) {
          const isStartOfBody = lowerLine.includes('as ' + activeDelimiter.toLowerCase());
          if (!isStartOfBody) {
            if (lowerLine.endsWith(activeDelimiter.toLowerCase() + ';') || lowerLine === activeDelimiter.toLowerCase()) {
              inSystemDDLBlock = false;
              activeDelimiter = '';
            }
          }
        } else {
          if (/^\$\w*\$;?$/.test(lowerLine)) {
            inSystemDDLBlock = false;
          }
        }
      } else {
        if (lowerLine.endsWith(');') || lowerLine.endsWith(';')) {
          inSystemDDLBlock = false;
        }
      }
      continue;
    }

    // Skip all slash commands (psql directives like \connect, \restrict, \set etc.)
    if (line.trim().startsWith('\\')) {
      continue;
    }

    // Skip publications (they are system-managed in Supabase)
    if (lowerLine.startsWith('create publication ') || lowerLine.startsWith('alter publication ')) {
      continue;
    }

    // Skip event triggers (unsupported/restricted on Supabase managed instances)
    if (lowerLine.startsWith('create event trigger ') || lowerLine.startsWith('alter event trigger ') || lowerLine.startsWith('drop event trigger ')) {
      if (!lowerLine.endsWith(';')) {
        inSystemDDLBlock = true;
        systemDDLType = 'other';
      }
      continue;
    }

    // Skip any ALTER, COMMENT, DROP, CREATE statement that references system schemas
    const containsSystemSchemaRef = systemSchemas.some(schema => 
      lowerLine.includes(` ${schema}.`) || lowerLine.includes(`(${schema}.`) || lowerLine.includes(` ${schema}_`) || lowerLine.includes(`schema ${schema}`)
    );
    const isDDLCommand = /^(alter|comment|drop|create|select)\s+/i.test(lowerLine);

    if (isDDLCommand && containsSystemSchemaRef) {
      if (!lowerLine.endsWith(';')) {
        inSystemDDLBlock = true;
        if (lowerLine.includes('function') || lowerLine.includes('trigger') || lowerLine.includes('procedure')) {
          systemDDLType = 'function';
          const delimiterMatch = line.match(/\$[^\$]*\$/);
          if (delimiterMatch) {
            activeDelimiter = delimiterMatch[0];
          } else {
            activeDelimiter = '';
          }
        } else {
          systemDDLType = 'other';
          activeDelimiter = '';
        }
      }
      continue;
    }

    // Collect ALTER TABLE ONLY statements for public schema to defer them
    if (inConstraintBlock) {
      currentConstraintLines.push(line);
      if (lowerLine.endsWith(';')) {
        inConstraintBlock = false;
        constraintStatementsArray.push(currentConstraintLines.join('\n') + '\n');
      }
      continue;
    }

    if (lowerLine.startsWith('alter table only ')) {
      if (lowerLine.endsWith(';')) {
        constraintStatementsArray.push(line + '\n');
      } else {
        inConstraintBlock = true;
        currentConstraintLines = [line];
      }
      continue;
    }

    // Skip role creations, modifications, and permissions
    if (lowerLine.startsWith('create role') || lowerLine.startsWith('alter role') || lowerLine.startsWith('drop role')) {
      continue;
    }
    if (lowerLine.startsWith('grant ') || lowerLine.startsWith('revoke ')) {
      continue;
    }

    // Skip all schema creations (public and system schemas already exist)
    if (lowerLine.startsWith('create schema ')) {
      continue;
    }

    // Skip ALTER DEFAULT PRIVILEGES completely
    if (lowerLine.includes('alter default privileges')) {
      continue;
    }

    // Skip extensions DDL completely
    if (lowerLine.includes('create extension') || lowerLine.includes('comment on extension') || lowerLine.includes('drop extension')) {
      continue;
    }

    // Also skip settings for system roles
    if (/^alter\s+role\s+\w+\s+set\s+/i.test(lowerLine)) {
      continue;
    }

    // If it passes all filters, write to the output file
    outStream.write(line + '\n');
  }

  // Final flush of copy blocks
  flushCopyBlocks();

  // Now write all deferred ALTER TABLE ONLY constraint statements at the very end
  console.log(`Writing ${constraintStatementsArray.length} deferred ALTER TABLE constraints...`);
  for (const statement of constraintStatementsArray) {
    outStream.write(statement + '\n');
  }

  outStream.end();
  console.log('Cleaned backup file written to migrations folder.');
}

cleanBackup();
