import fs from 'node:fs';
import path from 'node:path';
const FILE = '.agentflow/sandbox.json';
const COMMAND = 'agentflow-app deploy --sandbox';
const isRec = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const filled = (value) => typeof value === 'string' && value !== '';
function shaped(value) {
    if (!isRec(value) || value.version !== 1)
        return false;
    if (!filled(value.url) || !filled(value.id) || !filled(value.owner))
        return false;
    const people = value.people;
    if (!isRec(people) || !Object.values(people).every((p) => isRec(p) && filled(p.user_id) && filled(p.token)))
        return false;
    return value.installation === null || isRec(value.installation);
}
export function readSandbox(dir) {
    const base = dir ?? process.cwd();
    const file = path.join(base, FILE);
    let raw;
    try {
        raw = fs.readFileSync(file, 'utf8');
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`no ${FILE} in ${base}: run ${COMMAND} first`);
        }
        throw error;
    }
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        parsed = undefined;
    }
    if (!shaped(parsed)) {
        const version = isRec(parsed) ? String(parsed.version) : 'unknown';
        throw new Error(`${file} is not a sandbox file this SDK reads (version ${version}): run ${COMMAND} with this SDK's CLI`);
    }
    return parsed;
}
//# sourceMappingURL=sandbox-file.js.map