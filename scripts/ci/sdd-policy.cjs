'use strict';

const FEATURE_ID = /^[1-9][0-9]*-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const STATUS_CONTEXT = 'SDD / Feature gate';
const BRANCHES = new Set(['main', 'develop']);

function parseFeatureDescription(body) {
  const start = '<!-- sdd-feature:start -->';
  const end = '<!-- sdd-feature:end -->';
  if (typeof body !== 'string' || body.split(start).length !== 2 || body.split(end).length !== 2) {
    throw new Error('La descripción de la PR debe contener exactamente un bloque sdd-feature.');
  }
  const block = body.slice(body.indexOf(start) + start.length, body.indexOf(end)).trim();
  const match = /^```json\s*\n([\s\S]*?)\n```$/.exec(block);
  if (!match) throw new Error('El bloque sdd-feature debe ser un único bloque JSON.');
  let data;
  try { data = JSON.parse(match[1]); } catch { throw new Error('JSON de feature inválido.'); }
  if (!data || Array.isArray(data) || data.schema_version !== 1 || typeof data.feature_id !== 'string' || !FEATURE_ID.test(data.feature_id)) {
    throw new Error('schema_version o feature_id inválido; reemplaza los placeholders.');
  }
  if (data.feature_status !== 'archived' || data.required_review_state !== 'APPROVED') {
    throw new Error('El contrato exige feature_status archived y required_review_state APPROVED.');
  }
  return data;
}

function assertArchivedFeature(metadata, state) {
  if (!state || state.schema_version !== 1 || state.feature_id !== metadata.feature_id) {
    throw new Error('El state.json no coincide con la feature declarada.');
  }
  if (state.status !== 'archived' || state.operation?.command !== 'archive' || state.operation?.phase !== 'complete') {
    throw new Error('La feature aún no está archivada por completo.');
  }
  if (state.verification?.status !== 'pass') throw new Error('La feature no tiene verificación pass.');
}

function reviewDecisions(reviews) {
  const latest = new Map();
  const ordered = [...reviews].sort((a, b) => a.id - b.id);
  for (const review of ordered) {
    if (review.user?.type !== 'User' || !['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state)) continue;
    latest.set(review.user.id, review);
  }
  return [...latest.values()];
}

async function evaluate({ github, repo, pr }) {
  if (pr.draft) throw new Error('La PR está en draft.');
  const metadata = parseFeatureDescription(pr.body);
  const { data: file } = await github.rest.repos.getContent({
    owner: pr.head.repo.owner.login,
    repo: pr.head.repo.name,
    path: `sdd/features/${metadata.feature_id}/state.json`,
    ref: pr.head.sha,
  });
  if (Array.isArray(file) || file.type !== 'file' || file.encoding !== 'base64' || !file.content) {
    throw new Error('No se pudo leer un state.json válido del commit de la PR.');
  }
  let state;
  try { state = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')); }
  catch { throw new Error('El state.json no contiene JSON válido.'); }
  assertArchivedFeature(metadata, state);

  const reviews = await github.paginate(github.rest.pulls.listReviews, {
    ...repo, pull_number: pr.number, per_page: 100,
  });
  let approved = false;
  for (const review of reviewDecisions(reviews)) {
    if (review.user.id === pr.user.id) continue;
    const { data } = await github.rest.repos.getCollaboratorPermissionLevel({
      ...repo, username: review.user.login,
    });
    if (!['write', 'maintain', 'admin'].includes(data.permission)) continue;
    if (review.state === 'CHANGES_REQUESTED') throw new Error('Hay una revisión vigente que solicita cambios.');
    if (review.state === 'APPROVED' && review.commit_id === pr.head.sha) approved = true;
  }
  if (!approved) throw new Error('Falta un Approve de un colaborador sobre el commit actual.');
  return metadata.feature_id;
}

async function run({ github, context, core }) {
  const repo = context.repo;
  const pulls = await github.paginate(github.rest.pulls.list, { ...repo, state: 'open', per_page: 100 });
  const groups = new Map();
  const target_url = `${context.serverUrl}/${repo.owner}/${repo.repo}/actions/runs/${context.runId}`;
  const results = [];
  for (const item of pulls.filter(p => BRANCHES.has(p.base.ref))) {
    const { data: pr } = await github.rest.pulls.get({ ...repo, pull_number: item.number });
    if (pr.state !== 'open' || !BRANCHES.has(pr.base.ref)) continue;
    const sha = pr.head.sha;
    if (!groups.has(sha)) {
      groups.set(sha, []);
      await github.rest.repos.createCommitStatus({ ...repo, sha, context: STATUS_CONTEXT, state: 'pending', description: 'Validando feature y aprobación de PR.', target_url });
    }
    let result;
    try {
      const feature = await evaluate({ github, repo, pr });
      const { data: current } = await github.rest.pulls.get({ ...repo, pull_number: pr.number });
      if (current.head.sha !== sha || current.state !== 'open') throw new Error('La PR cambió durante la comprobación; requiere reevaluación.');
      result = { number: pr.number, ok: true, message: `${feature}: archivada y aprobada.` };
    } catch (error) {
      result = { number: pr.number, ok: false, message: error.status === 404 ? 'No se encontró la feature archivada en el commit de la PR.' : error.message };
    }
    groups.get(sha).push(result);
    results.push(result);
  }
  for (const [sha, entries] of groups) {
    // A commit status is shared by PRs with the same SHA. All must pass.
    const failure = entries.find(r => !r.ok);
    const description = failure ? `PR #${failure.number}: ${failure.message}` : 'Features archivadas y PRs aprobadas.';
    await github.rest.repos.createCommitStatus({ ...repo, sha, context: STATUS_CONTEXT, state: failure ? 'failure' : 'success', description: description.slice(0, 140), target_url });
  }
  core.summary.addHeading('Validación SDD').addTable([
    [{ data: 'PR', header: true }, { data: 'Resultado', header: true }],
    ...results.map(r => [`#${r.number}`, r.message]),
  ]);
  await core.summary.write();
  const triggeredPrNumber = context.payload?.pull_request?.number;
  const triggeredPr = results.find(r => r.number === triggeredPrNumber);
  if (triggeredPr && !triggeredPr.ok) {
    core.setFailed(`PR #${triggeredPr.number} no cumple el contrato SDD: ${triggeredPr.message}`);
  }
}

module.exports = { parseFeatureDescription, assertArchivedFeature, reviewDecisions, evaluate, run };
